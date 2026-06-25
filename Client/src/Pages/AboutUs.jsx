import aboutMainImage from "../Assets/Images/aboutMainImage.png";
import CarouselSlide from "../Compontents/CarouselSlide";
import { celebrities } from "../Constants/CelebrityData";

function AboutUs() {
    return (
        // Dùng text-base-content thay cho text-white. Bỏ lg:pl-20 để canh giữa đẹp hơn
        <div className="pt-20 flex flex-col text-base-content min-h-[90vh] w-full max-w-7xl mx-auto px-4 md:px-10">
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
                {/* Phần Chữ */}
                <section className="lg:w-1/2 space-y-8 text-center lg:text-left">
                    {/* Dùng text-primary thay cho text-yellow-500 */}
                    <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                        Không có giới hạn, chỉ có điểm bắt đầu 
                    </h1>
                    
                    {/* Dùng text-base-content/80 (mờ 20%) thay cho text-gray-200 */}
                    <p className="text-lg md:text-xl text-base-content/80 leading-relaxed text-justify">
                        Giữa một kỷ nguyên công nghệ chuyển động không ngừng, đứng im đồng nghĩa với việc bị bỏ lại phía sau. 
                        Zero2One ra đời như một trạm bệ phóng dành riêng cho những người không ngại thay đổi và khát khao bứt phá.
                        <br/><br/>
                        Tại đây, chúng tôi gạt bỏ những lý thuyết hàn lâm sáo rỗng để biến kiến thức thành kỹ năng thực chiến, mang đúng 'hơi thở' của ngành công nghiệp vào từng bài học. Không đơn thuần là một website học trực tuyến, Zero2One là cộng đồng của những người kiến tạo. Bạn mang đến đam mê, chúng tôi trao bạn bệ phóng để bước ra với một sự nghiệp vững vàng.
                    </p>
                </section>

                {/* Phần Hình Ảnh */}
                <div className="lg:w-1/2 flex justify-center">
                    <img
                        id="test1"
                        style={{
                            // Cú pháp filter cũ của bạn bị sai dấu chấm phẩy bên trong chuỗi. Đã sửa lại.
                            filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))"
                        }}
                        alt="about main image"
                        className="w-full max-w-md lg:max-w-full drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        src={aboutMainImage}
                    />
                </div>
            </div>

            {/* Phần Carousel */}
            <div className="w-full md:w-[80vw] lg:w-1/2 mx-auto my-20">
                <div className="carousel w-full rounded-2xl shadow-xl border border-base-200 bg-base-100">
                    {celebrities && celebrities.map(celebrity => (
                        <CarouselSlide 
                            {...celebrity} 
                            key={celebrity.slideNumber} 
                            totalSlides={celebrities.length}
                        />
                    ))}
                </div>
            </div>
            
        </div>
    );
}

export default AboutUs;