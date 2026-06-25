import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiMessageSquare, FiUser, FiClock, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forumApi } from '../Helpers/api';

export default function ForumHome() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const response = await forumApi.getAllThreads();
      setThreads(response.data.threads || []);
    } catch (error) {
      toast.error('Lỗi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-base-100 text-base-content w-full pb-20">
      {/* Header Giữ nguyên phong cách cũ */}
      <div className="bg-base-200/50 shadow-sm border-b border-base-300">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold mb-3 text-primary">Diễn Đàn Học Tập</h1>
          <p className="text-base-content/70 text-lg mb-8">Nơi thảo luận và chia sẻ kiến thức cùng cộng đồng</p>
          
          <button 
            onClick={() => navigate('/forum/create-thread')}
            className="btn btn-primary gap-2 rounded-xl shadow-lg shadow-primary/20"
          >
            <FiPlusCircle size={20} /> Tạo Bài Viết Mới
          </button>
        </div>
      </div>

      {/* Danh sách bài viết - Thiết kế hiện đại */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-8 border-l-4 border-primary pl-3">Bài viết mới nhất</h2>

        {loading ? (
           <div className="flex justify-center py-10"><span className="loading loading-spinner text-primary"></span></div>
        ) : threads.length === 0 ? (
          <div className="text-center py-20 bg-base-200 rounded-2xl">Chưa có bài viết nào được đăng.</div>
        ) : (
          <div className="space-y-4">
            {threads.map(thread => (
              <div 
                key={thread._id} 
                onClick={() => navigate(`/forum/thread/${thread._id}`)}
                className="group p-6 bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer"
              >
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {thread.title}
                </h3>
                <p className="text-base-content/60 mb-4 line-clamp-2">
                  {thread.content}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-base-content/50 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-6 h-6 text-xs">
                        {thread.authorId?.fullName?.charAt(0) || 'A'}
                      </div>
                    </div>
                    {thread.authorId?.fullName || 'Người dùng ẩn danh'}
                  </div>
                  <span className="flex items-center gap-1"><FiClock size={16} /> {new Date(thread.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><FiMessageSquare size={16} /> {thread.replyCount || 0} trả lời</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}