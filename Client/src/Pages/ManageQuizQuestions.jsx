import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { quizApi, questionApi } from '../Helpers/api';
import { FiPlus, FiTrash2, FiEdit2, FiArrowLeft, FiSave } from 'react-icons/fi';

export default function ManageQuizQuestions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    options: [
      { label: 'A', text: '' },
      { label: 'B', text: '' },
      { label: 'C', text: '' },
      { label: 'D', text: '' }
    ],
    correctAnswer: 'A',
    score: 1,
    difficulty: 'medium',
    explanation: ''
  });

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load quiz
      const quizRes = await quizApi.getQuiz(quizId);
      setQuiz(quizRes.data.quiz);
      setQuestions(quizRes.data.quiz.questions || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Lỗi tải dữ liệu');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      questionText: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' }
      ],
      correctAnswer: 'A',
      score: 1,
      difficulty: 'medium',
      explanation: ''
    });
    setEditingQuestion(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (question) => {
    setFormData({
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      score: question.score,
      difficulty: question.difficulty,
      explanation: question.explanation || ''
    });
    setEditingQuestion(question);
    setShowAddModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' ? parseInt(value) : value
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, text: value } : opt
      )
    }));
  };

  const handleSaveQuestion = async () => {
    try {
      if (!formData.questionText || formData.options.some(opt => !opt.text)) {
        toast.error('Vui lòng điền tất cả thông tin câu hỏi');
        return;
      }

      if (editingQuestion) {
        // Update question
        await questionApi.updateQuestion(editingQuestion._id, formData);
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        // Add new question
        await questionApi.addQuestion(quizId, formData);
        toast.success('Thêm câu hỏi thành công');
      }

      setShowAddModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error(error.response?.data?.message || 'Lỗi lưu câu hỏi');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

    try {
      await questionApi.deleteQuestion(questionId);
      toast.success('Xóa câu hỏi thành công');
      loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error(error.response?.data?.message || 'Lỗi xóa câu hỏi');
    }
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
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-primary">{quiz?.title}</h1>
          <p className="text-base-content/60">Quản lý câu hỏi cho bài kiểm tra</p>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-base-content/60">Tổng số câu hỏi</p>
            <p className="text-3xl font-bold text-primary">{questions.length}</p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Thời gian làm bài</p>
            <p className="text-3xl font-bold text-success">{quiz?.timeLimit || 0} phút</p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Tổng điểm</p>
            <p className="text-3xl font-bold text-info">
              {questions.reduce((sum, q) => sum + (q.score || 1), 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Điểm đạt</p>
            <p className="text-3xl font-bold text-warning">{quiz?.passingScore || 0}%</p>
          </div>
        </div>
      </div>

      {/* Add Question Button */}
      <div className="mb-8">
        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary gap-2"
        >
          <FiPlus size={20} />
          Thêm Câu Hỏi Mới
        </button>
      </div>

      {/* Questions List */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base-content/60 mb-4">Chưa có câu hỏi nào</p>
            <button
              onClick={handleOpenAddModal}
              className="btn btn-primary btn-sm"
            >
              Thêm câu hỏi đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {questions.map((question, index) => (
              <div key={question._id} className="border border-base-300 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      Câu {index + 1}: {question.questionText}
                    </h3>
                    <div className="flex gap-2 flex-wrap mb-4">
                      <span className="badge badge-sm">{question.difficulty}</span>
                      <span className="badge badge-sm badge-primary">{question.score} điểm</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(question)}
                      className="btn btn-xs btn-warning gap-1"
                    >
                      <FiEdit2 size={14} />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="btn btn-xs btn-error gap-1"
                    >
                      <FiTrash2 size={14} />
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg flex items-start gap-3 ${
                        option.label === question.correctAnswer
                          ? 'bg-success/20 border border-success'
                          : 'bg-base-200'
                      }`}
                    >
                      <span className={`font-bold min-w-8 ${
                        option.label === question.correctAnswer ? 'text-success' : ''
                      }`}>
                        {option.label}.
                      </span>
                      <span className="flex-1">{option.text}</span>
                      {option.label === question.correctAnswer && (
                        <span className="badge badge-success badge-sm">Đáp án đúng</span>
                      )}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="bg-info/10 border border-info rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-info mb-1">Giải thích:</p>
                    <p className="text-sm">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Câu Hỏi *</span>
                </label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleFormChange}
                  placeholder="Nhập câu hỏi"
                  className="textarea textarea-bordered h-20"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Lựa Chọn *</span>
                </label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="font-bold w-8">{option.label}.</span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Nhập lựa chọn ${option.label}`}
                        className="input input-bordered flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Đáp Án Đúng</span>
                  </label>
                  <select
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleFormChange}
                    className="select select-bordered"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Điểm</span>
                  </label>
                  <input
                    type="number"
                    name="score"
                    value={formData.score}
                    onChange={handleFormChange}
                    min="1"
                    className="input input-bordered"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Độ Khó</span>
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleFormChange}
                  className="select select-bordered"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung Bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Giải Thích (Tuỳ chọn)</span>
                </label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleFormChange}
                  placeholder="Giải thích đáp án"
                  className="textarea textarea-bordered h-16"
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="btn btn-primary gap-2"
              >
                <FiSave size={18} />
                {editingQuestion ? 'Cập Nhật' : 'Thêm'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)} />
        </div>
      )}
    </div>
  );
}
