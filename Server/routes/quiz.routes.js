import { Router } from 'express';
import {
    createQuiz,
    getQuiz,
    getQuizForAttempt,
    updateQuiz,
    deleteQuiz,
    getQuizzesByCourse,
    submitQuiz,
    getQuizResults,
    getStudentSubmission,
    getStudentQuizzes
} from '../controllers/quiz.controller.js';
import {
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestion,
    getQuizQuestions
} from '../controllers/question.controller.js';
import { isLoggedIn, isTeacher, isAdminOrTeacher } from '../middlewares/auth.middlewares.js';
import { isQuizCreator, checkQuizActive, isTeacherOfCourse, checkQuizBelongsToCourse } from '../middlewares/quizAuth.middleware.js';

const router = Router();

// ==================== QUIZ ROUTES ====================

/**
 * @route POST /create
 * @description Teacher creates a new quiz
 * @access Private - Teachers & Admins only
 */
router.post('/create', isLoggedIn, isAdminOrTeacher, createQuiz);

/**
 * @route GET /course/:courseId
 * @description Get all quizzes for a course
 * @access Public
 */
router.get('/course/:courseId', getQuizzesByCourse);



/**
 * @route GET /submission/:submissionId
 * @description Get specific student submission
 * @access Private - Student or Quiz creator
 */
router.get('/submission/:submissionId', isLoggedIn, getStudentSubmission);

/**
 * @route GET /my-quizzes
 * @description Get student's quiz attempts
 * @access Private - Logged in users
 */
router.get('/my-quizzes', isLoggedIn, getStudentQuizzes);

/**
 * @route GET /:quizId/attempt
 * @description Get quiz for student attempt (hides correct answers)
 * @access Private - Logged in users
 */
router.get('/:quizId/attempt', isLoggedIn, checkQuizActive, getQuizForAttempt);

/**
 * @route GET /:quizId/results
 * @description Teacher views all quiz submissions
 * @access Private - Quiz creator only
 */
router.get('/:quizId/results', isLoggedIn, isQuizCreator, getQuizResults);

/**
 * @route POST /:quizId/submit
 * @description Student submits quiz answers (Auto-scoring)
 * @access Private - Logged in users
 */
router.post('/:quizId/submit', isLoggedIn, checkQuizActive, submitQuiz);

/**
 * @route PUT /:quizId
 * @description Update quiz (teacher only)
 * @access Private - Quiz creator
 */
router.put('/:quizId', isLoggedIn, isQuizCreator, updateQuiz);

/**
 * @route DELETE /:quizId
 * @description Delete quiz (teacher only)
 * @access Private - Quiz creator
 */
router.delete('/:quizId', isLoggedIn, isQuizCreator, deleteQuiz);

/**
 * @route GET /:quizId
 * @description Get quiz details (with questions for teacher, without answers for students)
 * @access Private - Logged in users
 */
router.get('/:quizId', isLoggedIn, getQuiz);

// ==================== QUESTION ROUTES ====================

/**
 * @route POST /:quizId/question
 * @description Teacher adds question to quiz
 * @access Private - Quiz creator only
 */
router.post('/:quizId/question', isLoggedIn, isQuizCreator, addQuestion);

/**
 * @route GET /:quizId/questions
 * @description Get all questions in a quiz
 * @access Private - Logged in users
 */
router.get('/:quizId/questions', isLoggedIn, getQuizQuestions);

/**
 * @route PUT /question/:questionId
 * @description Update question
 * @access Private - Quiz creator only
 */
router.put('/question/:questionId', isLoggedIn, updateQuestion);

/**
 * @route DELETE /question/:questionId
 * @description Delete question
 * @access Private - Quiz creator only
 */
router.delete('/question/:questionId', isLoggedIn, deleteQuestion);

/**
 * @route GET /question/:questionId
 * @description Get single question
 * @access Private - Logged in users
 */
router.get('/question/:questionId', isLoggedIn, getQuestion);

export default router;
