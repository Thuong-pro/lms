import { Link } from "react-router-dom";
import homeimg from '../Assets/Images/homePageMainImage.png'

function HomePage() {
    return (
        // Đổi text-white thành text-base-content để tương thích Sáng/Tối
        <div className="pt-10 text-base-content flex flex-col md:flex-row items-center justify-center mx-5 gap-10 lg:mx-16 h-[50rem] sm:h-[90vh]">
            
            {/* Cột trái: Nội dung và Nút bấm */}
            <div className="mt-16 sm:mt-0 flex flex-col justify-center md:w-1/2 space-y-6">
                <h1 className="text-4xl sm:text-6xl font-semibold leading-tight">
                    Khởi tạo tương lai cùng <br />
                    {/* Dùng text-primary thay cho text-yellow-500 */}
                    <span className="text-primary font-bold">
                        Zero2One
                    </span>
                </h1>
                
                {/* Dùng text-base-content/80 (mờ 20%) thay cho text-gray-300 */}
                <p className="text-lg sm:text-xl text-base-content/80 leading-relaxed">
                    Nơi tri thức không có giới hạn, chỉ có điểm bắt đầu. 
                    Cùng chúng tôi biến đam mê thành kỹ năng thực chiến với đội ngũ chuyên gia hàng đầu.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                    <Link to="/courses">
                        {/* Thay bằng class btn btn-primary chuẩn của DaisyUI */}
                        <button className="btn btn-primary px-7 py-3 text-lg h-auto border-none">
                            Khám phá khóa học
                        </button>
                    </Link>

                    <Link to="/contact">
                        {/* Thay bằng class btn-outline btn-primary */}
                        <button className="btn btn-outline btn-primary px-7 py-3 text-lg h-auto">
                            Liên hệ ngay
                        </button>
                    </Link>
                </div>

                {/* Ý tưởng 3: Dải số liệu thành tựu (Trust Badges) */}
                {/* Thay border-gray-700 thành border-base-300 */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-base-300 mt-2">
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-primary">5,000+</p>
                        <p className="text-sm sm:text-base text-base-content/60 font-medium">Học viên</p>
                    </div>
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-primary">200+</p>
                        <p className="text-sm sm:text-base text-base-content/60 font-medium">Khóa học</p>
                    </div>
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-primary">99%</p>
                        <p className="text-sm sm:text-base text-base-content/60 font-medium">Hài lòng</p>
                    </div>
                </div>
            </div>

            {/* Cột phải: Hình ảnh có hiệu ứng */}
            <div className="lg:w-1/2 flex items-center justify-center relative">
                {/* Đổi ánh sáng hào quang thành màu primary/20 để đồng bộ */}
                <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-[100px]"></div>
                
                <img 
                    src={homeimg} 
                    alt="homepage image" 
                    className="relative z-10 w-full max-w-[500px] animate-[bounce_3s_ease-in-out_infinite] drop-shadow-2xl" 
                />
            </div>

        </div>
    )
}

export default HomePage;