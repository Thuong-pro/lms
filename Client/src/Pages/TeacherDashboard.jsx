import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiAward, FiUsers, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StatCard from '../Compontents/StatCard';
import CourseCardTeacher from '../Compontents/CourseCardTeacher';
import { courseApi, quizApi } from '../Helpers/api';
import { useAuth } from '../Helpers/useAuth';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    quizzes: 0,
    students: 0,
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isTeacher) {
      navigate('/');
      return;
    }
    loadDashboard();
  }, [isTeacher]);

  // HÀM ĐÃ ĐƯỢC NÂNG CẤP ĐỂ TÍNH TOÁN ĐÚNG SỐ LƯỢNG QUIZ
  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // 1. Lấy tất cả khóa học của giáo viên
      const coursesRes = await courseApi.getAllCourses();
      const teacherCourses = coursesRes.data.courses.filter(
        c => c.teacherId === user?._id
      );
      setCourses(teacherCourses);

      // 2. Tính toán thống kê
      let totalQuizzes = 0;
      let totalStudents = 0; 
      teacherCourses.forEach(course => {
          // Cộng dồn số học viên của từng khóa học lại (nếu chưa có thì coi như là 0)
          totalStudents += course.numberOfStudents || 0; 
      });

      // Gọi API lấy Quiz cho từng khóa học
      const quizPromises = teacherCourses.map(course => 
        quizApi.getQuizzesByCourse(course._id).catch(() => null) // Bắt lỗi an toàn
      );

      // Chờ tất cả API chạy xong
      const quizResults = await Promise.all(quizPromises);

      // Cộng dồn số lượng bài kiểm tra thực tế
      quizResults.forEach(res => {
        if (res?.data?.quizzes) {
          totalQuizzes += res.data.quizzes.length;
        }
      });

      // 3. Cập nhật state để hiển thị
      setStats({
        courses: teacherCourses.length,
        quizzes: totalQuizzes,
        students: totalStudents.size,
      });

    } catch (error) {
      toast.error('Lỗi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    
    try {
      await courseApi.deleteCourse(courseId);
      toast.success('Xóa khóa học thành công');
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi xóa khóa học');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner text-primary"></span></div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto text-base-content">
      
      {/* Header riêng của Dashboard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Bảng Điều Khiển Giáo Viên</h1>
        <p className="text-base-content/70 mt-2">Chào <span className="font-semibold text-base-content">{user?.fullName}</span>, quản lý khóa học và bài kiểm tra của bạn.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={FiBook} title="Khóa Học" value={stats.courses} color="primary" />
        <StatCard icon={FiAward} title="Bài Kiểm Tra" value={stats.quizzes} color="warning" />
        <StatCard icon={FiUsers} title="Học Viên" value={stats.students} color="info" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => navigate('/course/create')}
          className="btn btn-primary gap-2"
        >
          <FiPlusCircle size={20} />
          Tạo Khóa Học
        </button>
        <button 
          onClick={() => navigate('/teacher/quiz/create')}
          className="btn btn-warning gap-2"
        >
          <FiPlusCircle size={20} />
          Tạo Bài Kiểm Tra
        </button>
      </div>

      {/* My Courses */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-base-content">Khóa Học Của Tôi</h2>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <FiBook size={48} className="mx-auto text-base-content/30 mb-4" />
            <p className="text-base-content/60 mb-4">Bạn chưa tạo khóa học nào</p>
            <button 
              onClick={() => navigate('/course/create')}
              className="btn btn-primary"
            >
              Tạo Khóa Học Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCardTeacher 
                key={course._id} 
                course={course}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-base-content">Hoạt Động Gần Đây</h2>
        <div className="text-center py-12 text-base-content/50 border-2 border-dashed border-base-300 rounded-xl">
          Chưa có hoạt động nào
        </div>
      </div>
      
    </div>
  );
}