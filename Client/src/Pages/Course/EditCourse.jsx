import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { updateCourse } from "../../Redux/Slices/CourseSlice";

function EditCourse() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { state } = useLocation();
    
    // Nếu không có state (người dùng tự gõ url /course/edit), đá về trang danh sách
    if (!state) {
        navigate("/courses");
        return null; 
    }

    const [userInput, setUserInput] = useState({
        id: state?._id,
        title: state?.title,
        category: state?.category,
        description: state?.description,
        createdBy: state?.createdBy,
        thumbnail: null,
        previewImage: state?.thumbnail?.secure_url,
    });

    function handleImageUpload(e) {
        e.preventDefault();
        const uploadedImage = e.target.files[0];
        if (uploadedImage) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(uploadedImage);
            fileReader.addEventListener("load", function () {
                setUserInput({
                    ...userInput,
                    previewImage: this.result,
                    thumbnail: uploadedImage
                });
            });
        }
    }

    function handleUserInput(e) {
        e.preventDefault();
        const { name, value } = e.target;
        setUserInput({
            ...userInput,
            [name]: value
        });
    }

    async function OnFormSubmit(e) {
        e.preventDefault();
        if (!userInput.title || !userInput.description || !userInput.category) {
            toast.error("All fields are mandatory");
            return;
        }

        const response = await dispatch(updateCourse(userInput));
        if (response?.payload?.success) {
            setUserInput({
                title: "",
                category: "",
                description: "",
                thumbnail: null,
            });
            // Tùy theo logic của bạn, sau khi sửa xong có thể đẩy về Admin Dashboard hoặc Teacher Dashboard
            navigate(-1); 
        }
    }

    return (
        <div className="w-full flex items-center justify-center p-4">
            {/* THẺ BAO BỌC: Bỏ class text-white và bóng đổ đen. Dùng bg-base-100 */}
            <form
                onSubmit={OnFormSubmit}
                className="w-full max-w-4xl bg-base-100 text-base-content shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-gray-800 rounded-lg p-8 relative flex flex-col gap-6"
            >
                <div>
                    <button onClick={() => navigate(-1)} type="button" className="absolute top-8 left-8 text-2xl text-accent hover:text-primary transition-colors cursor-pointer">
                        <AiOutlineArrowLeft />
                    </button>
                </div>

                <h1 className="text-center text-3xl font-bold tracking-wide">
                    Edit Course
                </h1>

                <main className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* ===== CỘT BÊN TRÁI ===== */}
                    <div className="flex flex-col gap-6">
                        {/* Cập nhật Ảnh */}
                        <div>
                            <label htmlFor="image_uploads" className="cursor-pointer">
                                {userInput.previewImage ? (
                                    <img
                                        className="w-full h-64 object-cover rounded-lg border border-base-300"
                                        src={userInput.previewImage}
                                        alt="thumbnail preview"
                                    />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-base-300 hover:border-primary bg-base-200 rounded-lg transition-colors">
                                        <h1 className="font-bold text-lg text-base-content/60">Upload your course thumbnail</h1>
                                    </div>
                                )}
                            </label>
                            <input
                                className="hidden"
                                type="file"
                                id="image_uploads"
                                accept=".jpg, .jpeg, .png"
                                name="image_uploads"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* Tiêu đề khóa học */}
                        <div className="flex flex-col gap-2">
                            <label className="text-lg font-semibold text-base-content/90" htmlFor="title">
                                Course title
                            </label>
                            <input
                                required
                                type="text"
                                name="title"
                                id="title"
                                placeholder="Enter course title"
                                className="bg-base-100 text-base-content border border-base-300 px-4 py-2 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                value={userInput.title}
                                onChange={handleUserInput}
                            />
                        </div>
                    </div>

                    {/* ===== CỘT BÊN PHẢI ===== */}
                    <div className="flex flex-col gap-6">
                        {/* Tên Giảng Viên */}
                        <div className="flex flex-col gap-2">
                            <label className="text-lg font-semibold text-base-content/90" htmlFor="createdBy">
                                Course Instructor
                            </label>
                            <input
                                required
                                type="text"
                                name="createdBy"
                                id="createdBy"
                                placeholder="Enter course instructor"
                                className="bg-base-100 text-base-content border border-base-300 px-4 py-2 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                value={userInput.createdBy}
                                onChange={handleUserInput}
                            />
                        </div>

                        {/* Danh mục */}
                        <div className="flex flex-col gap-2">
                            <label className="text-lg font-semibold text-base-content/90" htmlFor="category">
                                Course category
                            </label>
                            <input
                                required
                                type="text"
                                name="category"
                                id="category"
                                placeholder="Enter course category"
                                className="bg-base-100 text-base-content border border-base-300 px-4 py-2 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                value={userInput.category}
                                onChange={handleUserInput}
                            />
                        </div>

                        {/* Mô tả */}
                        <div className="flex flex-col gap-2">
                            <label className="text-lg font-semibold text-base-content/90" htmlFor="description">
                                Course description
                            </label>
                            <textarea
                                required
                                name="description"
                                id="description"
                                placeholder="Enter course description"
                                className="bg-base-100 text-base-content border border-base-300 px-4 py-2 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors h-28 resize-none"
                                value={userInput.description}
                                onChange={handleUserInput}
                            />
                        </div>
                    </div>
                </main>

                <button type="submit" className="btn btn-primary w-full mt-4 text-lg border-none">
                    Update Course
                </button>

            </form>
        </div>
    );
}

export default EditCourse;