import Assignment from '../models/assignment.model.js';
import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import AppError from '../utils/error.util.js';


export const createAssignment = asyncHandler(async (req, res, next) => {
    const { courseId, title, description } = req.body;

    if (!courseId || !title || !description) {
        return next(new AppError('Vui lòng nhập đủ thông tin bài tập', 400));
    }

    const assignment = await Assignment.create({ courseId, title, description });

    res.status(201).json({ success: true, message: 'Tạo bài tập thành công', assignment });
});


export const submitAssignment = asyncHandler(async (req, res, next) => {
    try {
        console.log("=== BẮT ĐẦU XỬ LÝ NỘP BÀI ===");
        console.log("Dữ liệu User:", req.user);
        console.log("Dữ liệu gửi lên:", req.body);

        // 1. Lấy và ép kiểu ID về String để so sánh không bị lỗi
        const studentId = req.user?.id ? String(req.user.id) : (req.user?._id ? String(req.user._id) : null);
        const studentName = req.user?.fullName || req.user?.name || req.user?.userName || "Học sinh Ẩn danh";

        if (!studentId) {
            console.log("LỖI: Không tìm thấy ID của học sinh trong Token");
            return next(new AppError('Không thể xác thực người dùng', 401));
        }

        const { assignmentId } = req.params;
        const { content } = req.body;

        if (!content) {
            return next(new AppError('Vui lòng cung cấp link bài làm', 400));
        }

        // 2. Tìm bài tập
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            console.log("LỖI: Không tìm thấy bài tập với ID:", assignmentId);
            return next(new AppError('Không tìm thấy bài tập', 404));
        }

        console.log("Đã tìm thấy bài tập:", assignment.title);

        // 3. Đảm bảo mảng submissions tồn tại (chống lỗi undefined)
        if (!assignment.submissions) {
            assignment.submissions = [];
        }

        // 4. Kiểm tra xem học sinh đã nộp chưa (Ép kiểu cả 2 vế về String để so sánh chuẩn 100%)
        const existingSubmissionIndex = assignment.submissions.findIndex(
            sub => String(sub.studentId) === studentId
        );

        if (existingSubmissionIndex !== -1) {
            console.log("-> Học sinh đã nộp bài, tiến hành CẬP NHẬT link mới...");
            assignment.submissions[existingSubmissionIndex].content = content;
            assignment.submissions[existingSubmissionIndex].submittedAt = Date.now();
        } else {
            console.log("-> Học sinh nộp bài LẦN ĐẦU...");
            assignment.submissions.push({ studentId, studentName, content });
        }

        console.log("Đang lưu vào Database...");
        await assignment.save();
        console.log("=== LƯU THÀNH CÔNG ===");

        res.status(200).json({ success: true, message: 'Nộp bài thành công!' });

    } catch (error) {
        // ĐÂY LÀ "MÁY DÒ MÌN" NẾU CÒN LỖI 500 NÓ SẼ IN RA ĐÂY
        console.log("!!!!!! LỖI 500 TẠI HÀM NỘP BÀI !!!!!!");
        console.error(error);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        return next(new AppError(error.message, 500));
    }
});

// [PB12 & PB13] GIÁO VIÊN CHẤM ĐIỂM & HỌC SINH XEM ĐIỂM
export const gradeAssignment = asyncHandler(async (req, res, next) => {
    const { assignmentId, studentId } = req.params;
    const { score, feedback } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(new AppError('Không tìm thấy bài tập', 404));

    const submission = assignment.submissions.find(sub => sub.studentId === studentId);
    if (!submission) return next(new AppError('Học sinh chưa nộp bài này', 404));

    submission.score = score;
    submission.feedback = feedback;

    await assignment.save();
    res.status(200).json({ success: true, message: 'Chấm điểm thành công' });
});

// HÀM PHỤ: LẤY DANH SÁCH BÀI TẬP CỦA KHÓA HỌC
export const getAssignmentsByCourse = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ courseId });
    res.status(200).json({ success: true, assignments });
});