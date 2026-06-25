import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { formatDate } from '../Helpers/formatters';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { forumApi } from '../Helpers/api';

export default function ReplyItem({ reply, depth = 0, onUpdate }) {
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(null);

  const handleVote = async (type) => {
    try {
      setVoting(true);
      await forumApi.voteReply(reply._id, { type });
      setVoted(voted === type ? null : type);
      toast.success('Cảm ơn phản hồi của bạn!');
      if (onUpdate) onUpdate(); // Refresh to update counts
    } catch (error) {
      toast.error('Lỗi khi vote');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div style={{ marginLeft: `${depth * 20}px` }} className="mb-4">
      <div className="bg-white border rounded-lg p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold">{reply.authorId?.fullName || 'Anonymous'}</p>
            <p className="text-xs text-gray-500">{formatDate(reply.createdAt)}</p>
          </div>
          {reply.isAcceptedAnswer && (
            <span className="badge badge-success gap-2">
              ✓ Câu trả lời được chấp nhận
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mb-4 text-gray-700">
          {reply.content}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => handleVote('like')}
            disabled={voting}
            className={`flex items-center gap-1 px-3 py-1 rounded ${
              voted === 'like' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FiThumbsUp size={16} />
            <span>{reply.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => handleVote('dislike')}
            disabled={voting}
            className={`flex items-center gap-1 px-3 py-1 rounded ${
              voted === 'dislike' ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FiThumbsDown size={16} />
          </button>
        </div>
      </div>

      {/* Nested Replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-4">
          {reply.replies.map(nestedReply => (
            <ReplyItem 
              key={nestedReply._id} 
              reply={nestedReply} 
              depth={depth + 1}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
