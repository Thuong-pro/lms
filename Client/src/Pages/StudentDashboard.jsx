import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiAward, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StatCard from '../Compontents/StatCard';
import { courseApi } from '../Helpers/api';
import { useAuth } from '../Helpers/useAuth';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, isStudent } = useAuth(); // Đã bỏ hàm logout vì Layout chung xử lý rồi
  
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    averageScore: 0,
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isStudent) {
      navigate('/');
      return;
    }
    loadDashboard();
  }, [isStudent]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const coursesRes = await courseApi.getAllCourses();
      
      // Bypass: Tạm thời lấy hết khóa học để test UI
      const myEnrolledCourses = coursesRes.data.courses || [];
      setCourses(myEnrolledCourses);

      let totalScore = 0;
      let count = 0;

      myEnrolledCourses.forEach(course => {
        if (course.score) {
          totalScore += course.score;
          count++;
        }
      });

      setStats({
        enrolledCourses: myEnrolledCourses.length,
        completedCourses: 0, 
        averageScore: count > 0 ? Math.round(totalScore / count) : 0,
      });
    } catch (error) {
      toast.error('Lỗi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    // Xóa bỏ flex và Sidebar, chỉ giữ lại thẻ div chứa nội dung tràn viền
    <div className="w-full text-base-content animate-fade-in">
      
      {/* Header trang nội dung */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Bảng Điều Khiển Học Tập</h1>
        <p className="text-base-content/70 mt-2">
          Chào mừng quay trở lại <span className="font-semibold text-base-content">{user?.fullName}</span>, hãy tiếp tục hoàn thành các mục tiêu học tập nhé.
        </p>
      </div>

      {/* Thẻ thống kê (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={FiBook} title="Khóa Học Đang Học" value={stats.enrolledCourses} color="primary" />
        <StatCard icon={FiAward} title="Khóa Hoàn Thành" value={stats.completedCourses} color="success" />
        <StatCard icon={FiBarChart2} title="Điểm Trung Bình" value={`${stats.averageScore}%`} color="warning" />
      </div>

      {/* Khu vực hiển thị danh sách khóa học */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-base-content">Khóa Học Gần Đây</h2>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <FiBook size={48} className="mx-auto text-base-content/30 mb-4" />
            <p className="text-base-content/60 mb-4">Bạn chưa tham gia khóa học nào</p>
            <button 
              onClick={() => navigate('/courses')}
              className="btn btn-primary rounded-xl border-none"
            >
              Khám Phá Khóa Học Ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map(course => (
              <div key={course._id} className="card bg-base-100 shadow-sm border border-base-200 transition-all hover:shadow-md hover:-translate-y-1 rounded-xl overflow-hidden">
                <div className="card-body p-5 gap-3">
                  <h3 className="card-title text-primary text-xl font-bold line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-base-content/70 line-clamp-2">{course.description}</p>
                  
                  {/* Thanh tiến độ học tập */}
                  <div className="mt-2">
                    <div className="text-sm mb-1 font-semibold flex justify-between">
                      <span>Tiến độ:</span>
                      <span className="text-primary">{course.progress || 0}%</span>
                    </div>
                    <progress className="progress progress-primary w-full h-2" value={course.progress || 0} max="100"></progress>
                  </div>

                  {/* Điều hướng xem chi tiết chuẩn luồng state ẩn */}
                  <button 
                    onClick={() => navigate("/course/description", { state: { ...course } })}
                    className="btn btn-sm btn-primary mt-2 border-none rounded-lg"
                  >
                    Tiếp Tục Học
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}