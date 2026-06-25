import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useEffect } from 'react';
import { Bar, Pie } from "react-chartjs-2";
import { BsCollectionPlayFill, BsTrash } from 'react-icons/bs';
import { FaUsers } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc";
import { GiMoneyStack } from "react-icons/gi";
import { TiEdit } from "react-icons/ti";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { deleteCourse, getAllCourse } from '../../Redux/Slices/CourseSlice';
import { getPaymentRecord } from '../../Redux/Slices/RazorpaySlice';
import { getStatsData } from '../../Redux/Slices/StatSlice';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    const { allUsersCount, subscribedCount } = useSelector((state) => state.stat);
    const { allPayments, monthlySalesRecord } = useSelector((state) => state.razorpay);
    const myCoures = useSelector((state) => state?.course?.courseData);

    const userData = {
        labels: ["Registered User", "Enrolled User"],
        datasets: [
            {
                label: "User Details",
                data: [allUsersCount, subscribedCount],
                backgroundColor: ["#EAB308", "#22C55E"], // Dùng mã màu hex chuẩn thay vì chữ
                borderWidth: 1,
                borderColor: ["#EAB308", "#22C55E"]
            }
        ]
    }

    const salesData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Sales/Month",
                data: monthlySalesRecord, 
                backgroundColor: ["#EF4444"],
            }
        ]
    }

    async function onCourseDelete(id) {
        if (window.confirm("Are you Sure Want to delete the course ?")) {
            const res = await dispatch(deleteCourse(id));
            if (res?.payload?.success) {
                await dispatch(getAllCourse())
            }
        }
    }

    useEffect(() => {
        (async () => {
            await dispatch(getAllCourse());
            await dispatch(getStatsData());
            await dispatch(getPaymentRecord());
        })()
    }, [])

    return (
        // Đổi class gốc: Không dùng text-white nữa, dùng w-full để chiếm trọn khung layout
        <div className="w-full flex flex-col gap-10">
            
            <h1 className="text-3xl font-bold text-base-content border-b border-base-300 pb-4">
                Admin Dashboard
            </h1>

            {/* Khu vực Biểu đồ */}
            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Khối biểu đồ tròn (Pie) */}
                <div className="flex flex-col gap-8 p-6 bg-base-100 text-base-content shadow-sm border border-base-200 rounded-xl">
                    <h2 className="text-xl font-semibold border-b border-base-200 pb-2">User Statistics</h2>
                    <div className="w-64 h-64 mx-auto">
                        <Pie data={userData} options={{ maintainAspectRatio: false }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                            <div className="flex flex-col">
                                <p className="text-sm text-base-content/70 font-semibold">Registered</p>
                                <h3 className="text-3xl font-bold text-base-content">{allUsersCount}</h3>
                            </div>
                            <FaUsers className="text-yellow-500 text-4xl opacity-80" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                            <div className="flex flex-col">
                                <p className="text-sm text-base-content/70 font-semibold">Subscribed</p>
                                <h3 className="text-3xl font-bold text-base-content">{subscribedCount}</h3>
                            </div>
                            <FaUsers className="text-green-500 text-4xl opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Khối biểu đồ cột (Bar) */}
                <div className="flex flex-col gap-8 p-6 bg-base-100 text-base-content shadow-sm border border-base-200 rounded-xl">
                    <h2 className="text-xl font-semibold border-b border-base-200 pb-2">Sales Revenue</h2>
                    <div className="w-full h-64 relative">
                        <Bar data={salesData} options={{ maintainAspectRatio: false }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                            <div className="flex flex-col">
                                <p className="text-sm text-base-content/70 font-semibold">Subscriptions</p>
                                <h3 className="text-3xl font-bold text-base-content">{allPayments?.count}</h3>
                            </div>
                            <FcSalesPerformance className="text-4xl opacity-80" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                            <div className="flex flex-col">
                                <p className="text-sm text-base-content/70 font-semibold">Revenue</p>
                                <h3 className="text-3xl font-bold text-base-content">{allPayments?.count * 499}</h3>
                            </div>
                            <GiMoneyStack className="text-green-500 text-4xl opacity-80" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Khu vực Bảng Khóa học */}
            <div className="w-full bg-base-100 text-base-content shadow-sm border border-base-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-semibold">Courses Overview</h2>
                    <button
                        onClick={() => navigate("/course/create")}
                        className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white border-none px-6"
                    >
                        Create New Course
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-base-200 text-base-content/80 text-sm">
                            <tr>
                                <th>S No</th>
                                <th>Course Title</th>
                                <th>Category</th>
                                <th>Instructor</th>
                                <th>Total Lectures</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myCoures?.map((course, idx) => (
                                <tr key={course._id} className="hover:bg-base-200/50 transition-colors border-b border-base-200">
                                    <td className="font-medium text-center">{idx + 1}</td>
                                    <td>
                                        <div className="font-semibold max-w-[150px] truncate" title={course?.title}>
                                            {course?.title}
                                        </div>
                                    </td>
                                    <td>{course?.category}</td>
                                    <td>{course?.createdBy}</td>
                                    <td className="text-center">{course?.numberOfLectures}</td>
                                    <td>
                                        <div className="max-w-[200px] truncate text-sm text-base-content/70" title={course?.description}>
                                            {course?.description}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="btn btn-sm btn-square btn-success text-white"
                                                title="View Lectures"
                                                onClick={() => navigate("/course/displaylecture", { state: { ...course } })}
                                            >
                                                <BsCollectionPlayFill size={16} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-square btn-warning text-white"
                                                title="Edit Course"
                                                onClick={() => navigate("/course/edit", { state: { ...course } })}
                                            >
                                                <TiEdit size={18} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-square btn-error text-white"
                                                title="Delete Course"
                                                onClick={() => onCourseDelete(course?._id)}
                                            >
                                                <BsTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Thông báo nếu chưa có khóa học */}
                    {(!myCoures || myCoures.length === 0) && (
                        <div className="text-center py-8 text-base-content/50">
                            No courses available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;