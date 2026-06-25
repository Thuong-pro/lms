import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiUser, FiClock, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forumApi } from '../Helpers/api';

export default function ForumThreads() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreads();
  }, [categoryId]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const response = await forumApi.getThreadsByCategory(categoryId);
      setThreads(response.data.threads || []);
    } catch (error) {
      toast.error('Không thể tải bài viết, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-base-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header điều hướng */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/forum')} className="btn btn-ghost btn-sm gap-2">
            <FiArrowLeft /> Quay lại danh mục
          </button>
          <button onClick={() => navigate('/forum/create-thread')} className="btn btn-primary btn-sm gap-2">
            <FiPlusCircle /> Viết bài mới
          </button>
        </div>

        {/* Danh sách bài viết */}
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-3">Bài viết trong danh mục</h2>

        {loading ? (
          <div className="flex justify-center py-20"><span className="loading loading-spinner text-primary loading-lg"></span></div>
        ) : threads.length === 0 ? (
          <div className="text-center py-20 bg-base-100 rounded-2xl border border-dashed border-base-300">
            <p className="text-base-content/60 text-lg">Chưa có bài viết nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map(thread => (
              <div 
                key={thread._id} 
                onClick={() => navigate(`/forum/thread/${thread._id}`)}
                className="group p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {thread.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{thread.content}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <FiUser size={16} /> {thread.authorId?.fullName || 'Ẩn danh'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={16} /> {new Date(thread.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMessageSquare size={16} /> {thread.replyCount || 0} phản hồi
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}