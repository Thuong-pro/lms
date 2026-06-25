import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CourseCard from "../../Compontents/CourseCard";
import { getAllCourse } from "../../Redux/Slices/CourseSlice";

function CourseList() {
    const dispatch = useDispatch();
    const { courseData } = useSelector((state) => state.course);

    async function loadCourses() {
        await dispatch(getAllCourse());
    }

    useEffect(() => {
        loadCourses();
    }, []);

    return (
        // Bỏ text-white, dùng text-base-content. Thêm px-4 để có lề 2 bên trên mobile
        <div className="min-h-[90vh] pt-12 flex flex-col gap-10 text-base-content px-4 md:px-10 lg:px-20 w-full">
            
            <h1 className="text-center text-3xl font-semibold">
                Tìm kiếm khóa học của bạn từ các{" "}
                {/* Dùng text-primary thay cho text-yellow-500 để tự động theo theme */}
                <span className="font-bold text-primary">
                    Chuyên gia 
                </span>
            </h1>

            {/* Kiểm tra nếu có khóa học thì hiện Grid, không thì hiện thông báo */}
            {courseData && courseData.length > 0 ? (
                // Chỉnh lại grid cho responsive mượt hơn (thêm lg:grid-cols-3, xl:grid-cols-4)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto mb-10 w-full max-w-7xl">
                    {courseData.map((element) => {
                        return <CourseCard key={element._id} data={element} />;
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-20 text-base-content/60">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-xl">Đang tải khóa học hoặc chưa có khóa học nào...</p>
                </div>
            )}
            
        </div>
    );
}

export default CourseList;