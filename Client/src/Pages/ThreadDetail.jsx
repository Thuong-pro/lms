import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEye, FiMessageCircle, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forumApi } from '../Helpers/api';
import { formatDate } from '../Helpers/formatters';
import ReplyItem from '../Compontents/ReplyItem';
import ReplyForm from '../Compontents/ReplyForm';

export default function ThreadDetail() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    loadThread();
  }, [threadId]);

  const loadThread = async () => {
    try {
      setLoading(true);
      const response = await forumApi.getThreadById(threadId);
      const threadData = response.data.thread || response.data;
      setThread(threadData);
      
      // Load replies
      if (threadData._id) {
        const repliesRes = await forumApi.getRepliesByThread(threadData._id);
        setReplies(repliesRes.data.replies || repliesRes.data || []);
      }
    } catch (error) {
      toast.error('Lỗi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleThreadVote = async (type) => {
    if (!thread) return;
    try {
      setVoting(true);
      // Check if thread has voteThread method, otherwise use generic POST
      if (forumApi.voteThread) {
        await forumApi.voteThread(threadId, { type });
      } else {
        // Fallback to direct API call
        await forumApi.api.post(`/forum/threads/${threadId}/vote`, { type });
      }
      setUserVote(userVote === type ? null : type);
      toast.success('Cảm ơn phản hồi của bạn!');
      // Refresh thread to get updated counts
      loadThread();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner"></span></div>;
  }

  if (!thread) {
    return <div className="text-center py-12">Bài viết không tồn tại</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm mb-4 gap-2"
          >
            <FiArrowLeft size={20} />
            Quay lại
          </button>

          <h1 className="text-3xl font-bold mb-4">{thread.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            <span>Bởi <strong>{thread.authorId?.fullName || 'Anonymous'}</strong></span>
            <span className="flex items-center gap-1">
              <FiEye size={16} />
              {thread.views || 0} lượt xem
            </span>
            <span className="flex items-center gap-1">
              <FiMessageCircle size={16} />
              {thread.replyCount || 0} trả lời
            </span>
            <span className="flex items-center gap-1">
              <FiThumbsUp size={16} className="text-green-600" />
              {thread.upvotes?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiThumbsDown size={16} className="text-red-600" />
              {thread.downvotes?.length || 0}
            </span>
            <span>{formatDate(thread.createdAt)}</span>
          </div>

          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {thread.tags.map(tag => (
                <span key={tag} className="badge badge-outline">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Thread Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="prose prose-sm max-w-none mb-6">
            {thread.content}
          </div>

          {/* Thread Vote Buttons */}
          <div className="flex items-center gap-4 border-t pt-4">
            <span className="text-sm text-gray-500">Bài viết này có hữu ích không?</span>
            <button
              onClick={() => handleThreadVote('upvote')}
              disabled={voting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                userVote === 'upvote' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <FiThumbsUp size={18} />
              <span className="text-sm font-semibold">{thread.upvotes?.length || 0}</span>
            </button>
            <button
              onClick={() => handleThreadVote('downvote')}
              disabled={voting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                userVote === 'downvote' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <FiThumbsDown size={18} />
              <span className="text-sm font-semibold">{thread.downvotes?.length || 0}</span>
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Bình Luận ({replies.length})
          </h2>

          <div className="space-y-4 mb-8">
            {replies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có bình luận nào</p>
            ) : (
              replies.map(reply => (
                <ReplyItem 
                  key={reply._id} 
                  reply={reply}
                  onUpdate={loadThread}
                />
              ))
            )}
          </div>

          {/* Reply Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Viết Bình Luận</h3>
            <ReplyForm 
              threadId={threadId}
              onReplyAdded={loadThread}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
