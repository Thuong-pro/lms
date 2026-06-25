import ForumThread from '../models/forumThread.model.js';
import ForumReply from '../models/forumReply.model.js';
import AppError from '../utils/error.util.js';

/**
 * @isThreadAuthor - Middleware to check if user is the thread author
 * Ensures user can only edit/delete their own threads
 */
const isThreadAuthor = async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const userId = req.user.id;

        const thread = await ForumThread.findById(threadId);
        
        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        if (thread.authorId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only edit/delete your own threads', 403));
        }

        req.thread = thread;
        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

/**
 * @isReplyAuthor - Middleware to check if user is the reply author
 * Ensures user can only edit/delete their own replies
 */
const isReplyAuthor = async (req, res, next) => {
    try {
        const { replyId } = req.params;
        const userId = req.user.id;

        const reply = await ForumReply.findById(replyId);
        
        if (!reply) {
            return next(new AppError('Reply not found', 404));
        }

        if (reply.authorId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only edit/delete your own replies', 403));
        }

        req.reply = reply;
        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

/**
 * @checkThreadClosed - Middleware to check if thread is closed
 * Prevents adding replies to closed threads
 */
const checkThreadClosed = async (req, res, next) => {
    try {
        const { threadId } = req.params;

        const thread = await ForumThread.findById(threadId);
        
        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        if (thread.isClosed) {
            return next(new AppError('This thread is closed and cannot accept new replies', 400));
        }

        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

/**
 * @incrementThreadViews - Middleware to increment thread view count
 */
const incrementThreadViews = async (req, res, next) => {
    try {
        const { threadId } = req.params;

        await ForumThread.findByIdAndUpdate(
            threadId,
            { $inc: { views: 1 } },
            { new: true }
        );

        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

/**
 * @updateThreadActivity - Middleware to update lastActivityAt
 */
const updateThreadActivity = async (req, res, next) => {
    try {
        const { threadId } = req.params;

        await ForumThread.findByIdAndUpdate(
            threadId,
            { lastActivityAt: new Date() },
            { new: true }
        );

        next();
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    isThreadAuthor,
    isReplyAuthor,
    checkThreadClosed,
    incrementThreadViews,
    updateThreadActivity
};
