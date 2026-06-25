import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { createNewCourse } from "../../Redux/Slices/CourseSlice";

function CreateCourse() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userInput, setUserInput] = useState({
        title: "",
        category: "",
        description: "",
        thumbnail: null,
        previewImage: ""
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
        // Sửa lỗi cú pháp ở điều kiện check thumbnail
        if (!userInput.title || !userInput.description || !userInput.category || !userInput.thumbnail || !userInput.previewImage) {
            toast.error("All fields are mandatory");
            return;
        }

        const response = await dispatch(createNewCourse(userInput));
        if (response?.payload?.success) {
            setUserInput({
                title: "",
                category: "",
                description: "",
                thumbnail: null,
                previewImage: ""
            });
            // Tương tự EditCourse, trả người dùng về trang trước đó (Admin/Teacher Dashboard) thay vì văng ra ngoài Public
            navigate(-1); 
        }
    }

    return (
        <div className="w-full flex items-center justify-center p-4 min-h-screen">
            {/* THẺ BAO BỌC: Bỏ text-white và shadow đen, dùng bg-base-100 */}
            <form
                onSubmit={OnFormSubmit}
                className="w-full max-w-4xl bg-base-100 text-base-content shadow-xl border border-base-200 rounded-2xl p-8 relative flex flex-col gap-6"
            >
                <div>
                    <button onClick={() => navigate(-1)} type="button" className="absolute top-8 left-8 text-2xl text-base-content/50 hover:text-primary transition-colors cursor-pointer">
                        <AiOutlineArrowLeft />
                    </button>
                </div>

                <h1 className="text-center text-3xl font-bold tracking-wide text-primary">
                    Tạo khóa học mới
                </h1>

                <main className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* ===== CỘT BÊN TRÁI ===== */}
                    <div className="flex flex-col gap-6">
                        {/* Cập nhật Ảnh */}
                        <div>
                            <label htmlFor="image_uploads" className="cursor-pointer">
                                {userInput.previewImage ? (
                                    <img
                                        className="w-full h-64 object-cover rounded-xl border border-base-300 shadow-sm hover:opacity-90 transition-opacity"
                                        src={userInput.previewImage}
                                        alt="thumbnail preview"
                                    />
                                ) : (
                                    <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-base-300 hover:border-primary hover:bg-base-200/50 bg-base-200 rounded-xl transition-all">
                                        <div className="text-4xl text-base-content/30 mb-2">+</div>
                                        <h1 className="font-semibold text-lg text-base-content/60">Upload Thumbnail</h1>
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
                            <label className="text-sm font-semibold text-base-content/80 uppercase tracking-wider" htmlFor="title">
                                Tên khóa học
                            </label>
                            <input
                                required
                                type="text"
                                name="title"
                                id="title"
                                placeholder="Enter course title"
                                className="bg-base-100 text-base-content border border-base-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                value={userInput.title}
                                onChange={handleUserInput}
                            />
                        </div>
                    </div>

                    {/* ===== CỘT BÊN PHẢI ===== */}
                    <div className="flex flex-col gap-6">
                        {/* Tên Giảng Viên */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-base-content/80 uppercase tracking-wider" htmlFor="createdBy">
                                Tên giảng viên
                            </label>
                            <input
                                required
                                type="text"
                                name="createdBy"
                                id="createdBy"
                                placeholder="Enter instructor name"
                                className="bg-base-100 text-base-content border border-base-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                value={userInput.createdBy}
                                onChange={handleUserInput}
                            />
                        </div>

                        {/* Danh mục */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-base-content/80 uppercase tracking-wider" htmlFor="category">
                                Danh mục
                            </label>
                            <input
                                required
                                type="text"
                                name="category"
                                id="category"
                                placeholder="E.g. Web Development"
                                className="bg-base-100 text-base-content border border-base-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                value={userInput.category}
                                onChange={handleUserInput}
                            />
                        </div>

                        {/* Mô tả */}
                        <div className="flex flex-col gap-2 h-full">
                            <label className="text-sm font-semibold text-base-content/80 uppercase tracking-wider" htmlFor="description">
                                Mô tả
                            </label>
                            <textarea
                                required
                                name="description"
                                id="description"
                                placeholder="What will students learn in this course?"
                                className="bg-base-100 text-base-content border border-base-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all h-full min-h-[120px] resize-none"
                                value={userInput.description}
                                onChange={handleUserInput}
                            />
                        </div>
                    </div>
                </main>

                <button type="submit" className="btn btn-primary w-full mt-6 h-14 text-lg">
                    Thêm khóa học
                </button>

            </form>
        </div>
    );
}

export default CreateCourse;