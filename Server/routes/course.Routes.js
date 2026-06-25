import { Router } from 'express';

import { 
    getAllCourse, 
    getLecturesByCourseId, 
    createCourse, 
    updateCourse, 
    removeCourse, 
    addLectureToCourseById, 
    removeLecture, 
    getMyEnrolledCourses, 
    enrollCourse, 
    unenrollCourse, 
    checkEnrollment, 
    updateCourseProgress,
    getTeacherStudents // 🔥 Đã import hàm mới vào đây
} from '../controllers/course.controllers.js';

import { isLoggedIn, isAdminOrTeacher } from '../middlewares/auth.middlewares.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

// =========================================================================
// KHU VỰC 1: CÁC ROUTE CÓ ĐƯỜNG DẪN CỐ ĐỊNH (Phải đặt lên trên cùng)
// =========================================================================

/**
 * @route GET /api/v1/course
 * @description Lấy danh sách tất cả khóa học (Public)
 * @access Public
 */
router.get('/', getAllCourse);

/**
 * @route POST /api/v1/course
 * @description Tạo khóa học mới
 * @access Private - Chỉ dành cho Giáo viên & Admin
 */
router.post(
    '/',
    isLoggedIn,
    isAdminOrTeacher,
    upload.single('thumbnail'), 
    createCourse
);

/**
 * @route GET /api/v1/course/my-courses/list
 * @description Lấy danh sách khóa học mà Học viên đã đăng ký
 * @access Private - Logged in users
 */
router.get('/my-courses/list', isLoggedIn, getMyEnrolledCourses);

/**
 * @route GET /api/v1/course/teacher/students
 * @description Giáo viên lấy danh sách tất cả học sinh đang đăng ký khóa của mình
 * @access Private - Chỉ dành cho Giáo viên & Admin
 * 🔥 LƯU Ý: Route này bắt buộc phải nằm TRƯỚC các route có /:id
 */
router.get('/teacher/students', isLoggedIn, isAdminOrTeacher, getTeacherStudents);


// =========================================================================
// KHU VỰC 2: CÁC ROUTE CHỨA THAM SỐ ĐỘNG (/:id, /:courseId...)
// =========================================================================

/**
 * @route GET /api/v1/course/:id
 * @description Xem chi tiết bài giảng của một khóa học cụ thể
 * @access Private - Logged in users
 */
router.get('/:id', isLoggedIn, getLecturesByCourseId);

/**
 * @route PUT /api/v1/course/:id
 * @description Chỉnh sửa thông tin khóa học
 * @access Private - Course owner or Admin
 */
router.put(
    '/:id',
    isLoggedIn,
    isAdminOrTeacher,
    updateCourse
);

/**
 * @route DELETE /api/v1/course/:id
 * @description Xóa một khóa học
 * @access Private - Course owner or Admin
 */
router.delete(
    '/:id',
    isLoggedIn,
    isAdminOrTeacher,
    removeCourse
);

// --- CÁC ROUTE LIÊN QUAN ĐẾN TIẾN ĐỘ & GHI DANH (ENROLLMENT) ---

/**
 * @route GET /api/v1/course/:courseId/enrollment/check
 * @description Kiểm tra xem user đã đăng ký khóa học này chưa
 * @access Private - Logged in users
 */
router.get('/:courseId/enrollment/check', isLoggedIn, checkEnrollment);

/**
 * @route POST /api/v1/course/:courseId/enroll
 * @description Học viên ghi danh vào khóa học
 * @access Private - Logged in users
 */
router.post('/:courseId/enroll', isLoggedIn, enrollCourse);

/**
 * @route POST /api/v1/course/:courseId/unenroll
 * @description Học viên hủy đăng ký khóa học
 * @access Private - Logged in users
 */
router.post('/:courseId/unenroll', isLoggedIn, unenrollCourse);

/**
 * @route PUT /api/v1/course/:courseId/progress
 * @description Cập nhật % tiến độ học tập của học sinh
 * @access Private - Enrolled students
 */
router.put('/:courseId/progress', isLoggedIn, updateCourseProgress);

// --- CÁC ROUTE LIÊN QUAN ĐẾN QUẢN LÝ BÀI GIẢNG (LECTURES) ---

/**
 * @route POST /api/v1/course/:id/lectures
 * @description Thêm một video bài giảng mới vào khóa học
 * @access Private - Course owner or Admin
 */
router.post(
    '/:id/lectures',
    isLoggedIn,
    isAdminOrTeacher,
    upload.single('lecture'), 
    addLectureToCourseById
);

/**
 * @route DELETE /api/v1/course/:courseId/lectures/:lectureId
 * @description Xóa một video bài giảng khỏi khóa học
 * @access Private - Course owner or Admin
 */
router.delete(
    '/:courseId/lectures/:lectureId',
    isLoggedIn,
    isAdminOrTeacher,
    removeLecture
);

export default router;