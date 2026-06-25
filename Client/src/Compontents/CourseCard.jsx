import { useNavigate } from "react-router-dom";

function CourseCard({ data }) {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate("/course/description", { state: { ...data } })}
            className="card w-full bg-base-100 text-base-content shadow-xl border border-base-200 cursor-pointer group hover:scale-[1.02] transition-all duration-300"
        >
            {/* Phần hình ảnh */}
            <figure className="overflow-hidden">
                <img 
                    src={data?.thumbnail?.secure_url} 
                    alt="course thumbnail" 
                    className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </figure>

            {/* Phần nội dung bài viết */}
            <div className="card-body p-6 gap-3">
                {/* Tiêu đề: Dùng text-primary để nổi bật theo theme */}
                <h2 className="card-title text-xl font-bold line-clamp-2 text-primary">
                    {data?.title}
                </h2>

                {/* Mô tả: Dùng text-base-content với độ mờ 70% (/) để tạo chiều sâu */}
                <p className="text-base-content/70 line-clamp-3 text-sm italic">
                    {data?.description}
                </p>

                {/* Thông tin bổ sung */}
                <div className="flex flex-col gap-1 mt-2 text-sm font-semibold">
                    <p>
                        <span className="text-primary">Danh mục: </span>
                        {data?.category}
                    </p>
                    <p>
                        <span className="text-primary">Giảng viên: </span>
                        {data?.createdBy}
                    </p>
                    <p>
                        <span className="text-primary">Số bài giảng: </span>
                        {data?.numberOfLectures}
                    </p>
                </div>

                {/* Nút giả để tăng tính thẩm mỹ */}
                <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary btn-sm rounded-lg border-none">
                        Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CourseCard;