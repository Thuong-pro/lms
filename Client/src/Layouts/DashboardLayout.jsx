import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    FiHome, FiPlusCircle, FiUsers, FiLogOut, FiSettings, FiPieChart,
    FiBook, FiAward, FiBarChart2, FiActivity // Import thêm icon cho Student
} from 'react-icons/fi';
import { logout } from '../Redux/Slices/AuthSlice.js';

import ThemeToggle from '../Compontents/ThemeToggle';

export default function DashboardLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { role, data: user } = useSelector((state) => state?.auth);

    const handleLogout = async (e) => {
        e.preventDefault();
        const res = await dispatch(logout());
        if (res?.payload?.success) navigate("/");
    };

    // Hàm kiểm tra link active
    const isActive = (path) => location.pathname === path 
        ? "bg-primary/10 text-primary font-bold border-r-4 border-primary" 
        : "text-base-content/70 hover:bg-base-300 hover:text-base-content font-medium";

    return (
        <div className="min-h-screen bg-base-100 flex text-base-content">
            
            {/* SIDEBAR BÊN TRÁI */}
            <aside className="w-64 bg-base-200 shadow-xl flex flex-col fixed h-full z-20 border-r border-base-300 transition-colors">
                
                {/* Logo */}
                <div className="h-16 flex items-center justify-center border-b border-base-300">
                    <Link to="/" className="text-2xl font-black tracking-wider">
                        <span className="text-primary">Zero2</span>One
                    </Link>
                </div>

                {/* Menu Điều hướng */}
                <div className="flex-1 overflow-y-auto py-6">
                    <ul className="space-y-2">
                        
                        {/* ========================================= */}
                        {/* MENU DÀNH RIÊNG CHO ADMIN                 */}
                        {/* ========================================= */}
                        {role === 'ADMIN' && (
                            <>
                                <li>
                                    <Link to="/admin/deshboard" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/admin/deshboard')}`}>
                                        <FiPieChart size={20} /> Admin Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/course/create" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/course/create')}`}>
                                        <FiPlusCircle size={20} /> Tạo Khóa Học
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* ========================================= */}
                        {/* MENU DÀNH RIÊNG CHO TEACHER               */}
                        {/* ========================================= */}
                        {role === 'TEACHER' && (
                            <>
                                <li>
                                    <Link to="/teacher/dashboard" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/teacher/dashboard')}`}>
                                        <FiHome size={20} /> Tổng Quan
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/course/create" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/course/create')}`}>
                                        <FiPlusCircle size={20} /> Tạo Khóa Học
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/teacher/quiz/create" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/teacher/quiz/create')}`}>
                                        <FiSettings size={20} /> Bài Tập Trắc Nghiệm
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/teacher/students" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/teacher/students')}`}>
                                        <FiUsers size={20} /> Học Viên
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* ========================================= */}
                        {/* MENU DÀNH RIÊNG CHO STUDENT               */}
                        {/* ========================================= */}
                        {role === 'USER' && (
                            <>
                                <li>
                                    <Link to="/student/dashboard" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/student/dashboard')}`}>
                                        <FiBarChart2 size={20} /> Tổng Quan
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/student/courses" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/student/courses')}`}>
                                        <FiBook size={20} /> Khóa Học Của Tôi
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/student/quizzes" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/student/quizzes')}`}>
                                        <FiAward size={20} /> Bài Kiểm Tra
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/student/progress" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/student/progress')}`}>
                                        <FiActivity size={20} /> Tiến Độ Học Tập
                                    </Link>
                                </li>
                            </>
                        )}

                    </ul>
                </div>

                {/* Thông tin User & Nút Đăng xuất */}
                <div className="border-t border-base-300 p-5 bg-base-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase border border-primary/30">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold text-base-content truncate">{user?.fullName}</p>
                            <p className="text-xs text-base-content/60 truncate font-semibold">{role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-error hover:bg-error/10 py-2.5 rounded-lg transition-colors font-bold">
                        <FiLogOut size={18} /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* KHU VỰC NỘI DUNG CHÍNH */}
            <main className="flex-1 ml-64 flex flex-col bg-base-100 transition-colors">
                
                {/* --- HEADER --- */}
                <header className="h-16 bg-base-100 border-b border-base-200 flex items-center justify-end px-8 z-10 transition-colors">
                    <ThemeToggle />
                </header>

                <div className="p-8 flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}