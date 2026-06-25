import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forumApi } from '../Helpers/api';

export default function CreateThread() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: '',
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await forumApi.getAllCategories();
      const cats = response.data.categories || response.data;
      setCategories(cats);
      
      // Auto-select first category if available
      if (cats.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: cats[0]._id }));
      }
    } catch (error) {
      toast.error('Lỗi tải danh mục');
      console.error('Error loading categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.categoryId) {
      toast.error('Vui lòng điền tất cả các trường bắt buộc');
      return;
    }

    try {
      setLoading(true);
      
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await forumApi.createThread({
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        tags,
      });

      toast.success('Tạo bài viết thành công');
      navigate('/forum');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi tạo bài viết');
      console.error('Error creating thread:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Tạo Bài Viết Mới</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Tiêu Đề *</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề bài viết"
                className="input input-bordered"
                required
              />
            </div>

            {/* Category */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Danh Mục *</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="select select-bordered"
                required
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Đang tải danh mục...' : 'Chọn danh mục'}
                </option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Nội Dung *</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Viết nội dung bài viết của bạn tại đây..."
                className="textarea textarea-bordered h-64"
                required
              />
              <label className="label">
                <span className="label-text-alt text-gray-500">Bạn có thể sử dụng Markdown</span>
              </label>
            </div>

            {/* Tags */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Tags (tùy chọn)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Nhập tags, cách nhau bằng dấu phẩy (vd: JavaScript, React, Bug)"
                className="input input-bordered"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || categoriesLoading}
                className="btn btn-primary flex-1 gap-2"
              >
                <FiSave size={20} />
                {loading ? 'Đang tạo...' : 'Tạo Bài Viết'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-ghost flex-1"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
