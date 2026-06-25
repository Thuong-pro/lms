import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { quizApi, questionApi } from '../Helpers/api';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { courseApi } from '../Helpers/api';
import { useAuth } from '../Helpers/useAuth';
import { useEffect } from 'react';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    courseId: '',
    passingScore: 50,
    timeLimit: 60,
  });
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 'A',
    score: 1,
    difficulty: 'medium',
    explanation: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [courses, setCourses] = useState([]);

const { user } = useAuth(); // Lấy thông tin user hiện tại

  // Đổi useState thành useEffect để gọi dữ liệu khi trang vừa mở lên
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        const res = await courseApi.getAllCourses();
        // Chỉ lấy những khóa học do chính giáo viên này tạo ra
        const myCourses = res.data.courses.filter(
          course => course.teacherId === user?._id
        );
        setCourses(myCourses);
      } catch (error) {
        toast.error("Không thể tải danh sách khóa học");
      }
    };

    fetchTeacherCourses();
  }, [user?._id]);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: name === 'passingScore' || name === 'timeLimit' ? parseInt(value) : value
    }));
  };

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target;
    if (editingIndex !== null) {
      const updated = [...questions];
      if (name.startsWith('option-')) {
        const optionIndex = parseInt(name.split('-')[1]);
        updated[editingIndex].options[optionIndex] = value;
      } else {
        updated[editingIndex][name] = value;
      }
      setQuestions(updated);
    } else {
      if (name.startsWith('option-')) {
        const optionIndex = parseInt(name.split('-')[1]);
        setNewQuestion(prev => ({
          ...prev,
          options: prev.options.map((opt, i) => i === optionIndex ? value : opt)
        }));
      } else {
        setNewQuestion(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const addQuestion = () => {
    if (!newQuestion.questionText || newQuestion.options.some(opt => !opt)) {
      toast.error('Vui lòng điền tất cả các trường câu hỏi');
      return;
    }

    if (editingIndex !== null) {
      setEditingIndex(null);
      setNewQuestion({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 'A',
        score: 1,
        difficulty: 'medium',
        explanation: '',
      });
    } else {
      setQuestions([...questions, newQuestion]);
      setNewQuestion({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 'A',
        score: 1,
        difficulty: 'medium',
        explanation: '',
      });
      toast.success('Thêm câu hỏi thành công');
    }
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success('Xóa câu hỏi thành công');
  };

  const editQuestion = (index) => {
    setNewQuestion(questions[index]);
    setEditingIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizData.title || !quizData.description || !quizData.courseId) {
      toast.error('Vui lòng điền tất cả thông tin bài kiểm tra');
      return;
    }

    if (questions.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }

    try {
      setLoading(true);

      // Create quiz
      const quizRes = await quizApi.createQuiz({
        ...quizData,
        numberOfQuestions: questions.length,
        totalMarks: questions.reduce((sum, q) => sum + q.score, 0),
      });

   
    // Add questions
      const quizId = quizRes.data.quiz._id;
      for (const question of questions) {
        await questionApi.addQuestion(quizId, {
          ...question,
          options: question.options // Bỏ hàm .map đi, chỉ gửi nguyên mảng chữ lên cho Backend tự lo
        });
      }

      toast.success('Tạo bài kiểm tra thành công');
      navigate('/teacher/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi tạo bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quiz Settings */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Thông Tin Bài Kiểm Tra</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tên Bài Kiểm Tra</span>
              </label>
              <input
                type="text"
                name="title"
                value={quizData.title}
                onChange={handleQuizChange}
                placeholder="Nhập tên bài kiểm tra"
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Mô Tả</span>
              </label>
              <textarea
                name="description"
                value={quizData.description}
                onChange={handleQuizChange}
                placeholder="Mô tả bài kiểm tra"
                className="textarea textarea-bordered h-20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Khóa Học</span>
                </label>
                <select
                  name="courseId"
                  value={quizData.courseId}
                  onChange={handleQuizChange}
                  className="select select-bordered"
                  required
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Điểm Qua (%)</span>
                </label>
                <input
                  type="number"
                  name="passingScore"
                  value={quizData.passingScore}
                  onChange={handleQuizChange}
                  min="0"
                  max="100"
                  className="input input-bordered"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Thời Gian (phút)</span>
              </label>
              <input
                type="number"
                name="timeLimit"
                value={quizData.timeLimit}
                onChange={handleQuizChange}
                min="1"
                className="input input-bordered"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 gap-2"
              >
                <FiSave size={20} />
                {loading ? 'Đang lưu...' : 'Lưu Bài Kiểm Tra'}
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

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Câu Hỏi ({questions.length})</h2>

          {/* Question List */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {questions.map((q, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <p className="font-semibold mb-2">{index + 1}. {q.questionText}</p>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="badge badge-sm">{q.difficulty}</span>
                  <span className="ml-2">Điểm: {q.score}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editQuestion(index)}
                    className="btn btn-xs btn-warning"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteQuestion(index)}
                    className="btn btn-xs btn-error"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Form */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">
              {editingIndex !== null ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                name="questionText"
                value={newQuestion.questionText}
                onChange={(e) => handleQuestionChange(e)}
                placeholder="Nhập câu hỏi"
                className="input input-bordered w-full"
              />

              <div className="space-y-2">
                {newQuestion.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    name={`option-${i}`}
                    value={opt}
                    onChange={(e) => handleQuestionChange(e)}
                    placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                    className="input input-bordered w-full"
                  />
                ))}
              </div>

              <select
                name="correctAnswer"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                className="select select-bordered w-full"
              >
                <option>Chọn đáp án đúng</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>

              <input
                type="number"
                name="score"
                value={newQuestion.score}
                onChange={(e) => setNewQuestion({...newQuestion, score: parseInt(e.target.value)})}
                placeholder="Điểm"
                min="1"
                className="input input-bordered w-full"
              />

              <button
                type="button"
                onClick={addQuestion}
                className="btn btn-primary w-full gap-2"
              >
                <FiPlus size={20} />
                {editingIndex !== null ? 'Cập Nhật' : 'Thêm Câu Hỏi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
