import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { formatDate, getGrade, formatPercentage } from '../Helpers/formatters';

export default function QuizResultCard({ result }) {
  const getStatusIcon = () => {
    if (result.passed) return <FiCheckCircle className="text-success" size={24} />;
    return <FiXCircle className="text-error" size={24} />;
  };

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="card-title text-lg">{result.quizTitle || 'Quiz'}</h2>
            <p className="text-sm text-gray-500">{formatDate(result.submittedAt)}</p>
          </div>
          {getStatusIcon()}
        </div>

        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-primary">{result.score || 0}</div>
            <div className="text-xs text-gray-600">Điểm</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{Math.round((result.score / result.totalMarks) * 100)}%</div>
            <div className="text-xs text-gray-600">Phần Trăm</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{getGrade((result.score / result.totalMarks) * 100)}</div>
            <div className="text-xs text-gray-600">Điểm Chữ</div>
          </div>
        </div>

        <div className="divider my-3"></div>

        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng câu hỏi:</span>
            <span className="font-semibold">{result.totalQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Câu đúng:</span>
            <span className="font-semibold text-success">{result.correctAnswers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Câu sai:</span>
            <span className="font-semibold text-error">{result.wrongAnswers}</span>
          </div>
        </div>

        <button className="btn btn-sm btn-primary mt-4">Xem Chi Tiết</button>
      </div>
    </div>
  );
}
