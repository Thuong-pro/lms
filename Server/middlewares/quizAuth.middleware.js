import Quiz from '../models/quiz.model.js';
import Course from '../models/course.model.js';
import AppError from '../utils/error.util.js';

/**
 * @isQuizCreator - Middleware to check if user created the quiz
 */
const isQuizCreator = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (quiz.createdBy.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only edit/delete quizzes you created', 403));
        }

        req.quiz = quiz;
        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

/**
 * @checkQuizBelongsToCourse - Middleware to verify quiz belongs to course
 */
const checkQuizBelongsToCourse = async (req, res, next) => {
    try {
        const { courseId, quizId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        if (quizId) {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                return next(new AppError('Quiz not found', 404));
            }

            if (quiz.courseId.toString() !== courseId) {
                return next(new AppError('Quiz does not belong to this course', 400));
            }

            req.quiz = quiz;
        }

        req.course = course;
        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

/**
 * @isTeacherOfCourse - Middleware to check if user is teacher of the course
 */
const isTeacherOfCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        if (course.teacherId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You are not the teacher of this course', 403));
        }

        req.course = course;
        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

/**
 * @checkQuizActive - Middleware to verify quiz is active before submission
 */
const checkQuizActive = async (req, res, next) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return next(new AppError('Quiz not found', 404));
        }

        if (!quiz.isActive) {
            return next(new AppError('This quiz is not available', 400));
        }

        req.quiz = quiz;
        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    isQuizCreator,
    checkQuizBelongsToCourse,
    isTeacherOfCourse,
    checkQuizActive
};
