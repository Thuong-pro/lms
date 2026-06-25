import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiClock, FiTarget, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { courseApi, quizApi } from '../Helpers/api'; // Đã thêm quizApi vào đây

export default function StudentQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      
      // 1. Lấy danh sách khóa học đang học
      const res = await courseApi.getAllCourses();
      const enrolledCourses = res.data.courses || [];
      
      // 2. Lấy toàn bộ bài Quiz của các khóa học đó
      const quizPromises = enrolledCourses.map(async (course) => {
        try {
          const quizRes = await quizApi.getQuizzesByCourse(course._id);
          const courseQuizzes = quizRes.data.quizzes || [];
          return courseQuizzes.map(quiz => ({ 
            ...quiz, 
            courseId: course._id, 
            courseName: course.title 
          }));
        } catch (error) {
          return []; 
        }
      });
      const quizzesArrays = await Promise.all(quizPromises);
      let allQuizzes = quizzesArrays.flat();

      // ==============================================================
      // 3. ĐIỂM NHẤN TẠI ĐÂY: Lấy lịch sử nộp bài của học sinh
      // ==============================================================
      try {
        const submissionRes = await quizApi.getStudentQuizzes();
        const mySubmissions = submissionRes.data.submissions || [];

        // 4. Ghép dữ liệu: Đối chiếu xem bài nào đã nộp
        allQuizzes = allQuizzes.map(quiz => {
            // Tìm xem trong lịch sử nộp bài có quiz._id này không
            const submission = mySubmissions.find(sub => 
                // Xử lý cả 2 trường hợp Backend trả về object gộp hoặc chỉ trả _id
                sub.quizId === quiz._id || (sub.quizId && sub.quizId._id === quiz._id)
            );
            
            if (submission) {
                return {
                    ...quiz,
                    submitted: true,             // Đánh dấu là đã làm
                    score: submission.percentage, // Lấy điểm để in ra
                    submissionId: submission._id  // Lưu lại ID bài nộp để sau này xem lại
                };
            }
            // Nếu không tìm thấy thì bài này chưa làm
            return { ...quiz, submitted: false };
        });
      } catch (subError) {
        console.log("Chưa có lịch sử làm bài hoặc lỗi API", subError);
      }

      setQuizzes(allQuizzes);
    } catch (error) {
      toast.error('Lỗi tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };
  
  const getFilteredQuizzes = () => {
    if (filterStatus === 'completed') {
      return quizzes.filter(q => q.submitted);
    }
    if (filterStatus === 'pending') {
      return quizzes.filter(q => !q.submitted);
    }
    return quizzes;
  };

  const filteredQuizzes = getFilteredQuizzes();

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="w-full text-base-content animate-fade-in">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Bài Kiểm Tra</h1>
        <p className="text-base-content/70 mt-2">
          Bạn có <span className="font-bold text-primary">{quizzes.length}</span> bài tập trắc nghiệm cần hoàn thành
        </p>
      </div>

      {/* TABS LỌC TRẠNG THÁI */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['all', 'pending', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`btn btn-sm rounded-full transition-colors ${
              filterStatus === status ? 'btn-primary shadow-sm' : 'btn-ghost text-base-content hover:bg-base-200'
            }`}
          >
            {status === 'all' && 'Tất Cả'}
            {status === 'pending' && 'Chưa Làm'}
            {status === 'completed' && 'Đã Làm'}
          </button>
        ))}
      </div>

      {/* KHU VỰC DANH SÁCH */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-12 text-center">
          <FiAward size={48} className="mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/60 font-medium">
            {filterStatus === 'all' && 'Chưa có bài kiểm tra nào được giao.'}
            {filterStatus === 'pending' && 'Tuyệt vời! Bạn đã hoàn thành hết bài tập.'}
            {filterStatus === 'completed' && 'Bạn chưa làm bài kiểm tra nào.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-base-100 rounded-xl shadow-sm border border-base-200 hover:shadow-md hover:border-primary/30 transition-all p-6"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-base-content">{quiz.title}</h3>
                    {quiz.submitted && (
                      <div className="badge badge-success gap-1 text-white font-semibold">
                        <FiCheckCircle size={14} /> Đã nộp
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-base-content/60 mb-4 font-medium">Khóa học: {quiz.courseName}</p>

                  <div className="flex flex-wrap gap-5 text-sm font-medium">
                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-lg">
                      <FiTarget size={16} />
                      <span>Điểm qua môn: {quiz.passingScore}%</span>
                    </div>
                    {/* SỬA LỖI TÊN BIẾN THỜI GIAN TẠI ĐÂY */}
                    <div className="flex items-center gap-2 bg-warning/10 text-warning-content px-3 py-1 rounded-lg">
                      <FiClock size={16} />
                      <span>Thời gian: {quiz.timeLimit} phút</span>
                    </div>
                    
                    {quiz.submitted && (
                      <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-lg">
                        <FiAward size={16} />
                        <span>Điểm của bạn: {quiz.score}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
              onClick={() => {
       if (quiz.submitted) {
      // Nếu đã làm: Gửi thêm tín hiệu isReview và ID bài nộp sang trang kia
      navigate(`/quiz/${quiz._id}`, { 
        state: { isReview: true, submissionId: quiz.submissionId, quizInfo: quiz } 
      });
    } else {
      // Nếu chưa làm: Chỉ gửi ID bài như bình thường
      navigate(`/quiz/${quiz._id}`);
    }
  }}
  className={`btn w-full md:w-auto mt-4 md:mt-0 ${
    quiz.submitted
      ? 'btn-outline text-base-content hover:bg-base-200 hover:text-base-content'
      : 'btn-primary'
  }`}
>
                  {quiz.submitted ? 'Xem Lại Kết Quả' : 'Bắt Đầu Làm Bài'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}