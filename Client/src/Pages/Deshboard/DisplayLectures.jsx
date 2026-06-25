import { useEffect, useState } from "react";
import { MdAutoDelete } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { deleteCourseLecture, getCourseLectures } from "../../Redux/Slices/LectureSlice";
import { courseApi } from "../../Helpers/api";

function Displaylectures() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const { lectures, quizzes } = useSelector((state) => state.lecture);
    const { role, data } = useSelector((state) => state.auth);

    const [currentVideo, setCurrentVideo] = useState(0);
    const [activeTab, setActiveTab] = useState('lectures'); // 'lectures' or 'quizzes'
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

    useEffect(() => {
        console.log('DisplayLectures Redux state:', {
            lectures: lectures?.length || 0,
            quizzes: quizzes?.length || 0
        });
    }, [lectures, quizzes]);

    async function onLectureDelete(courseId, lectureId) {
        if (window.confirm("Are you Sure Want to delete the Lecture ?")) {
            await dispatch(deleteCourseLecture({ courseId: courseId, lectureId: lectureId }));
            await dispatch(getCourseLectures(courseId));
        }
    }

    // Update progress when video ends or student finishes watching
    const handleVideoEnded = async () => {
        console.log('=== VIDEO ENDED ===');
        console.log('state._id:', state?._id);
        console.log('role:', role);
        console.log('currentVideo:', currentVideo);
        console.log('lectures.length:', lectures?.length);
        
        // Skip for teachers/admins
        if (role === 'TEACHER' || role === 'ADMIN') {
            console.log('Skip: User is teacher/admin');
            return;
        }
        
        if (!state?._id) {
            console.log('Skip: No courseId');
            return;
        }
        
        if (!lectures || lectures.length === 0) {
            console.log('Skip: No lectures');
            return;
        }
        
        try {
            setIsUpdatingProgress(true);
            
            // Calculate progress: (current lecture + 1) / total lectures * 100
            const progress = Math.min(
                Math.round(((currentVideo + 1) / lectures.length) * 100),
                100
            );
            
            console.log('Calculated progress:', progress);
            console.log('Sending to backend:', { courseId: state._id, progress });
            
            // Update progress in backend
            const response = await courseApi.updateCourseProgress(state._id, { progress });
            
            console.log('Backend response:', response.data);
            toast.success(`Tiến độ cập nhật: ${progress}%`);
        } catch (error) {
            console.error('Error updating progress:', error);
            console.error('Error details:', error?.response?.data || error.message);
            toast.error(`Lỗi cập nhật tiến độ: ${error?.response?.data?.message || error.message}`);
        } finally {
            setIsUpdatingProgress(false);
        }
    };

    useEffect(() => {
        if (!state) {
            navigate("/courses");
            return;
        }
        console.log('Loading lectures for courseId:', state._id);
        dispatch(getCourseLectures(state._id));
    }, []);

    return (
        <div className="flex flex-col gap-10 items-center justify-center w-full py-10 text-base-content">
            <div className="text-center text-3xl font-bold text-primary">
                Course Name: {state?.title}
            </div>

            {(lectures && lectures.length > 0) ? (
                <div className="flex flex-col lg:flex-row justify-center gap-10 w-full max-w-7xl px-4">
                    
                    {/* ===== CỘT BÊN TRÁI: VIDEO PLAYER ===== */}
                    <div className="space-y-5 lg:w-[35rem] p-4 bg-base-100 border border-base-300 rounded-xl shadow-md">
                        <video
                            src={lectures && lectures[currentVideo]?.lecture?.secure_url}
                            className="w-full object-cover rounded-lg bg-black aspect-video"
                            controls
                            disablePictureInPicture
                            controlsList="nodownload"
                            onEnded={handleVideoEnded}
                        ></video>
                        
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold">
                                <span className="text-primary"> Title: </span>
                                {lectures && lectures[currentVideo]?.title}
                            </h1>
                            <p className="text-base-content/80">
                                <span className="text-primary font-semibold">
                                    Description:{" "}
                                </span>
                                {lectures && lectures[currentVideo]?.description}
                            </p>
                        </div>

                        {/* TEST BUTTON - Remove after testing */}
                        {role !== 'TEACHER' && role !== 'ADMIN' && (
                            <button
                                onClick={handleVideoEnded}
                                disabled={isUpdatingProgress}
                                className="btn btn-sm btn-info w-full"
                                title="Test: Click to update progress manually"
                            >
                                {isUpdatingProgress ? 'Updating...' : '✓ Test: Update Progress'}
                            </button>
                        )}
                    </div>

                    {/* ===== CỘT BÊN PHẢI: TABS (LECTURES / QUIZZES) ===== */}
                    <div className="lg:w-[28rem] p-6 bg-base-100 border border-base-300 rounded-xl shadow-md space-y-6 flex flex-col max-h-[35rem]">
                        {/* TABS */}
                        <div className="tabs tabs-bordered border-base-300">
                            <button
                                className={`tab ${activeTab === 'lectures' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('lectures')}
                            >
                                Bài Giảng ({lectures?.length || 0})
                            </button>
                            <button
                                className={`tab ${activeTab === 'quizzes' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('quizzes')}
                            >
                                Bài Kiểm Tra ({quizzes?.length || 0})
                            </button>
                        </div>

                        {/* LECTURES TAB */}
                        {activeTab === 'lectures' && (
                            <div className="space-y-3">
                                <div className="font-bold text-xl text-primary flex items-center justify-between border-b border-base-200 pb-3">
                                    <p>Danh sách bài giảng</p>
                                    {(role === "ADMIN" || role === "TEACHER") && (
                                        <button 
                                            onClick={() => navigate("/course/addlecture", { state: { ...state } })} 
                                            className="btn btn-sm btn-primary text-white"
                                        >
                                            Thêm bài
                                        </button>
                                    )}
                                </div>
                                
                                <ul className="space-y-3 overflow-y-auto pr-2">
                                    {lectures && lectures.map((lecture, idx) => {
                                        return (
                                            <li 
                                                className={`p-3 rounded-lg flex items-center justify-between transition-colors ${currentVideo === idx ? 'bg-primary/10 border-l-4 border-primary' : 'bg-base-200 hover:bg-base-300'}`} 
                                                key={lecture._id}
                                            >
                                                <p 
                                                    className="cursor-pointer flex-1 font-medium" 
                                                    onClick={() => setCurrentVideo(idx)}
                                                >
                                                    <span className="font-bold mr-2">
                                                        {idx + 1}:
                                                    </span>
                                                    {lecture?.title}
                                                </p>

                                                {(role === "ADMIN" || role === "TEACHER") && (
                                                    <button 
                                                        onClick={() => onLectureDelete(state?._id, lecture?._id)} 
                                                        className="text-error hover:bg-error/20 p-2 rounded-md transition-colors"
                                                        title="Xóa bài giảng"
                                                    >
                                                        <MdAutoDelete size={24} />
                                                    </button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* QUIZZES TAB */}
                        {activeTab === 'quizzes' && (
                            <div className="space-y-3">
                                <div className="font-bold text-xl text-primary border-b border-base-200 pb-3">
                                    Bài kiểm tra ({quizzes?.length || 0})
                                </div>
                                
                                {quizzes && quizzes.length > 0 ? (
                                    <ul className="space-y-3 overflow-y-auto pr-2 max-h-[25rem]">
                                        {quizzes.map((quiz) => (
                                            <li 
                                                key={quiz._id} 
                                                className="p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-colors cursor-pointer border-l-4 border-primary/30 hover:border-primary"
                                                onClick={() => navigate(`/quiz/${quiz._id}`)}
                                            >
                                                <p className="font-bold text-base-content text-lg">{quiz.title}</p>
                                                <p className="text-sm text-base-content/70 mb-2">{quiz.description}</p>
                                                <div className="text-sm text-base-content/60 flex flex-wrap gap-3">
                                                    <span>⏱ {quiz.timeLimit || quiz.duration} phút</span>
                                                    <span>🎯 Điểm đạt: {quiz.passingScore || 50}%</span>
                                                    <span>❓ {quiz.numberOfQuestions || 0} câu hỏi</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-base-content/60 py-6">Chưa có bài kiểm tra nào</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                (role === "ADMIN" || role === "TEACHER") ? (
                    <div className="flex flex-col items-center gap-4 bg-base-100 p-10 rounded-xl border border-base-300 shadow-md">
                        <p className="text-xl text-base-content/60">Khóa học này chưa có bài giảng nào.</p>
                        <button 
                            onClick={() => navigate("/course/addlecture", { state: { ...state } })} 
                            className="btn btn-primary text-white px-6"
                        >
                            Thêm bài giảng
                        </button>
                    </div>
                ) : (
                    <div className="text-xl text-base-content/60">
                        Khóa học này đang được cập nhật nội dung. Vui lòng quay lại sau!
                    </div>
                )
            )}
        </div>
    );
}

export default Displaylectures;