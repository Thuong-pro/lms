import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageCircle, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forumApi } from '../Helpers/api';
import ThreadCard from '../Compontents/ThreadCard';

export default function CategoryView() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load category details
      const catRes = await forumApi.getCategoryById(categoryId);
      setCategory(catRes.data.category || catRes.data);

      // Load threads in this category
      const threadsRes = await forumApi.getThreadsByCategory(categoryId);
      setThreads(threadsRes.data.threads || threadsRes.data || []);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner"></span></div>;
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
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{category?.icon || '💬'}</span>
            <div>
              <h1 className="text-3xl font-bold">{category?.name}</h1>
              <p className="text-gray-600">{category?.description}</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/forum/create-thread')}
            className="btn btn-primary gap-2"
          >
            <FiPlusCircle size={20} />
            Tạo Bài Viết Mới
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-600 mb-6">
          Tổng cộng <strong>{threads.length}</strong> bài viết
        </div>

        {threads.length === 0 ? (
          <div className="text-center py-12">
            <FiMessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Chưa có bài viết nào</p>
            <button 
              onClick={() => navigate('/forum/create-thread')}
              className="btn btn-primary"
            >
              Tạo bài viết đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map(thread => (
              <ThreadCard key={thread._id} thread={thread} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
