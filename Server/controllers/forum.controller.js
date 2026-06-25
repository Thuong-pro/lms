import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import ForumCategory from '../models/forumCategory.model.js';
import ForumThread from '../models/forumThread.model.js';
import ForumReply from '../models/forumReply.model.js';
import AppError from '../utils/error.util.js';

// ==================== CATEGORY CONTROLLERS ====================

/**
 * @GET_ALL_CATEGORIES - Get all forum categories (auto-create defaults if none exist)
 */
export const getAllCategories = asyncHandler(async (req, res, next) => {
    try {
        let categories = await ForumCategory.find({ isActive: true })
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });

        // Auto-create default categories if none exist
        if (categories.length === 0) {
            const defaultCategories = [
                {
                    name: 'Thảo Luận Chung',
                    description: 'Thảo luận các chủ đề chung liên quan đến khóa học',
                    icon: '💬',
                    createdBy: null,
                    isActive: true
                },
                {
                    name: 'Hỏi & Đáp',
                    description: 'Đặt câu hỏi và nhận câu trả lời từ cộng đồng',
                    icon: '❓',
                    createdBy: null,
                    isActive: true
                },
                {
                    name: 'Chia Sẻ Tài Nguyên',
                    description: 'Chia sẻ tài liệu, code, và các nguồn học tập hữu ích',
                    icon: '📚',
                    createdBy: null,
                    isActive: true
                },
                {
                    name: 'Trưng Bày Công Việc',
                    description: 'Trưng bày các dự án và công việc của bạn',
                    icon: '🚀',
                    createdBy: null,
                    isActive: true
                }
            ];

            try {
                categories = await ForumCategory.insertMany(defaultCategories);
                console.log('✓ Default forum categories created:', categories.length);
            } catch (createErr) {
                console.error('Error creating default categories:', createErr.message);
                // Continue anyway - categories might already exist
            }
        }

        res.status(200).json({
            success: true,
            message: 'All categories fetched',
            categories,
            count: categories.length
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_CATEGORY - Get single category
 */
export const getCategory = asyncHandler(async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        const category = await ForumCategory.findById(categoryId)
            .populate('createdBy', 'fullName');

        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Category details',
            category
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @CREATE_CATEGORY - Admin creates category
 */
export const createCategory = asyncHandler(async (req, res, next) => {
    try {
        const { name, description, courseId, icon } = req.body;
        const userId = req.user.id;

        if (!name || !description) {
            return next(new AppError('Name and description are required', 400));
        }

        const category = await ForumCategory.create({
            name,
            description,
            courseId: courseId || null,
            icon: icon || '💬',
            createdBy: userId
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UPDATE_CATEGORY - Admin updates category
 */
export const updateCategory = asyncHandler(async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { name, description, icon, isActive } = req.body;

        const category = await ForumCategory.findById(categoryId);
        
        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        if (name) category.name = name;
        if (description) category.description = description;
        if (icon) category.icon = icon;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @DELETE_CATEGORY - Admin deletes category
 */
export const deleteCategory = asyncHandler(async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        const category = await ForumCategory.findById(categoryId);
        
        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        // Delete all threads in this category
        await ForumThread.deleteMany({ categoryId });

        await ForumCategory.findByIdAndDelete(categoryId);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

// ==================== THREAD CONTROLLERS ====================

/**
 * @GET_ALL_THREADS - Get all threads (with pagination)
 */
export const getAllThreads = asyncHandler(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const threads = await ForumThread.find()
            .populate('authorId', 'fullName avatar')
            .populate('categoryId', 'name')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ForumThread.countDocuments();

        res.status(200).json({
            success: true,
            message: 'All threads fetched',
            threads,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: threads.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_THREADS_BY_CATEGORY - Get threads in a category
 */
export const getThreadsByCategory = asyncHandler(async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const category = await ForumCategory.findById(categoryId);
        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        const threads = await ForumThread.find({ categoryId })
            .populate('authorId', 'fullName avatar')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ForumThread.countDocuments({ categoryId });

        res.status(200).json({
            success: true,
            message: 'Category threads fetched',
            threads,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                count: threads.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_THREAD - Get single thread with replies
 */
export const getThread = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;

        // Increment views
        await ForumThread.findByIdAndUpdate(threadId, { $inc: { views: 1 } });

        const thread = await ForumThread.findById(threadId)
            .populate('authorId', 'fullName avatar')
            .populate('categoryId', 'name')
            .populate({
                path: 'upvotes',
                select: 'fullName'
            })
            .populate({
                path: 'downvotes',
                select: 'fullName'
            });

        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Thread fetched',
            thread
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @CREATE_THREAD - User creates thread
 */
export const createThread = asyncHandler(async (req, res, next) => {
    try {
        const { title, content, categoryId, courseId, tags } = req.body;
        const userId = req.user.id;

        if (!title || !content || !categoryId) {
            return next(new AppError('Title, content and category are required', 400));
        }

        const category = await ForumCategory.findById(categoryId);
        if (!category) {
            return next(new AppError('Category not found', 404));
        }

        const thread = await ForumThread.create({
            title,
            content,
            categoryId,
            courseId: courseId || null,
            authorId: userId,
            tags: tags || []
        });

        // Update category thread count
        category.threadCount += 1;
        await category.save();

        const populatedThread = await thread.populate('authorId', 'fullName avatar');

        res.status(201).json({
            success: true,
            message: 'Thread created successfully',
            thread: populatedThread
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UPDATE_THREAD - Author or admin updates thread
 */
export const updateThread = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const { title, content, tags } = req.body;
        const userId = req.user.id;

        const thread = await ForumThread.findById(threadId);
        
        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        if (thread.authorId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only update your own threads', 403));
        }

        if (title) thread.title = title;
        if (content) thread.content = content;
        if (tags) thread.tags = tags;

        await thread.save();

        res.status(200).json({
            success: true,
            message: 'Thread updated successfully',
            thread
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @DELETE_THREAD - Author or admin deletes thread
 */
export const deleteThread = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const userId = req.user.id;

        const thread = await ForumThread.findById(threadId);
        
        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        if (thread.authorId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only delete your own threads', 403));
        }

        // Delete all replies
        await ForumReply.deleteMany({ threadId });

        // Update category
        const category = await ForumCategory.findById(thread.categoryId);
        if (category) {
            category.threadCount -= 1;
            await category.save();
        }

        await ForumThread.findByIdAndDelete(threadId);

        res.status(200).json({
            success: true,
            message: 'Thread deleted successfully'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @PIN_THREAD - Admin pins thread
 */
export const pinThread = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;

        const thread = await ForumThread.findByIdAndUpdate(
            threadId,
            { isPinned: true },
            { new: true }
        );

        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Thread pinned successfully',
            thread
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UNPIN_THREAD - Admin unpins thread
 */
export const unpinThread = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;

        const thread = await ForumThread.findByIdAndUpdate(
            threadId,
            { isPinned: false },
            { new: true }
        );

        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Thread unpinned successfully',
            thread
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @CLOSE_THREAD - Author or admin closes thread
 */
export const closeThread = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const userId = req.user.id;

        const thread = await ForumThread.findById(threadId);
        
        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        if (thread.authorId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only close your own threads', 403));
        }

        thread.isClosed = true;
        await thread.save();

        res.status(200).json({
            success: true,
            message: 'Thread closed successfully',
            thread
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @SEARCH_THREADS - Search threads by keywords
 */
export const searchThreads = asyncHandler(async (req, res, next) => {
    try {
        const { q, categoryId } = req.query;

        if (!q) {
            return next(new AppError('Search query is required', 400));
        }

        let query = {
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ]
        };

        if (categoryId) {
            query.categoryId = categoryId;
        }

        const threads = await ForumThread.find(query)
            .populate('authorId', 'fullName avatar')
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            message: 'Search results',
            threads,
            count: threads.length
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

// ==================== REPLY CONTROLLERS ====================

/**
 * @CREATE_REPLY - User creates reply (supports nested replies)
 */
export const createReply = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const { content, parentReplyId } = req.body;
        const userId = req.user.id;

        if (!content) {
            return next(new AppError('Reply content is required', 400));
        }

        const thread = await ForumThread.findById(threadId);
        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        if (thread.isClosed) {
            return next(new AppError('This thread is closed', 400));
        }

        const reply = await ForumReply.create({
            threadId,
            content,
            authorId: userId,
            parentReplyId: parentReplyId || null
        });

        // Update thread reply count
        if (!parentReplyId) {
            thread.replyCount += 1;
        } else {
            const parentReply = await ForumReply.findById(parentReplyId);
            if (parentReply) {
                parentReply.replyCount += 1;
                await parentReply.save();
            }
        }

        thread.lastActivityAt = new Date();
        await thread.save();

        const populatedReply = await reply.populate('authorId', 'fullName avatar');

        res.status(201).json({
            success: true,
            message: 'Reply created successfully',
            reply: populatedReply
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_REPLIES - Get all replies for a thread
 */
export const getReplies = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;

        const replies = await ForumReply.find({ 
            threadId, 
            parentReplyId: null 
        })
            .populate('authorId', 'fullName avatar')
            .populate({
                path: 'likes',
                select: 'fullName'
            })
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            message: 'Replies fetched',
            replies,
            count: replies.length
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_NESTED_REPLIES - Get nested replies for a reply
 */
export const getNestedReplies = asyncHandler(async (req, res, next) => {
    try {
        const { replyId } = req.params;

        const nestedReplies = await ForumReply.find({ parentReplyId: replyId })
            .populate('authorId', 'fullName avatar')
            .populate({
                path: 'likes',
                select: 'fullName'
            })
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            message: 'Nested replies fetched',
            replies: nestedReplies,
            count: nestedReplies.length
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UPDATE_REPLY - Author or admin updates reply
 */
export const updateReply = asyncHandler(async (req, res, next) => {
    try {
        const { replyId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const reply = await ForumReply.findById(replyId);
        
        if (!reply) {
            return next(new AppError('Reply not found', 404));
        }

        if (reply.authorId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only update your own replies', 403));
        }

        reply.content = content;
        reply.isEdited = true;
        reply.editedAt = new Date();
        
        await reply.save();

        res.status(200).json({
            success: true,
            message: 'Reply updated successfully',
            reply
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @DELETE_REPLY - Author or admin deletes reply
 */
export const deleteReply = asyncHandler(async (req, res, next) => {
    try {
        const { replyId } = req.params;
        const userId = req.user.id;

        const reply = await ForumReply.findById(replyId);
        
        if (!reply) {
            return next(new AppError('Reply not found', 404));
        }

        if (reply.authorId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('You can only delete your own replies', 403));
        }

        // Delete nested replies
        await ForumReply.deleteMany({ parentReplyId: replyId });

        // Update parent reply count if nested
        if (reply.parentReplyId) {
            const parentReply = await ForumReply.findById(reply.parentReplyId);
            if (parentReply) {
                parentReply.replyCount -= 1;
                await parentReply.save();
            }
        }

        // Update thread reply count
        const thread = await ForumThread.findById(reply.threadId);
        if (thread && !reply.parentReplyId) {
            thread.replyCount -= 1;
            await thread.save();
        }

        await ForumReply.findByIdAndDelete(replyId);

        res.status(200).json({
            success: true,
            message: 'Reply deleted successfully'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @MARK_ACCEPTED_ANSWER - Thread author marks reply as accepted answer
 */
export const markAcceptedAnswer = asyncHandler(async (req, res, next) => {
    try {
        const { replyId } = req.params;
        const userId = req.user.id;

        const reply = await ForumReply.findById(replyId);
        
        if (!reply) {
            return next(new AppError('Reply not found', 404));
        }

        const thread = await ForumThread.findById(reply.threadId);
        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        if (thread.authorId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError('Only thread author can mark answers', 403));
        }

        reply.isAcceptedAnswer = !reply.isAcceptedAnswer;
        await reply.save();

        res.status(200).json({
            success: true,
            message: reply.isAcceptedAnswer ? 'Marked as accepted answer' : 'Unmarked as accepted answer',
            reply
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @VOTE_REPLY - User upvotes or downvotes a reply
 */
export const voteReply = asyncHandler(async (req, res, next) => {
    try {
        const { replyId } = req.params;
        const { type } = req.body; // 'upvote' or 'downvote'
        const userId = req.user.id;

        if (!['upvote', 'downvote'].includes(type)) {
            return next(new AppError('Vote type must be upvote or downvote', 400));
        }

        const reply = await ForumReply.findById(replyId);
        
        if (!reply) {
            return next(new AppError('Reply not found', 404));
        }

        if (type === 'upvote') {
            const hasDownvoted = reply.dislikes.includes(userId);
            if (hasDownvoted) {
                reply.dislikes = reply.dislikes.filter(id => id.toString() !== userId);
            }

            const hasUpvoted = reply.likes.includes(userId);
            if (hasUpvoted) {
                reply.likes = reply.likes.filter(id => id.toString() !== userId);
            } else {
                reply.likes.push(userId);
            }
        } else {
            const hasUpvoted = reply.likes.includes(userId);
            if (hasUpvoted) {
                reply.likes = reply.likes.filter(id => id.toString() !== userId);
            }

            const hasDownvoted = reply.dislikes.includes(userId);
            if (hasDownvoted) {
                reply.dislikes = reply.dislikes.filter(id => id.toString() !== userId);
            } else {
                reply.dislikes.push(userId);
            }
        }

        await reply.save();

        res.status(200).json({
            success: true,
            message: `Reply ${type}d successfully`,
            reply
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @VOTE_THREAD - User upvotes or downvotes a thread
 */
export const voteThread = asyncHandler(async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const { type } = req.body; // 'upvote' or 'downvote'
        const userId = req.user.id;

        if (!['upvote', 'downvote'].includes(type)) {
            return next(new AppError('Vote type must be upvote or downvote', 400));
        }

        const thread = await ForumThread.findById(threadId);
        
        if (!thread) {
            return next(new AppError('Thread not found', 404));
        }

        if (type === 'upvote') {
            const hasDownvoted = thread.downvotes.includes(userId);
            if (hasDownvoted) {
                thread.downvotes = thread.downvotes.filter(id => id.toString() !== userId);
            }

            const hasUpvoted = thread.upvotes.includes(userId);
            if (hasUpvoted) {
                thread.upvotes = thread.upvotes.filter(id => id.toString() !== userId);
            } else {
                thread.upvotes.push(userId);
            }
        } else {
            const hasUpvoted = thread.upvotes.includes(userId);
            if (hasUpvoted) {
                thread.upvotes = thread.upvotes.filter(id => id.toString() !== userId);
            }

            const hasDownvoted = thread.downvotes.includes(userId);
            if (hasDownvoted) {
                thread.downvotes = thread.downvotes.filter(id => id.toString() !== userId);
            } else {
                thread.downvotes.push(userId);
            }
        }

        await thread.save();

        res.status(200).json({
            success: true,
            message: `Thread ${type}d successfully`,
            thread
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});
