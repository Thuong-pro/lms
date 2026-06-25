import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import axiosInstance from "../../Helpers/axiosInstance"; 

function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    // Lấy courseId từ location state
    const courseId = state?.courseId;
    const courseName = state?.courseName || "Khóa Học";

    // Kiểm tra courseId
    if (!courseId) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Lỗi: Không tìm thấy khóa học</p>
                    <button 
                        onClick={() => navigate('/courses')}
                        className="btn btn-primary"
                    >
                        Quay lại danh sách khóa học
                    </button>
                </div>
            </div>
        );
    }

    const bankId = "MB"; 
    const bankAccount = "0395148062"; 
    const accountName = "DO VIET THUONG"; 
    const amount = 499999;
    const description = `Thanh toan ${courseName}`;
    
    const qrLink = `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;

    async function handleVerify(e) {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Gửi courseId khi verify
            const response = await axiosInstance.post('/payments/verify-manual', {
                courseId: courseId
            });
            
            if (response.data.success) {
                toast.success(`Thanh toán thành công! Khóa học "${courseName}" đã được mở.`);
                navigate("/checkout/success");
            }
        } catch (error) {
            toast.error("Xác nhận thất bại, vui lòng thử lại.");
            navigate("/checkout/fail");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        
            <form
                onSubmit={handleVerify}
                className="min-h-[90vh] flex items-center justify-center text-white"
            >
                <div className="w-80 h-[34rem] flex flex-col justify-center shadow-[0_0_10px_black] rounded-lg relative bg-[#1D232A]">
                    <h1 className="bg-yellow-500 absolute top-0 w-full text-center py-4 text-2xl font-bold rounded-tl-lg rounded-tr-lg text-black">
                        Thanh Toán Khóa Học
                    </h1>
                    
                    <div className="px-4 space-y-5 text-center mt-12">
                        <p className="text-sm font-bold text-yellow-400 mb-2">
                            {courseName}
                        </p>

                        <p className="text-[15px] text-gray-300">
                            Vui lòng quét mã QR để mở khóa khóa học này.
                        </p>

                        <div className="flex justify-center bg-white p-2 rounded-md">
                            <img src={qrLink} alt="Mã QR Thanh Toán" className="w-full h-auto" />
                        </div>

                        <p className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
                            <span>{amount.toLocaleString('vi-VN')} VNĐ</span>
                        </p>
                        
                        <div className="text-gray-400 text-sm">
                            <p>Tự động mở khóa sau khi xác nhận</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 absolute bottom-0 w-full left-0 text-xl font-bold text-black rounded-bl-lg rounded-br-lg py-3"
                        >
                            {isLoading ? "Đang xử lý..." : "Tôi đã chuyển khoản"}
                        </button>
                    </div>
                </div>
            </form>
        
    );
}

export default Checkout;