import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Question from '../models/question.model.js';
import Quiz from '../models/quiz.model.js';
import AppError from '../utils/error.util.js';

/**
 * @ADD_QUESTION - Teacher adds a question to quiz
 */
export const addQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { questionText, options, correctAnswer, score, explanation, difficulty } = req.body;
        const userId = req.user.id;

        if (!questionText || !options || !correctAnswer || score === undefined) {
            return next(new AppError('All fields are required', 400));
        }

        if (options.length !== 4) {
            return next(new AppError('Must provide exactly 4 options', 400));
        }

        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            return next(new AppError('Correct answer must be A, B, C, or D', 400));
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (quiz.createdBy.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only add questions to your own quizzes', 403));
        }

        const formattedOptions = options.map((text, index) => ({
            label: ['A', 'B', 'C', 'D'][index],
            text
        }));

        const question = await Question.create({
            quizId,
            questionText,
            options: formattedOptions,
            correctAnswer,
            score,
            explanation,
            difficulty: difficulty || 'medium'
        });

        // Update quiz
        quiz.questions.push(question._id);
        quiz.numberOfQuestions = quiz.questions.length;
        quiz.totalMarks += score;
        await quiz.save();

        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            question
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UPDATE_QUESTION - Teacher updates a question
 */
export const updateQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { questionText, options, correctAnswer, score, explanation, difficulty } = req.body;
        const userId = req.user.id;

        const question = await Question.findById(questionId);
        if (!question) {
            return next(new AppError('Question not found', 404));
        }

        const quiz = await Quiz.findById(question.quizId);
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (quiz.createdBy.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only update your own questions', 403));
        }

        let oldScore = question.score;
        
        if (questionText) question.questionText = questionText;
        if (options && options.length === 4) {
            question.options = options.map((text, index) => ({
                label: ['A', 'B', 'C', 'D'][index],
                text
            }));
        }
        if (correctAnswer && ['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            question.correctAnswer = correctAnswer;
        }
        if (score !== undefined) {
            question.score = score;
            quiz.totalMarks = quiz.totalMarks - oldScore + score;
        }
        if (explanation) question.explanation = explanation;
        if (difficulty) question.difficulty = difficulty;

        await question.save();
        await quiz.save();

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            question
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @DELETE_QUESTION - Teacher deletes a question
 */
export const deleteQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const userId = req.user.id;

        const question = await Question.findById(questionId);
        if (!question) {
            return next(new AppError('Question not found', 404));
        }

        const quiz = await Quiz.findById(question.quizId);
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (quiz.createdBy.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only delete your own questions', 403));
        }

        // Remove question from quiz
        quiz.questions = quiz.questions.filter(qId => qId.toString() !== questionId);
        quiz.numberOfQuestions = quiz.questions.length;
        quiz.totalMarks -= question.score;
        await quiz.save();

        await Question.findByIdAndDelete(questionId);

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_QUESTION - Get single question (with answer for teacher only)
 */
export const getQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const userId = req.user.id;

        const question = await Question.findById(questionId);
        if (!question) {
            return next(new AppError('Question not found', 404));
        }

        const quiz = await Quiz.findById(question.quizId);
        
        // If user is not teacher/admin, don't return correct answer
        if (quiz.createdBy.toString() !== userId && req.user.role !== 'ADMIN') {
            question.correctAnswer = undefined;
        }

        res.status(200).json({
            success: true,
            message: 'Question fetched',
            question
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_QUIZ_QUESTIONS - Get all questions in a quiz
 */
export const getQuizQuestions = asyncHandler(async (req, res, next) => {
    try {
        const { quizId } = req.params;

        const questions = await Question.find({ quizId });

        res.status(200).json({
            success: true,
            message: 'Questions fetched',
            questions,
            count: questions.length
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});
