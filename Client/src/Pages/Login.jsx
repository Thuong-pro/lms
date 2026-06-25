import { useState } from "react";
import {toast} from 'react-hot-toast'
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";


import { login } from "../Redux/Slices/AuthSlice";

function Login(){

    const dispatch = useDispatch();
   const navigate = useNavigate();


    const [loginData, setloginData]=useState({
        email:"",
        password:"",
    });

    function handleUserInput(e){
        const{name, value}=e.target;
        setloginData({
            ...loginData,
            [name]:value
        })
    }

   async function onLogin(event){
        event.preventDefault();
        if (!loginData.email || !loginData.password) {
            toast.error("Please fill all the details ");
            return;
        }

        // Gọi action login
        const response = await dispatch(login(loginData));
        
        // Kiểm tra nếu đăng nhập thành công
        if(response?.payload?.success){
            
            // Lấy role của user từ payload (Tùy thuộc vào cấu trúc API của bạn, 
            // thông thường nó sẽ nằm ở response.payload.user.role hoặc response.payload.data.role)
            const userRole = response?.payload?.user?.role || response?.payload?.data?.role; 

            // Phân luồng điều hướng dựa trên role
            if (userRole === 'ADMIN') {
                navigate("/admin/deshboard"); // Đưa Admin về trang quản trị (Lưu ý: route của bạn đang viết là 'deshboard')
            } else if (userRole === 'TEACHER') {
                navigate("/teacher/dashboard"); // Đưa Giáo viên về Dashboard riêng
            } else {
                navigate("/student/dashboard"); // Đưa Học viên về trang học tập (hoặc navigate("/") tùy bạn)
            }

            // Xóa dữ liệu form
            setloginData({
                email:"",
                password:"",
            })
        }
    }
    return(
        
                <div className=" flex items-center justify-center h-[90vh]">
                    <form  noValidate onSubmit={onLogin} className="flex flex-col   justify-center gap-3  rounded-lg text-white p-4  w-80  shadow-[0_0_10px_black] ">
                        <h1 className="text-center text-2xl font-bold">Login Page</h1>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="email" className="font-semibold">Email</label>
                            <input 
                                type="email"
                                required
                                name="email"
                                id="email"
                                placeholder="Enter your email...."
                                className=" bg-transparent px-2 py-1 border"
                                onChange={handleUserInput}
                                value={loginData.email}
                             />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="password" className="font-semibold">Password</label>
                            <input 
                                type="password"
                                required
                                name="password"
                                id="password"
                                placeholder="Enter your password...."
                                className=" bg-transparent px-2 py-1 border"
                                onChange={handleUserInput}
                                value={loginData.password}
                             />
                        </div>

                        <button  type="submit" className=" mt-2 bg-yellow-600 hover:bg-yellow-500 py-2 font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300  rounded-sm">
                                Login
                        </button>

                        <Link to={"/forget-password"}>
                            <p className="text-center link text-accent cursor-pointer">
                            Quên mật khẩu
                            </p>
                        </Link>
          
                        <p className="text-center">
                         Donot have an account ? <Link to="/signup" className=" link  text-accent cursor-pointer">Signup</Link>
                        </p>

                    </form>
                </div>
       
    )
}
export default Login;