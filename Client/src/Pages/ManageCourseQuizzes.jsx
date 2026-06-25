import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseApi, quizApi } from '../Helpers/api';
import { FiPlus, FiTrash2, FiEdit2, FiClock, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../Helpers/useAuth';

export default function ManageCourseQuizzes() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passingScore: 50,
    timeLimit: 60,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load course
      const courseRes = await courseApi.getCourseById(courseId);
      setCourse(courseRes.data.course);
      
      // Verify user is the teacher
      if (courseRes.data.course.teacherId !== user?._id) {
        toast.error('Bạn không phải là giáo viên của khóa học này');
        navigate('/teacher/dashboard');
        return;
      }

      // Load quizzes
      const quizzesRes = await quizApi.getQuizzesByCourse(courseId);
      setQuizzes(quizzesRes.data.quizzes || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(error.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddQuizModal = () => {
    setFormData({
      title: '',
      description: '',
      passingScore: 50,
      timeLimit: 60,
      isActive: true,
    });
    setEditingQuiz(null);
    setShowAddQuizModal(true);
  };

  const handleOpenEditModal = (quiz) => {
    setFormData({
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      isActive: quiz.isActive,
    });
    setEditingQuiz(quiz);
    setShowAddQuizModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'passingScore' || name === 'timeLimit' ? parseInt(value) : value)
    }));
  };

  const handleSaveQuiz = async () => {
    try {
      if (!formData.title || !formData.description) {
        toast.error('Vui lòng điền tất cả thông tin');
        return;
      }

      if (editingQuiz) {
        // Update existing quiz
        await quizApi.updateQuiz(editingQuiz._id, formData);
        toast.success('Cập nhật bài kiểm tra thành công');
      } else {
        // Create new quiz
        await quizApi.createQuiz({
          ...formData,
          courseId,
          numberOfQuestions: 0,
          totalMarks: 0,
        });
        toast.success('Tạo bài kiểm tra thành công');
      }

      setShowAddQuizModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(error.response?.data?.message || 'Lỗi lưu bài kiểm tra');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Bạn có chắc muốn xóa bài kiểm tra này?')) return;

    try {
      await quizApi.deleteQuiz(quizId);
      toast.success('Xóa bài kiểm tra thành công');
      loadData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error(error.response?.data?.message || 'Lỗi xóa bài kiểm tra');
    }
  };

  const handleAddQuestionToQuiz = (quizId) => {
    navigate(`/teacher/quiz/${quizId}/add-question`);
  };

  const handleViewQuizzes = (quizId) => {
    navigate(`/teacher/quiz/${quizId}/questions`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="btn btn-ghost btn-sm"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-primary">{course?.title}</h1>
          <p className="text-base-content/60">Quản lý bài kiểm tra cho khóa học</p>
        </div>
      </div>

      {/* Course Info */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-base-content/60">Tổng số bài kiểm tra</p>
            <p className="text-3xl font-bold text-primary">{quizzes.length}</p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Bài kiểm tra hoạt động</p>
            <p className="text-3xl font-bold text-success">{quizzes.filter(q => q.isActive).length}</p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Bài kiểm tra không hoạt động</p>
            <p className="text-3xl font-bold text-warning">{quizzes.filter(q => !q.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="mb-8">
        <button
          onClick={handleOpenAddQuizModal}
          className="btn btn-primary gap-2"
        >
          <FiPlus size={20} />
          Tạo Bài Kiểm Tra Mới
        </button>
      </div>

      {/* Quizzes List */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden">
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base-content/60 mb-4">Chưa có bài kiểm tra nào cho khóa học này</p>
            <button
              onClick={handleOpenAddQuizModal}
              className="btn btn-primary btn-sm"
            >
              Tạo bài kiểm tra đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="bg-base-200">
                  <th>Tên Bài Kiểm Tra</th>
                  <th>Thời Gian (phút)</th>
                  <th>Điểm Qua (%)</th>
                  <th>Số Câu</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(quiz => (
                  <tr key={quiz._id} className="hover:bg-base-200">
                    <td>
                      <div className="font-semibold text-base-content">{quiz.title}</div>
                      <div className="text-sm text-base-content/60">{quiz.description}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FiClock size={18} className="text-primary" />
                        {quiz.timeLimit}
                      </div>
                    </td>
                    <td>
                      <div className="badge badge-warning">{quiz.passingScore}%</div>
                    </td>
                    <td>
                      <span className="font-semibold">{quiz.numberOfQuestions || 0}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FiCheckCircle 
                          size={18} 
                          className={quiz.isActive ? 'text-success' : 'text-base-content/30'}
                        />
                        <span className={quiz.isActive ? 'text-success' : 'text-base-content/50'}>
                          {quiz.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewQuizzes(quiz._id)}
                          className="btn btn-xs btn-info gap-1"
                          title="Xem/Quản lý câu hỏi"
                        >
                          <FiEdit2 size={14} />
                          Câu Hỏi
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(quiz)}
                          className="btn btn-xs btn-warning gap-1"
                          title="Chỉnh sửa thông tin"
                        >
                          <FiEdit2 size={14} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="btn btn-xs btn-error gap-1"
                          title="Xóa bài kiểm tra"
                        >
                          <FiTrash2 size={14} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Quiz Modal */}
      {showAddQuizModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingQuiz ? 'Chỉnh Sửa Bài Kiểm Tra' : 'Tạo Bài Kiểm Tra Mới'}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tên Bài Kiểm Tra *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Nhập tên bài kiểm tra"
                  className="input input-bordered"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mô Tả *</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Mô tả bài kiểm tra"
                  className="textarea textarea-bordered h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Thời Gian (phút)</span>
                  </label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleFormChange}
                    min="1"
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Điểm Qua (%)</span>
                  </label>
                  <input
                    type="number"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    className="input input-bordered"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Kích hoạt bài kiểm tra</span>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="checkbox"
                  />
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowAddQuizModal(false)}
                className="btn btn-ghost"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveQuiz}
                className="btn btn-primary"
              >
                {editingQuiz ? 'Cập Nhật' : 'Tạo'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowAddQuizModal(false)} />
        </div>
      )}
    </div>
  );
}
