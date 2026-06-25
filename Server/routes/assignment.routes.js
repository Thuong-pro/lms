import { Router } from 'express';
import { 
    createAssignment, 
    submitAssignment, 
    gradeAssignment, 
    getAssignmentsByCourse 
} from '../controllers/assignment.controller.js';
import { isLoggedIn, authorizedRoles } from '../middlewares/auth.middlewares.js';

const router = Router();

// Lấy danh sách bài tập của 1 khóa (Ai đăng nhập cũng xem được)
router.get('/:courseId', isLoggedIn, getAssignmentsByCourse);

// Giáo viên tạo bài tập
router.post('/', isLoggedIn, authorizedRoles('ADMIN'), createAssignment); 

// Học sinh nộp bài
router.post('/:assignmentId/submit', isLoggedIn, submitAssignment);

// Giáo viên chấm điểm
router.put('/:assignmentId/grade/:studentId', isLoggedIn, authorizedRoles('ADMIN'), gradeAssignment);

export default router;