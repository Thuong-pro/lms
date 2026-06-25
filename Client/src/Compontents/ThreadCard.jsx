import { FiMessageSquare, FiEye, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { formatDateShort } from '../Helpers/formatters';
import { Link } from 'react-router-dom';

export default function ThreadCard({ thread }) {
  return (
    <Link to={`/forum/thread/${thread._id}`}>
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Left: Icon */}
          <div className="pt-1">
            {thread.isPinned && <span className="text-yellow-500 text-2xl">📌</span>}
            {!thread.isPinned && <FiMessageSquare size={24} className="text-gray-400" />}
          </div>

          {/* Middle: Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg line-clamp-1">{thread.title}</h3>
              {thread.isClosed && <span className="badge badge-sm badge-error">Đóng</span>}
              {thread.isPinned && <span className="badge badge-sm badge-warning">Ghim</span>}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{thread.content}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {thread.tags?.map(tag => (
                <span key={tag} className="badge badge-sm badge-outline">{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Bởi <strong>{thread.authorId?.fullName || 'Anonymous'}</strong></span>
              <span className="flex items-center gap-1">
                <FiMessageSquare size={14} />
                {thread.replyCount || 0} trả lời
              </span>
              <span className="flex items-center gap-1">
                <FiEye size={14} />
                {thread.views || 0} lượt xem
              </span>
              <span className="flex items-center gap-1">
                <FiThumbsUp size={14} className="text-green-600" />
                {thread.upvotes?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <FiThumbsDown size={14} className="text-red-600" />
                {thread.downvotes?.length || 0}
              </span>
              <span>{formatDateShort(thread.createdAt)}</span>
            </div>
          </div>

          {/* Right: Activity */}
          <div className="text-right pt-1">
            <div className="text-sm font-semibold text-primary">{thread.replyCount || 0}</div>
            <div className="text-xs text-gray-500">trả lời</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
