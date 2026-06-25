import { FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    // Sửa lại thành:
<Link to={`/forum/category/${category._id}/threads`}>
      <div className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white hover:bg-gray-50">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{category.icon || '💬'}</div>
          <div>
            <h3 className="font-bold text-lg">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t">
          <span className="flex items-center gap-1">
            <FiMessageSquare size={16} />
            {category.threadCount || 0} bài viết
          </span>
          <span>
            {category.replyCount || 0} trả lời
          </span>
        </div>
      </div>
    </Link>
  );
}
