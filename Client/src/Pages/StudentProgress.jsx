import { useEffect, useState } from 'react';
import { FiUsers, FiSearch, FiAward, FiMail, FiArrowLeft, FiBook, FiTarget } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { courseApi } from '../Helpers/api'; 

export default function StudentProgress() {
    // === STATES ===
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // STATE MỚI: Dùng để điều khiển việc Mở/Đóng màn hình chi tiết
    const [selectedStudent, setSelectedStudent] = useState(null);

    // === FETCH DỮ LIỆU ===
    useEffect(() => {
        loadRealStudents();
    }, []);

    const loadRealStudents = async () => {
        try {
            setLoading(true);
            const response = await courseApi.getTeacherStudents();
            const rawData = response.data.students || [];
            
            const realData = rawData.map(student => ({
                id: student._id || student.userId,
                fullName: student.fullName || 'Chưa cập nhật tên',
                email: student.email || 'Chưa có email',
                courseName: student.courseTitle || 'Đang cập nhật...', 
                progress: student.progress || 0 
            }));
            
            setStudents(realData);
        } catch (error) {
            console.error("Lỗi lấy học viên:", error);
            toast.error(error?.response?.data?.message || 'Lỗi tải danh sách học viên');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // === GIAO DIỆN 1: ĐANG TẢI DỮ LIỆU ===
    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-base-100"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }

    // === GIAO DIỆN 2: CHI TIẾT 1 HỌC VIÊN (Sẽ hiện ra khi bấm nút Xem) ===
    if (selectedStudent) {
        return (
            <div className="min-h-screen bg-base-100 text-base-content animate-fade-in p-6">
                <div className="mb-8">
                    {/* Nút Quay lại: Reset State về null để hiện lại bảng */}
                    <button 
                        onClick={() => setSelectedStudent(null)}
                        className="btn btn-ghost btn-sm mb-4 gap-2 hover:bg-base-200"
                    >
                        <FiArrowLeft size={18} />
                        Quay lại danh sách
                    </button>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                        Hồ Sơ Học Tập
                    </h1>
                    <p className="text-base-content/70 mt-2 font-medium">
                        Chi tiết tiến độ và kết quả của học viên
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột Trái: Avatar & Tiến độ */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card bg-base-200 shadow-sm border border-base-300">
                            <div className="card-body items-center text-center p-8">
                                <div className="avatar placeholder mb-4">
                                    <div className="bg-primary text-primary-content rounded-full w-24 h-24 text-3xl font-black uppercase shadow-lg shadow-primary/30">
                                        {selectedStudent.fullName.charAt(0)}
                                    </div>
                                </div>
                                <h2 className="card-title text-2xl font-bold">{selectedStudent.fullName}</h2>
                                <p className="text-base-content/60 flex items-center gap-2 mt-1">
                                    <FiMail /> {selectedStudent.email}
                                </p>
                                <div className="badge badge-primary badge-outline mt-4 font-semibold px-4 py-3">
                                    Học Viên (USER)
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200 shadow-sm border border-base-300">
                            <div className="card-body p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-base-300 pb-2">
                                    <FiBook className="text-primary" /> Khóa Học Tham Gia
                                </h3>
                                <div className="mb-2">
                                    <p className="font-bold text-primary text-lg">{selectedStudent.courseName}</p>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-1 text-sm font-bold">
                                        <span>Tiến độ hoàn thành</span>
                                        <span className="text-primary">{selectedStudent.progress}%</span>
                                    </div>
                                    <progress 
                                        className={`progress w-full h-2.5 ${selectedStudent.progress === 100 ? 'progress-success' : 'progress-primary'}`} 
                                        value={selectedStudent.progress} 
                                        max="100"
                                    ></progress>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột Phải: Bảng điểm */}
                    <div className="lg:col-span-2">
                        <div className="card bg-base-200 shadow-sm border border-base-300 h-full">
                            <div className="card-body p-6">
                                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 border-b border-base-300 pb-4">
                                    <FiAward className="text-warning" size={24} /> Lịch Sử Bài Kiểm Tra
                                </h3>
                                
                                <div className="flex flex-col items-center justify-center py-16 text-center bg-base-100 rounded-xl border border-dashed border-base-300">
                                    <div className="bg-base-200 p-4 rounded-full mb-4">
                                        <FiTarget size={32} className="text-base-content/40" />
                                    </div>
                                    <h4 className="text-lg font-bold text-base-content/70">Chưa có dữ liệu bài kiểm tra</h4>
                                    <p className="text-base-content/50 text-sm max-w-md mt-2">
                                        Hệ thống đang thu thập dữ liệu điểm số của học viên <strong>{selectedStudent.fullName}</strong>. Các bài kiểm tra trắc nghiệm đã nộp sẽ hiển thị tại đây.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // === GIAO DIỆN 3: DANH SÁCH LỚP HỌC (Mặc định) ===
    return (
        <div className="min-h-screen bg-base-100 text-base-content animate-fade-in p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                        <FiUsers /> Quản Lý Học Viên
                    </h1>
                    <p className="text-base-content/70 mt-2 font-medium">
                        Theo dõi tiến độ và hỗ trợ học viên trong các khóa học của bạn
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder="Tìm tên hoặc email..." 
                        className="input input-bordered w-full pl-10 rounded-xl bg-base-200 focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="absolute left-4 top-3.5 text-base-content/50" size={18} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-base-200 shadow-sm border border-base-300">
                    <div className="card-body p-6 flex flex-row items-center gap-4">
                        <div className="p-4 bg-primary/20 text-primary rounded-xl">
                            <FiUsers size={28} />
                        </div>
                        <div>
                            <div className="text-3xl font-black">{students.length}</div>
                            <div className="text-sm font-semibold text-base-content/70">Tổng Học Viên</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-base-200 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-base-300/50 text-base-content text-sm">
                            <tr>
                                <th>Học Viên</th>
                                <th>Khóa Học Đang Tham Gia</th>
                                <th>Tiến Độ</th>
                                <th className="text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-base-content/50 font-medium">
                                        Chưa có học viên nào tham gia khóa học của bạn.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-base-300/30 transition-colors">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-primary text-primary-content rounded-full w-10 h-10 font-bold uppercase">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{student.fullName}</div>
                                                    <div className="text-xs text-base-content/60 flex items-center gap-1">
                                                        <FiMail size={12}/> {student.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-medium text-base-content/80">
                                            {student.courseName}
                                        </td>
                                        <td className="w-48">
                                            <div className="flex items-center gap-2">
                                                <progress 
                                                    className={`progress w-full ${student.progress === 100 ? 'progress-success' : 'progress-primary'}`} 
                                                    value={student.progress} 
                                                    max="100"
                                                ></progress>
                                                <span className="text-xs font-bold">{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            {/* Nút bấm Kích hoạt mở Chi tiết */}
                                            <button 
                                                className="btn btn-sm btn-ghost hover:bg-primary/20 hover:text-primary rounded-lg"
                                                title="Xem hồ sơ học tập"
                                                onClick={() => setSelectedStudent(student)}
                                            >
                                                <FiAward size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}