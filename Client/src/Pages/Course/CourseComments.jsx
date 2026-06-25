import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../Helpers/axiosInstance';

const CourseComments = ({ courseId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const fetchComments = async () => {
        try {
            const res = await axiosInstance.get(`/comments/${courseId}`);
            setComments(res.data.comments);
        } catch (error) {
            console.error("Lỗi lấy bình luận");
        }
    };

    useEffect(() => {
        if (courseId) fetchComments();
    }, [courseId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await axiosInstance.post(`/comments/${courseId}`, { content: newComment });
            setNewComment('');
            fetchComments(); // Gọi lại để hiển thị bình luận mới nhất
        } catch (error) {
            toast.error("Không thể gửi bình luận");
        }
    };

    return (
        // Dùng bg-base-200 để tạo khối nền hơi chìm xuống so với bg-base-100 của trang chính
        <div className="mt-6 p-6 border border-base-300 rounded-2xl bg-base-200 text-base-content shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-primary border-b-2 border-base-300 pb-3 flex items-center gap-2">
                💬 Đánh giá khóa học
            </h3>
            
            {/* Form nhập bình luận */}
            <form onSubmit={handlePostComment} className="flex gap-3 mb-8">
                <input 
                    type="text" 
                    placeholder="Bạn có đánh giá gì về khóa học này không?"
                    className="flex-1 p-3 bg-base-100 border border-base-300 text-base-content rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-primary px-8">
                    Gửi
                </button>
            </form>

            {/* Danh sách bình luận */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-base-content/60 italic">Chưa có thảo luận nào. Hãy là người đầu tiên để lại đánh giá!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment._id} className="bg-base-100 p-5 rounded-xl border border-base-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="font-bold text-base-content flex items-center gap-3">
                                    {/* Tạo Avatar giả bằng chữ cái đầu của tên */}
                                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm uppercase">
                                        {comment.userName?.charAt(0) || 'U'}
                                    </div>
                                    {comment.userName}
                                </div>
                                <span className="text-xs font-medium text-base-content/50">
                                    {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                </span>
                            </div>
                            {/* Căn lề trái bằng avatar (ml-12) để text đẹp hơn */}
                            <p className="text-base-content/80 ml-12 leading-relaxed">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseComments;