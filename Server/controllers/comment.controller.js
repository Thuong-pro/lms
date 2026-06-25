import Comment from '../models/comment.model.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import AppError from '../utils/error.util.js';

export const getCourseComments = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    // Lấy bình luận, sắp xếp cái mới nhất lên đầu
    const comments = await Comment.find({ courseId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, comments });
});

export const addComment = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const { content } = req.body;
    
    // Lấy thông tin người bình luận
    const userId = req.user?.id || req.user?._id;
    const userName = req.user?.fullName || req.user?.name || req.user?.userName || "Ẩn danh";

    if (!content) return next(new AppError('Nội dung không được để trống', 400));

    const comment = await Comment.create({ courseId, userId, userName, content });
    res.status(201).json({ success: true, comment });
});