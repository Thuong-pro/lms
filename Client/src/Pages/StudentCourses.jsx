import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiPlayCircle, FiClock, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { courseApi } from '../Helpers/api';
import { useAuth } from '../Helpers/useAuth';

export default function StudentCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Lấy chỉ các khóa học mà user đã enrolled
      const res = await courseApi.getMyEnrolledCourses();
      const enrolledCourses = res.data.courses || [];
      setCourses(enrolledCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Lỗi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCourses = () => {
    if (filterStatus === 'completed') {
      return courses.filter(c => c.progress === 100);
    }
    if (filterStatus === 'ongoing') {
      return courses.filter(c => c.progress > 0 && c.progress < 100);
    }
    return courses;
  };

  const filteredCourses = getFilteredCourses();

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="w-full text-base-content">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Khóa Học Của Tôi</h1>
        <p className="text-base-content/70 mt-2">
          Bạn đang theo học <span className="font-bold text-base-content">{courses.length}</span> khóa học
        </p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {['all', 'ongoing', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`btn btn-sm rounded-full ${
              filterStatus === status ? 'btn-primary' : 'btn-ghost text-base-content'
            }`}
          >
            {status === 'all' && 'Tất Cả'}
            {status === 'ongoing' && 'Đang Học'}
            {status === 'completed' && 'Hoàn Thành'}
          </button>
        ))}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-12 text-center">
          <FiBook size={48} className="mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/60 mb-4">
            {filterStatus === 'all' && 'Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học có sẵn!'}
            {filterStatus === 'ongoing' && 'Bạn không có khóa học nào đang học'}
            {filterStatus === 'completed' && 'Bạn chưa hoàn thành khóa học nào'}
          </p>
          <button 
            onClick={() => navigate('/courses')}
            className="btn btn-primary rounded-xl border-none"
          >
            Khám Phá Khóa Học
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-lg transition-all hover:-translate-y-1 rounded-xl overflow-hidden"
            >
              {course.thumbnail && (
                <figure className="h-40 bg-gradient-to-r from-primary/20 to-secondary/20 relative overflow-hidden">
                  <img
                    src={course.thumbnail.secure_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </figure>
              )}

              <div className="card-body p-5 gap-3">
                <h2 className="card-title text-primary text-lg line-clamp-2">{course.title}</h2>
                <p className="text-xs text-base-content/60 font-medium">
                  Giảng viên: {course.createdBy || 'N/A'}
                </p>
                <p className="text-sm text-base-content/70 line-clamp-2">{course.description}</p>

                <div className="flex gap-4 text-xs text-base-content/60 py-2">
                  <div className="flex items-center gap-1">
                    <FiPlayCircle size={16} />
                    <span>{course.numberOfLectures || 0} bài giảng</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock size={16} />
                    <span>~{Math.ceil((course.numberOfLectures || 0) * 1.5)}h</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-xs font-semibold flex justify-between mb-1">
                    <span>Tiến độ</span>
                    <span className="text-primary">{course.progress || 0}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full h-2 rounded-full"
                    value={course.progress || 0}
                    max="100"
                  ></progress>
                </div>

                <button
                  onClick={() => navigate('/course/displaylecture', { state: { ...course, _id: course._id } })}
                  className="btn btn-primary btn-sm rounded-lg border-none mt-auto"
                >
                  Tiếp Tục Học
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
