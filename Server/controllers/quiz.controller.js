import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Quiz from '../models/quiz.model.js';
import Question from '../models/question.model.js';
import QuizSubmission from '../models/quizSubmission.model.js';
import Course from '../models/course.model.js';
import AppError from '../utils/error.util.js';

/**
 * @CREATE_QUIZ - Teacher creates a new quiz for a course
 */
export const createQuiz = asyncHandler(async (req, res, next) => {
    try {
        const { title, description, courseId, passingScore, timeLimit } = req.body;
        const userId = req.user.id;

        if (!title || !description || !courseId || passingScore === undefined || !timeLimit) {
            return next(new AppError('All fields are required', 400));
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        if (course.teacherId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only create quiz for your own courses', 403));
        }

        const quiz = await Quiz.create({
            title,
            description,
            courseId,
            passingScore,
            timeLimit,
            createdBy: userId,
            isActive: true
        });

        if (!quiz) {
            return next(new AppError('Quiz creation failed', 500));
        }

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_QUIZ - Get quiz details with questions
 */
export const getQuiz = asyncHandler(async (req, res, next) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId)
            .populate('questions')
            .populate('createdBy', 'fullName email');

        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Quiz details fetched',
            quiz
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_QUIZ_FOR_ATTEMPT - Get quiz for student attempt (without answers)
 */
export const getQuizForAttempt = asyncHandler(async (req, res, next) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId)
            .populate({
                path: 'questions',
                // SỬA Ở ĐÂY: Xóa chữ -correctAnswer đi, chỉ liệt kê những gì muốn học sinh thấy
                select: 'questionText options difficulty explanation' 
            })
            .populate('createdBy', 'fullName');

        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (!quiz.isActive) {
            return next(new AppError('This quiz is not available', 400));
        }

        res.status(200).json({
            success: true,
            message: 'Quiz loaded for attempt',
            quiz,
            timeLimit: quiz.timeLimit
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UPDATE_QUIZ - Teacher updates quiz
 */
export const updateQuiz = asyncHandler(async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { title, description, passingScore, timeLimit, isActive } = req.body;
        const userId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (quiz.createdBy.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only update your own quizzes', 403));
        }

        if (title) quiz.title = title;
        if (description) quiz.description = description;
        if (passingScore !== undefined) quiz.passingScore = passingScore;
        if (timeLimit) quiz.timeLimit = timeLimit;
        if (isActive !== undefined) quiz.isActive = isActive;

        await quiz.save();

        res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            quiz
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @DELETE_QUIZ - Teacher deletes quiz
 */
export const deleteQuiz = asyncHandler(async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (quiz.createdBy.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only delete your own quizzes', 403));
        }

        await Question.deleteMany({ quizId });
        await QuizSubmission.deleteMany({ quizId });
        await Quiz.findByIdAndDelete(quizId);

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_QUIZZES_BY_COURSE - Get all quizzes for a course
 */
export const getQuizzesByCourse = asyncHandler(async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const quizzes = await Quiz.find({ courseId })
            .select('-questions')
            .populate('createdBy', 'fullName');

        res.status(200).json({
            success: true,
            message: 'Quizzes fetched successfully',
            quizzes,
            count: quizzes.length
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @SUBMIT_QUIZ - Student submits quiz answers (Auto-scoring)
 */
export const submitQuiz = asyncHandler(async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { answers, timeSpent } = req.body;
        const userId = req.user.id;

        if (!answers || !Array.isArray(answers)) {
            return next(new AppError('Answers must be an array', 400));
        }

        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (!quiz.isActive) {
            return next(new AppError('This quiz is not available', 400));
        }

        const course = await Course.findById(quiz.courseId);

        // Check if already submitted
        const existingSubmission = await QuizSubmission.findOne({ quizId, userId });
        if (existingSubmission) {
            return next(new AppError('You have already submitted this quiz', 400));
        }

        // Calculate score
        let totalScore = 0;
        const processedAnswers = [];

        for (const answer of answers) {
            const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
            
            if (!question) continue;

            const isCorrect = question.correctAnswer === answer.selectedAnswer;
            const score = isCorrect ? question.score : 0;
            totalScore += score;

            processedAnswers.push({
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect,
                score
            });
        }

        const percentage = Math.round((totalScore / quiz.totalMarks) * 100);
        const passed = percentage >= quiz.passingScore;

        const submission = await QuizSubmission.create({
            quizId,
            userId,
            courseId: quiz.courseId,
            answers: processedAnswers,
            score: totalScore,
            totalMarks: quiz.totalMarks,
            percentage,
            passed,
            timeSpent,
            status: 'graded'
        });

        res.status(201).json({
            success: true,
            message: 'Quiz submitted successfully',
            submission: {
                score: totalScore,
                totalMarks: quiz.totalMarks,
                percentage,
                passed,
                passingScore: quiz.passingScore,
                feedback: passed ? 'Congratulations! You passed the quiz!' : 'You did not pass. Please review and try again.'
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_QUIZ_RESULTS - Teacher views quiz submission results
 */
export const getQuizResults = asyncHandler(async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (quiz.createdBy.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only view results for your own quizzes', 403));
        }

        const submissions = await QuizSubmission.find({ quizId })
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        const stats = {
            totalAttempts: submissions.length,
            avgScore: submissions.length > 0 
                ? Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length)
                : 0,
            passedCount: submissions.filter(s => s.passed).length,
            failedCount: submissions.filter(s => !s.passed).length
        };

        res.status(200).json({
            success: true,
            message: 'Quiz results fetched',
            quiz: {
                title: quiz.title,
                totalQuestions: quiz.numberOfQuestions,
                passingScore: quiz.passingScore
            },
            submissions,
            stats
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_STUDENT_SUBMISSION - Get specific student submission
 */
export const getStudentSubmission = asyncHandler(async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.id;

        const submission = await QuizSubmission.findById(submissionId)
            .populate('userId', 'fullName email')
            .populate('quizId', 'title totalMarks')
            .populate({
                path: 'answers.questionId',
                select: 'questionText options correctAnswer explanation score'
            });

        if (!submission) {
            return next(new AppError('Submission not found', 404));
        }

        if (submission.userId._id.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You cannot view this submission', 403));
        }

        res.status(200).json({
            success: true,
            message: 'Submission details fetched',
            submission
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_STUDENT_QUIZZES - Get quizzes attempted by student
 */
export const getStudentQuizzes = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user.id;

        const submissions = await QuizSubmission.find({ userId })
            .populate({
                path: 'quizId',
                select: 'title courseId passingScore',
                populate: { path: 'courseId', select: 'title' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Your quiz attempts',
            submissions,
            count: submissions.length
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_STUDENT_SUBMISSIONS_FOR_TEACHER
 * Giáo viên xem lịch sử làm bài của một học sinh cụ thể
 */
export const getStudentSubmissionsForTeacher = asyncHandler(async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const teacherId = req.user.id;

        // Tìm tất cả bài nộp của học sinh này
        const submissions = await QuizSubmission.find({ userId: studentId })
            .populate({
                path: 'quizId',
                select: 'title passingScore courseId',
                populate: {
                    path: 'courseId',
                    match: { teacherId: teacherId }, // BẢO MẬT: Chỉ lấy những khóa học do ông giáo viên này dạy
                    select: 'title'
                }
            })
            .sort({ createdAt: -1 }); // Mới nhất xếp lên trên

        // Lọc bỏ những bài nộp thuộc khóa học của giáo viên khác (nếu có)
        const validSubmissions = submissions.filter(sub => sub.quizId && sub.quizId.courseId);

        res.status(200).json({
            success: true,
            message: 'Lấy lịch sử làm bài thành công',
            submissions: validSubmissions
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});