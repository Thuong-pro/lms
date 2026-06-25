import { FiTrash2, FiEdit2, FiBarChart2 } from 'react-icons/fi';
import { formatDateShort } from '../Helpers/formatters';

export default function QuizCard({ quiz, onEdit, onDelete, onViewResults }) {
  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body">
        <h2 className="card-title text-lg line-clamp-1">{quiz.title}</h2>
        <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>

        <div className="grid grid-cols-3 gap-2 text-sm my-2">
          <div className="stat-cell">
            <div className="font-semibold text-primary">{quiz.numberOfQuestions}</div>
            <div className="text-xs text-gray-500">Câu hỏi</div>
          </div>
          <div className="stat-cell">
            <div className="font-semibold text-info">{quiz.passingScore}%</div>
            <div className="text-xs text-gray-500">Điểm qua</div>
          </div>
          <div className="stat-cell">
            <div className="font-semibold text-warning">{quiz.timeLimit}m</div>
            <div className="text-xs text-gray-500">Thời gian</div>
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-3">
          Tạo: {formatDateShort(quiz.createdAt)}
        </div>

        <div className="badge" style={{
          backgroundColor: quiz.isActive ? '#10b981' : '#ef4444'
        }}>
          {quiz.isActive ? '🟢 Hoạt động' : '🔴 Không hoạt động'}
        </div>

        <div className="card-actions gap-2 mt-4">
          {onViewResults && (
            <button onClick={() => onViewResults(quiz._id)} className="btn btn-sm btn-info flex-1">
              <FiBarChart2 size={16} />
              Kết quả
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(quiz)} className="btn btn-sm btn-warning">
              <FiEdit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(quiz._id)} className="btn btn-sm btn-error">
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
