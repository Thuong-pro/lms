import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axiosInstance from '../../Helpers/axiosInstance'; 

const CourseAssignments = ({ courseId }) => {
    const [assignments, setAssignments] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submissionContent, setSubmissionContent] = useState('');
    
    // State để quản lý việc giáo viên đang chọn chấm điểm cho ai
    const [gradeInput, setGradeInput] = useState({ assignmentId: '', studentId: '', score: '', feedback: '' });

    // Lấy thông tin user từ Redux
    const { role, data } = useSelector((state) => state.auth);
    const myId = data?._id; 

    // HÀM LẤY DỮ LIỆU TỪ BACKEND
    const fetchAssignments = async () => {
        try {
            const response = await axiosInstance.get(`/assignments/${courseId}`);
            if (response.data?.success) {
                setAssignments(response.data.assignments);
            }
        } catch (error) {
            console.error("Lỗi fetch:", error);
        }
    };

    useEffect(() => {
        if (courseId) fetchAssignments();
    }, [courseId]);

    // [PB10] CHỈ GIÁO VIÊN: TẠO BÀI TẬP
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/assignments', { courseId, title, description });
            toast.success("Đã giao bài tập mới!");
            setTitle(''); setDescription('');
            fetchAssignments(); 
        } catch (error) {
            toast.error("Lỗi khi giao bài tập");
        }
    };

    // [THÊM MỚI] CHỈ GIÁO VIÊN: XÓA BÀI TẬP
    const handleDeleteAssignment = async (assignmentId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài tập này? (Sẽ xóa luôn cả bài nộp của học sinh)")) {
            try {
                await axiosInstance.delete(`/assignments/${assignmentId}`);
                toast.success("Đã xóa bài tập!");
                fetchAssignments();
            } catch (error) {
                toast.error("Lỗi khi xóa bài tập.");
            }
        }
    };

    // [PB11] HỌC SINH: NỘP BÀI
    const handleSubmitAssignment = async (assignmentId) => {
        if (!submissionContent) return toast.error("Vui lòng dán link bài làm!");
        try {
            await axiosInstance.post(`/assignments/${assignmentId}/submit`, { content: submissionContent });
            toast.success("Nộp bài thành công!");
            setSubmissionContent('');
            fetchAssignments(); 
        } catch (error) {
            toast.error("Lỗi khi nộp bài");
        }
    };

    // [PB12] CHỈ GIÁO VIÊN: CHẤM ĐIỂM
    const handleGradeSubmit = async (e, assignmentId, studentId) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/assignments/${assignmentId}/grade/${studentId}`, {
                score: gradeInput.score,
                feedback: gradeInput.feedback
            });
            toast.success("Đã lưu điểm!");
            setGradeInput({ assignmentId: '', studentId: '', score: '', feedback: '' });
            fetchAssignments(); 
        } catch (error) {
            toast.error("Lỗi khi chấm điểm");
        }
    };

    return (
        <div className="mt-8 p-6 border border-base-300 rounded-2xl bg-base-200 text-base-content shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-primary border-b-2 border-base-300 pb-3 flex items-center gap-2">
                📖 Danh Sách Bài Tập
            </h2>

            {/* PHẦN 1: DÀNH RIÊNG CHO GIÁO VIÊN - FORM TẠO BÀI TẬP */}
            {role === 'TEACHER' && (
                <form onSubmit={handleCreateAssignment} className="mb-10 p-5 bg-base-100 rounded-xl border border-base-300 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-primary">➕ Tạo bài tập mới</h3>
                    <input 
                        type="text" placeholder="Tên bài tập (Ví dụ: Bài tập chương 1)..." required
                        className="w-full mb-3 p-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-base-content"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea 
                        placeholder="Yêu cầu cụ thể..." required rows="2"
                        className="w-full mb-4 p-3 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-base-content resize-none"
                        value={description} onChange={(e) => setDescription(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary px-8">
                        Giao Bài
                    </button>
                </form>
            )}

            {/* PHẦN 2: DANH SÁCH BÀI TẬP HIỂN THỊ CHUNG */}
            <div className="space-y-6">
                {assignments.length === 0 ? (
                    <p className="text-base-content/60 italic text-center py-6 bg-base-100 rounded-xl border border-base-200">Chưa có bài tập nào cho khóa học này.</p>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment._id} className="p-6 border border-base-300 rounded-xl bg-base-100 relative shadow-sm">
                            
                            {/* Nút Xóa bài tập dành cho Teacher */}
                            {role === 'TEACHER' && (
                                <button 
                                    onClick={() => handleDeleteAssignment(assignment._id)}
                                    className="absolute top-4 right-4 btn btn-error btn-sm text-white"
                                >
                                    🗑️ Xóa bài
                                </button>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div className="pr-24">
                                    <h4 className="font-bold text-xl text-primary">{assignment.title}</h4>
                                    <p className="text-base-content/80 mt-2">{assignment.description}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-base-200">
                                
                                {/* A. HIỂN THỊ CHO HỌC SINH (Chỉ USER mới thấy phần nộp bài) */}
                                {(role === 'USER') && (
                                    <div className="mt-2">
                                        {/* Tìm xem mình đã nộp chưa */}
                                        {assignment.submissions.find(s => s.studentId === myId) ? (
                                            <div className="bg-success/10 p-4 rounded-xl border border-success/30">
                                                <p className="text-success font-bold mb-2">✅ Bạn đã hoàn thành bài nộp này!</p>
                                                <p className="text-sm text-base-content/80 mb-3">Link bài: <a href={assignment.submissions.find(s => s.studentId === myId).content} target="_blank" rel="noreferrer" className="text-info hover:underline">Xem bài nộp</a></p>
                                                
                                                {/* HIỂN THỊ ĐIỂM KHI CÓ */}
                                                <div className="p-3 bg-base-100 rounded-lg border border-base-200">
                                                    <p className="font-medium">Điểm số: <span className="font-bold text-error text-lg ml-1">
                                                        {assignment.submissions.find(s => s.studentId === myId).score ?? "Đang chờ chấm..."}
                                                    </span></p>
                                                    {assignment.submissions.find(s => s.studentId === myId).feedback && (
                                                        <p className="text-sm text-base-content/60 mt-1 italic">Lời nhắn: "{assignment.submissions.find(s => s.studentId === myId).feedback}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <p className="font-semibold text-base-content">Nộp bài tại đây:</p>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" placeholder="Dán link Google Drive/Github bài làm..."
                                                        className="flex-1 p-2 bg-base-100 border border-base-300 text-base-content rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                        onChange={(e) => setSubmissionContent(e.target.value)}
                                                    />
                                                    <button 
                                                        onClick={() => handleSubmitAssignment(assignment._id)}
                                                        className="btn btn-success text-white px-6"
                                                    >
                                                        Gửi Bài
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* B. HIỂN THỊ CHO GIÁO VIÊN - DANH SÁCH HỌC SINH NỘP */}
                                {role === 'TEACHER' && (
                                    <div className="bg-base-200 p-5 rounded-xl border border-base-300 mt-2">
                                        <h5 className="font-bold text-base-content mb-4">👨‍🎓 Danh sách nộp bài ({assignment.submissions.length})</h5>
                                        {assignment.submissions.length === 0 ? (
                                            <p className="text-base-content/50 text-sm">Chưa có học viên nào nộp bài.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {assignment.submissions.map(sub => (
                                                    <div key={sub.studentId} className="p-4 border border-base-300 rounded-lg bg-base-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                        <div>
                                                            <p className="font-bold text-primary">{sub.studentName}</p>
                                                            <a href={sub.content} target="_blank" rel="noreferrer" className="text-sm text-info hover:underline inline-block mt-1">Mở link bài làm</a>
                                                            <p className="text-sm mt-2 text-base-content/70">Điểm: <span className="font-bold text-error">{sub.score ?? 'Chưa chấm'}</span></p>
                                                        </div>

                                                        {/* FORM CHẤM ĐIỂM NHANH */}
                                                        {gradeInput.studentId === sub.studentId && gradeInput.assignmentId === assignment._id ? (
                                                            <form onSubmit={(e) => handleGradeSubmit(e, assignment._id, sub.studentId)} className="flex flex-col gap-2 w-full md:w-1/2">
                                                                <input type="number" placeholder="Điểm 0-10" required className="input input-sm input-bordered w-full" value={gradeInput.score} onChange={e => setGradeInput({...gradeInput, score: e.target.value})} />
                                                                <input type="text" placeholder="Nhận xét..." className="input input-sm input-bordered w-full" value={gradeInput.feedback} onChange={e => setGradeInput({...gradeInput, feedback: e.target.value})} />
                                                                <div className="flex gap-2 mt-1">
                                                                    <button type="submit" className="btn btn-sm btn-primary flex-1">Lưu</button>
                                                                    <button type="button" onClick={() => setGradeInput({ assignmentId: '', studentId: '', score: '', feedback: '' })} className="btn btn-sm btn-outline flex-1">Hủy</button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setGradeInput({ assignmentId: assignment._id, studentId: sub.studentId, score: sub.score || '', feedback: sub.feedback || '' })}
                                                                className="btn btn-sm btn-warning text-white"
                                                            >
                                                                Chấm Điểm
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseAssignments;