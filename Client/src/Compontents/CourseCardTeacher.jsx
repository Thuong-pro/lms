import { FiBook, FiEdit2, FiTrash2, FiEye, FiClipboard } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Thay Link bằng useNavigate
import { formatDateShort } from '../Helpers/formatters';

export default function CourseCard({ course, onDelete, onEdit }) {
  const navigate = useNavigate(); // Khởi tạo hook điều hướng

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg border border-base-200 transition-all duration-300 text-base-content">
      {course.thumbnail?.secure_url && (
        <figure className="h-40 overflow-hidden">
          <img
            src={course.thumbnail.secure_url}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </figure>
      )}
      
      <div className="card-body p-5">
        {/* Tiêu đề khóa học theo hệ màu theme */}
        <h2 className="card-title text-lg font-bold line-clamp-2 text-primary">{course.title}</h2>
        
        {/* Mô tả khóa học: Đổi text-gray-600 sang màu lưỡng tính mờ 70% */}
        <p className="text-sm text-base-content/70 line-clamp-2">{course.description}</p>
        
        {/* Thông tin bài giảng: Đổi text-gray-500 sang màu lưỡng tính mờ 60% */}
        <div className="flex gap-2 items-center text-sm text-base-content/60 my-2">
          <div className="flex items-center gap-1">
            <FiBook size={16} className="text-primary" />
            <span className="font-medium">{course.numberOfLectures} Bài giảng</span>
          </div>
          <div className="badge badge-sm badge-primary border-none">{course.category}</div>
        </div>

        {/* Ngày tạo: Đổi text-gray-400 sang màu lưỡng tính mờ 50% */}
        <div className="text-xs text-base-content/50 mb-3 font-semibold">
          Tạo: {formatDateShort(course.createdAt)}
        </div>

        <div className="card-actions gap-2 flex-wrap">
          {/* NÚT CHI TIẾT ĐÃ ĐƯỢC SỬA: Chuyển sang dùng navigate kèm truyền dữ liệu ẩn (state) */}
          <button 
            onClick={() => navigate("/course/description", { state: { ...course } })} 
            className="btn btn-sm btn-primary gap-1 border-none"
          >
            <FiEye size={16} />
            Chi tiết
          </button>
          
          <button 
            onClick={() => navigate(`/teacher/course/${course._id}/quizzes`)}
            className="btn btn-sm btn-info gap-1 border-none"
            title="Quản lý bài kiểm tra"
          >
            <FiClipboard size={16} />
            Bài Kiểm Tra
          </button>
          
          {onEdit && (
            <button onClick={() => onEdit(course)} className="btn btn-sm btn-warning" title="Chỉnh sửa">
              <FiEdit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(course._id)} className="btn btn-sm btn-error text-white" title="Xóa">
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}