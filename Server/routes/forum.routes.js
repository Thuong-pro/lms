import { Router } from 'express';
import {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllThreads,
    getThreadsByCategory,
    getThread,
    createThread,
    updateThread,
    deleteThread,
    pinThread,
    unpinThread,
    closeThread,
    searchThreads,
    createReply,
    getReplies,
    getNestedReplies,
    updateReply,
    deleteReply,
    markAcceptedAnswer,
    voteReply,
    voteThread
} from '../controllers/forum.controller.js';
import { isLoggedIn, isAdmin } from '../middlewares/auth.middlewares.js';
import {
    isThreadAuthor,
    checkThreadClosed,
    incrementThreadViews,
    updateThreadActivity
} from '../middlewares/forumAuth.middleware.js';

const router = Router();

// ==================== CATEGORY ROUTES ====================

/**
 * @route GET /categories
 * @description Get all forum categories
 * @access Public
 */
router.get('/categories', getAllCategories);

/**
 * @route GET /categories/:categoryId
 * @description Get single category details
 * @access Public
 */
router.get('/categories/:categoryId', getCategory);

/**
 * @route POST /categories
 * @description Create new category (admin only)
 * @access Private - Admin only
 */
router.post('/categories', isLoggedIn, isAdmin, createCategory);

/**
 * @route PUT /categories/:categoryId
 * @description Update category (admin only)
 * @access Private - Admin only
 */
router.put('/categories/:categoryId', isLoggedIn, isAdmin, updateCategory);

/**
 * @route DELETE /categories/:categoryId
 * @description Delete category (admin only)
 * @access Private - Admin only
 */
router.delete('/categories/:categoryId', isLoggedIn, isAdmin, deleteCategory);

// ==================== THREAD ROUTES ====================

/**
 * @route GET /threads
 * @description Get all threads (with pagination)
 * @access Public
 */
router.get('/threads', getAllThreads);

/**
 * @route GET /threads/search
 * @description Search threads by keywords
 * @access Public
 */
router.get('/threads/search', searchThreads);

/**
 * @route GET /category/:categoryId/threads
 * @description Get all threads in a category
 * @access Public
 */
router.get('/category/:categoryId/threads', getThreadsByCategory);

/**
 * @route GET /threads/:threadId
 * @description Get single thread with replies (increments views)
 * @access Public
 */
router.get('/threads/:threadId', incrementThreadViews, getThread);

/**
 * @route POST /threads
 * @description Create new thread
 * @access Private - Logged in users
 */
router.post('/threads', isLoggedIn, createThread);

/**
 * @route PUT /threads/:threadId
 * @description Update thread (author/admin only)
 * @access Private - Thread author or Admin
 */
router.put('/threads/:threadId', isLoggedIn, updateThread);

/**
 * @route DELETE /threads/:threadId
 * @description Delete thread (author/admin only)
 * @access Private - Thread author or Admin
 */
router.delete('/threads/:threadId', isLoggedIn, deleteThread);

/**
 * @route POST /threads/:threadId/pin
 * @description Pin thread to top (admin only)
 * @access Private - Admin only
 */
router.post('/threads/:threadId/pin', isLoggedIn, isAdmin, pinThread);

/**
 * @route POST /threads/:threadId/unpin
 * @description Unpin thread (admin only)
 * @access Private - Admin only
 */
router.post('/threads/:threadId/unpin', isLoggedIn, isAdmin, unpinThread);

/**
 * @route POST /threads/:threadId/close
 * @description Close thread (author/admin only)
 * @access Private - Thread author or Admin
 */
router.post('/threads/:threadId/close', isLoggedIn, closeThread);

/**
 * @route POST /threads/:threadId/vote
 * @description Upvote or downvote thread
 * @access Private - Logged in users
 */
router.post('/threads/:threadId/vote', isLoggedIn, voteThread);

// ==================== REPLY ROUTES ====================

/**
 * @route GET /threads/:threadId/replies
 * @description Get all replies for a thread
 * @access Public
 */
router.get('/threads/:threadId/replies', getReplies);

/**
 * @route GET /replies/:replyId/nested
 * @description Get nested replies for a reply
 * @access Public
 */
router.get('/replies/:replyId/nested', getNestedReplies);

/**
 * @route POST /threads/:threadId/replies
 * @description Create reply on thread (supports nested)
 * @access Private - Logged in users
 */
router.post('/threads/:threadId/replies', isLoggedIn, checkThreadClosed, updateThreadActivity, createReply);

/**
 * @route PUT /replies/:replyId
 * @description Update reply (author/admin only)
 * @access Private - Reply author or Admin
 */
router.put('/replies/:replyId', isLoggedIn, updateReply);

/**
 * @route DELETE /replies/:replyId
 * @description Delete reply (author/admin only)
 * @access Private - Reply author or Admin
 */
router.delete('/replies/:replyId', isLoggedIn, deleteReply);

/**
 * @route POST /replies/:replyId/accept
 * @description Mark reply as accepted answer (thread author/admin only)
 * @access Private - Thread author or Admin
 */
router.post('/replies/:replyId/accept', isLoggedIn, markAcceptedAnswer);

/**
 * @route POST /replies/:replyId/vote
 * @description Upvote or downvote reply
 * @access Private - Logged in users
 */
router.post('/replies/:replyId/vote', isLoggedIn, voteReply);

export default router;
