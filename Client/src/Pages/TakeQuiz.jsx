import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { quizApi } from '../Helpers/api';

function TakeQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Khai báo useLocation
    
    // BẮT TÍN HIỆU TỪ TRANG DANH SÁCH GỬI SANG
    const { isReview, submissionId, quizInfo } = location.state || {};

    const { data: user } = useSelector((state) => state.auth);
    
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);

    // Timer effect
    useEffect(() => {
        if (!quizStarted || !quiz || isReview) return; // Nếu đang xem lại thì không chạy giờ

        if (timeLeft === 0) {
            handleSubmit();
            return;
        }

        if (timeLeft === null) {
            setTimeLeft(quiz.timeLimit * 60);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [quizStarted, timeLeft, quiz, isReview]);

    // Fetch dữ liệu RẼ NHÁNH
    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                setLoading(true);
                
                if (isReview && submissionId) {
                    // CHẾ ĐỘ 1: XEM LẠI KẾT QUẢ (Gọi API getStudentSubmission)
                    const response = await quizApi.getStudentSubmission(submissionId);
                    const subData = response.data.submission;
                    
                    setQuiz(quizInfo || subData.quizId);
                    setResult({
                        correctAnswers: subData.score, 
                        totalQuestions: subData.answers.length,
                        percentage: subData.percentage,
                        isPassed: subData.passed,
                        passingScore: quizInfo?.passingScore || 50 // Backup điểm qua môn
                    });
                    setSubmitted(true); // Bật giao diện kết quả ngay lập tức
                    
                } else {
                    // CHẾ ĐỘ 2: BẮT ĐẦU LÀM BÀI MỚI (Gọi API getQuizForAttempt)
                    const response = await quizApi.getQuizForAttempt(quizId);
                    const quizData = response.data.quiz;
                    setQuiz(quizData);
                    setQuestions(quizData.questions || []);
                    
                    const initialAnswers = {};
                    (quizData.questions || []).forEach(q => {
                        initialAnswers[q._id] = null;
                    });
                    setAnswers(initialAnswers);
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Không thể tải dữ liệu');
                navigate('/student/quizzes');
            } finally {
                setLoading(false);
            }
        };

        if (quizId) fetchQuizData();
    }, [quizId, isReview, submissionId, navigate, quizInfo]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, selectedOption) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleStartQuiz = () => setQuizStarted(true);

    const handleSubmit = async () => {
        if (submitted) return;

        try {
            setSubmitted(true);
            
            const answersArray = questions.map(q => {
                const selectedIndex = answers[q._id];
                const selectedLabel = selectedIndex !== null && selectedIndex !== undefined 
                    ? q.options[selectedIndex]?.label 
                    : null;
                
                return {
                    questionId: q._id,
                    selectedAnswer: selectedLabel
                };
            });

            await quizApi.submitQuiz(quizId, {
                answers: answersArray,
                timeSpent: quiz.timeLimit * 60 - timeLeft
            });

            toast.success('Nộp bài thành công! Hệ thống đã ghi nhận kết quả.');
            navigate('/student/quizzes');

        } catch (error) {
            console.error('Error submitting quiz:', error);
            const errorMsg = error?.response?.data?.message || 'Lỗi nộp bài';
            
            if (errorMsg.toLowerCase().includes('already submitted')) {
                toast.error('Bạn đã nộp bài kiểm tra này trước đó rồi!');
                navigate('/student/quizzes'); 
            } else {
                toast.error(errorMsg);
                setSubmitted(false); 
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100 text-base-content">
                <p className="text-xl font-bold text-error">Không tìm thấy bài kiểm tra</p>
            </div>
        );
    }

    // Hiển thị Giao diện Kết quả khi Đã nộp hoặc Đang xem lại
    if (submitted && result) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-base-content animate-fade-in">
                <div className="card bg-base-200/60 shadow-lg border border-base-300">
                    <div className="card-body items-center text-center">
                        <h1 className={`card-title text-4xl mb-2 font-black ${result.isPassed ? 'text-success' : 'text-error'}`}>
                            {result.isPassed ? '🎉 Chúc Mừng!' : '❌ Chưa Đạt Yêu Cầu'}
                        </h1>
                        <p className="text-base-content/60 font-medium mb-6">Kết quả bài kiểm tra: {quiz.title}</p>
                        
                        <div className="stats stats-vertical md:stats-horizontal w-full my-4 bg-base-100 shadow-sm">
                            <div className="stat">
                                <div className="stat-title font-semibold">Điểm số của bạn</div>
                                <div className={`stat-value ${result.isPassed ? 'text-success' : 'text-error'}`}>
                                    {result.percentage}%
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title font-semibold">Trả lời đúng</div>
                                <div className="stat-value text-info">{result.correctAnswers} / {result.totalQuestions}</div>
                            </div>
                        </div>

                        <div className={`alert mt-4 shadow-sm border-none ${result.isPassed ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            <span className="font-bold text-center w-full">
                                {result.isPassed 
                                    ? `Xuất sắc! Điểm của bạn đã vượt mức yêu cầu (${result.passingScore || quiz.passingScore}%).`
                                    : `Rất tiếc. Bạn cần đạt tối thiểu ${result.passingScore || quiz.passingScore}% để qua bài.`
                                }
                            </span>
                        </div>

                        <div className="card-actions mt-8 w-full">
                            <button 
                                className="btn btn-outline hover:bg-base-300 hover:border-base-300 hover:text-base-content w-full rounded-xl"
                                onClick={() => navigate('/student/quizzes')}
                            >
                                Quay Về Danh Sách
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-base-content animate-fade-in">
                <div className="card bg-base-200/60 shadow-lg border border-base-300 backdrop-blur-sm">
                    <div className="card-body">
                        <h1 className="card-title text-3xl mb-4 text-primary">{quiz.title}</h1>
                        <p className="text-base-content/70 mb-6 font-medium">{quiz.description}</p>
                        
                        <div className="stats stats-vertical md:stats-horizontal w-full mb-6 bg-base-100 shadow-sm">
                            <div className="stat">
                                <div className="stat-title font-semibold">Số câu hỏi</div>
                                <div className="stat-value text-primary">{questions.length}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title font-semibold">Thời gian</div>
                                <div className="stat-value text-warning">{quiz.timeLimit} phút</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title font-semibold">Điểm qua môn</div>
                                <div className="stat-value text-accent">{quiz.passingScore}%</div>
                            </div>
                        </div>

                        <div className="alert alert-info mb-6 shadow-sm border-none bg-info/10 text-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span className="font-semibold">Hãy chuẩn bị sẵn sàng. Khi bắt đầu, đồng hồ sẽ đếm ngược và không thể dừng lại.</span>
                        </div>

                        <button 
                            className="btn btn-primary btn-lg w-full rounded-xl"
                            onClick={handleStartQuiz}
                        >
                            Bắt Đầu Làm Bài
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 text-base-content">
            {/* Giao diện làm bài thi */}
            {/* ... (Đoạn mã câu hỏi giữ nguyên như cũ) */}
            <div className="sticky top-4 bg-base-200/80 backdrop-blur-md z-10 mb-8 p-5 rounded-2xl shadow-lg flex justify-between items-center border border-base-300">
                <div>
                    <h2 className="text-xl font-bold text-primary truncate max-w-md">{quiz.title}</h2>
                </div>
                <div className={`text-2xl font-black flex items-center gap-2 ${timeLeft < 300 ? 'text-error animate-pulse' : 'text-warning'}`}>
                    ⏱ {formatTime(timeLeft)}
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((question, index) => (
                    <div key={question._id} className="card bg-base-200 shadow-sm border border-base-300">
                        <div className="card-body p-6 md:p-8">
                            <h3 className="card-title text-lg md:text-xl mb-6 font-bold leading-relaxed">
                                <span className="text-primary mr-2">Câu {index + 1}:</span> {question.questionText}
                            </h3>

                            <div className="space-y-3">
                                {question.options && question.options.map((option, optIndex) => {
                                    const isSelected = answers[question._id] === optIndex;
                                    return (
                                        <label 
                                            key={optIndex} 
                                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                                                isSelected 
                                                    ? 'bg-primary/10 border-primary shadow-sm' 
                                                    : 'bg-base-100 border-base-300 hover:border-primary/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={question._id}
                                                value={optIndex}
                                                checked={isSelected}
                                                onChange={() => handleAnswerChange(question._id, optIndex)}
                                                className="radio radio-primary"
                                                disabled={submitted}
                                            />
                                            <span className="flex-1 text-base md:text-lg font-medium">
                                                <strong className="text-primary mr-2">{option.label}.</strong> 
                                                {option.text}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 mb-12 p-4">
                <button
                    className="btn btn-primary btn-lg w-full rounded-2xl shadow-lg hover:shadow-primary/30"
                    onClick={handleSubmit}
                    disabled={submitted}
                >
                    {submitted ? (
                        <>
                            <span className="loading loading-spinner"></span>
                            Đang Nộp Bài...
                        </>
                    ) : (
                        'Nộp Bài Kiểm Tra'
                    )}
                </button>
            </div>
        </div>
    );
}

export default TakeQuiz;