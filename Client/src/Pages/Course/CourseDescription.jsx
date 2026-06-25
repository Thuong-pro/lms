import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import CourseAssignments from './CourseAssignments';
import CourseComments from './CourseComments';
import { courseApi } from '../../Helpers/api';

function CourseDescripition() {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    const { role, data } = useSelector((state) => state.auth);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    // Xử lý lỗi nếu người dùng tự gõ URL mà không có state (Tránh vỡ trang)
    if (!state) {
        navigate("/courses");
        return null;
    }

    // Kiểm tra enrollment status cho khóa học này
    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (role !== 'ADMIN' && role !== 'TEACHER' && state?._id) {
                try {
                    const res = await courseApi.checkEnrollment(state._id);
                    setIsEnrolled(res.data.isEnrolled || false);
                } catch (error) {
                    console.error('Error checking enrollment:', error);
                    setIsEnrolled(false);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        checkEnrollmentStatus();
    }, [state?._id, role]);

    return (
        <div className="min-h-[90vh] pt-12 px-4 md:px-10 flex flex-col items-center justify-center text-base-content pb-10 w-full">
            
            {/* THẺ BAO BỌC CHÍNH: Thay nền xám đen bằng bg-base-100, thay shadow đen bằng viền và shadow chuẩn */}
            <div className="flex flex-col items-center justify-center shadow-xl border border-base-200 w-full max-w-5xl bg-base-100 rounded-2xl overflow-hidden">
                
                {/* Header Khóa học */}
                <div className="mt-8 px-6 w-full text-center">  
                    <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {state?.title}
                    </h1>
                </div>
                
                {/* Khu vực Thông tin chính */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 py-8 px-6 md:px-12 w-full">
                    
                    {/* Cột trái: Ảnh và Thông số */}
                    <div className="space-y-6">
                        <img
                            className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md border border-base-200"
                            alt="thumbnail"
                            src={state?.thumbnail?.secure_url}
                        />
                        <div className="flex flex-col items-center justify-center text-lg bg-base-200 p-4 rounded-xl border border-base-300">
                            <p className="font-semibold mb-2 flex items-center">
                                <span className="text-primary mr-2">Total lectures:</span>
                                {state?.numberOfLectures}
                            </p>
                            <p className="font-semibold flex items-center">
                                <span className="text-primary mr-2">Instructor:</span>
                                {state?.createdBy}
                            </p>
                        </div>
                    </div>

                    {/* Cột phải: Mô tả và Nút hành động */}
                    <div className="space-y-4 flex flex-col">
                        <p className="text-xl font-bold text-primary border-b border-base-300 pb-2">
                            Course description:
                        </p>
                        {/* Thêm whitespace-pre-wrap để hiển thị đúng xuống dòng của mô tả */}
                        <p className="flex-1 lg:h-60 overflow-y-auto pr-2 text-base-content/80 whitespace-pre-wrap">
                            {state?.description}
                        </p>
                        
                        <div className="pt-4">
                            {role === "ADMIN" || role === "TEACHER" || isEnrolled ? (
                                <button 
                                    onClick={() => navigate("/course/displaylecture", { state: { ...state } })} 
                                    className="btn btn-primary w-full text-lg h-14 border-none"
                                >
                                    Watch Lectures
                                </button>
                            ) : (
                                <button 
                                    onClick={() => navigate("/checkout", { state: { courseId: state?._id, courseName: state?.title } })} 
                                    className="btn btn-warning w-full text-lg h-14 border-none"
                                >
                                    Subscribe to Access
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* === PHẦN BÀI TẬP VÀ BÌNH LUẬN === */}
                {/* Đã xóa text-black cứng, thay border-gray-600 bằng class chuẩn của DaisyUI */}
                {(role === "ADMIN" || role === "TEACHER" || isEnrolled) && (
                    <div className="w-full px-6 md:px-12 pb-10 text-base-content">
                        <div className="divider mb-8 text-primary font-semibold text-lg">Course Content & Discussions</div>
                        
                        <div className="space-y-8">
                            <CourseAssignments courseId={state?._id} />
                            <CourseComments courseId={state?._id} />
                        </div>
                    </div>
                )}

            </div>
        </div>  
    );
}

export default CourseDescripition;