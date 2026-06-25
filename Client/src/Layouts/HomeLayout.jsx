import { AiFillCloseCircle } from 'react-icons/ai';
import { FiMenu, FiSettings, FiBook } from 'react-icons/fi'; // Đã thêm icon FiBook
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, Outlet } from 'react-router-dom';

import Footer from '../Compontents/Footer.jsx';
import ThemeToggle from '../Compontents/ThemeToggle.jsx';
import { logout } from '../Redux/Slices/AuthSlice.js';

function HomeLayout() {
    const dispatch = useDispatch(); 
    const navigate = useNavigate();

    const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
    const role = useSelector((state) => state?.auth?.role);

    function changeWidth() {
        const drawerSide = document.getElementsByClassName("drawer-side");
        drawerSide[0].style.width = 'auto';
    }

    function hideDrawer() {
        const element = document.getElementsByClassName("drawer-toggle");
        element[0].checked = false;

        const drawerSide = document.getElementsByClassName("drawer-side");
        drawerSide[0].style.width = '0';
    }

    async function handleLogout(e) {
        e.preventDefault();
        const res = await dispatch(logout());
        if(res?.payload?.success) {
            navigate("/");
            hideDrawer(); 
        }
    }

    return (
        <div className="min-h-screen bg-base-100 text-base-content relative transition-colors duration-300">
            
            {/* ============================================================== */}
            {/* THANH TOP BAR                                                  */}
            {/* ============================================================== */}
            <div className="absolute top-0 w-full z-40 flex items-center justify-between p-4 px-6">
                
                <label htmlFor="my-drawer" className="cursor-pointer bg-base-200/50 p-2 rounded-full hover:bg-base-300 transition-colors">
                    <FiMenu size={28} onClick={changeWidth} className="text-base-content" />
                </label>

                <div className="flex items-center gap-4 bg-base-200/50 p-1 pr-3 rounded-full shadow-sm backdrop-blur-sm border border-base-300/50">
                    
                    {/* NÚT 1: Vào Quản Trị (Dành cho ADMIN và TEACHER) */}
                    {(isLoggedIn && (role === 'ADMIN' || role === 'TEACHER')) && (
                        <button 
                            onClick={() => navigate(role === 'ADMIN' ? '/admin/deshboard' : '/teacher/dashboard')}
                            className="btn btn-sm btn-primary rounded-full px-4 gap-2 border-none"
                        >
                            <FiSettings size={14} />
                            Vào Quản Trị
                        </button>
                    )}

                    {/* NÚT 2: Không Gian Học Tập (Dành cho HỌC VIÊN/USER) */}
                    {(isLoggedIn && (role === 'USER' || role === 'STUDENT')) && (
                        <button 
                            onClick={() => navigate('/student/dashboard')}
                            className="btn btn-sm btn-info rounded-full px-4 gap-2 border-none text-white"
                        >
                            <FiBook size={14} />
                            Không Gian Học Tập
                        </button>
                    )}

                    {/* NÚT SÁNG/TỐI */}
                    <ThemeToggle />
                </div>
            </div>

            {/* ============================================================== */}
            {/* MENU BÊN TRÁI (DRAWER)                                         */}
            {/* ============================================================== */}
            <div className="drawer absolute left-0 z-50 w-fit">
                <input className="drawer-toggle" id="my-drawer" type="checkbox" />
                
                <div className="drawer-side w-0 transition-all duration-300">
                    <label htmlFor="my-drawer" className="drawer-overlay"></label>
                    <ul className="menu p-4 w-64 h-full bg-base-200 text-base-content relative shadow-2xl border-r border-base-300">
                        
                        <li className="w-fit absolute right-2 z-50">
                            <button onClick={hideDrawer} className="text-base-content/60 hover:text-error transition-colors">
                                <AiFillCloseCircle size={28} />
                            </button>
                        </li>

                        <div className="mt-8 space-y-2 font-semibold text-lg">
                            <li><Link to="/" onClick={hideDrawer}>Trang Chủ</Link></li>
                            <li><Link to="/courses" onClick={hideDrawer}>Tất cả khóa học</Link></li>
                            <li><Link to="/forum" onClick={hideDrawer}>Diễn đàn</Link></li>
                            <li><Link to="/about" onClick={hideDrawer}>Giới thiệu</Link></li>
                            <li><Link to="/contact" onClick={hideDrawer}>Liên hệ</Link></li>
                        </div>

                        <div className="absolute bottom-6 w-[calc(100%-2rem)] space-y-3">
                            {!isLoggedIn ? (
                                <>
                                    <button className='btn btn-primary w-full text-lg border-none'>
                                        <Link to="/login" onClick={hideDrawer} className="w-full">Đăng nhập</Link>
                                    </button>
                                    <button className='btn btn-secondary w-full text-lg border-none'>
                                        <Link to="/signup" onClick={hideDrawer} className="w-full">Đăng ký</Link>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className='btn btn-primary w-full text-lg border-none'>
                                        <Link to="/user/profile" onClick={hideDrawer} className="w-full">Hồ sơ cá nhân</Link>
                                    </button>
                                    <button onClick={handleLogout} className='btn btn-error w-full text-lg text-white'>
                                        Đăng xuất
                                    </button>
                                </>
                            )}
                        </div>

                    </ul>
                </div>
            </div>

            {/* ============================================================== */}
            {/* KHU VỰC HIỂN THỊ NỘI DUNG TRANG (OUTLET)                       */}
            {/* ============================================================== */}
            <div className="min-h-screen">
                <Outlet />
            </div>
            
            <Footer />
        </div>
    );
}

export default HomeLayout;