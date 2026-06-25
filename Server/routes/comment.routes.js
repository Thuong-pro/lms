import { Router } from 'express';
import { getCourseComments, addComment } from '../controllers/comment.controller.js';
import { isLoggedIn } from '../middlewares/auth.middlewares.js';

const router = Router();

// Ai đăng nhập (đã mua khóa học) thì mới được xem và bình luận
router.get('/:courseId', isLoggedIn, getCourseComments);
router.post('/:courseId', isLoggedIn, addComment);

export default router;