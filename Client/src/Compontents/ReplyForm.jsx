import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forumApi } from '../Helpers/api';

export default function ReplyForm({ threadId, parentReplyId, onReplyAdded }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setLoading(true);
      await forumApi.createReply(threadId, {
        content,
        parentReplyId,
      });
      setContent('');
      toast.success('Bình luận thành công');
      if (onReplyAdded) onReplyAdded();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm bình luận');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận của bạn..."
        className="textarea textarea-bordered w-full mb-3 h-24"
      />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost">Hủy</button>
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary gap-2"
        >
          <FiSend size={18} />
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>
    </form>
  );
}
