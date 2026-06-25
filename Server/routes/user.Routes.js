import { Router } from "express";

import { 
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword, 
    changePassword, 
    updateUser,
    getUnverifiedTeachers,
    verifyTeacher,
    rejectTeacher,
    getAllTeachers
} from "../controllers/user.controller.js";
import { isLoggedIn, isAdmin } from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

/**
 * @route POST /register
 * @description Registers a new user (USER or TEACHER) and uploads their avatar.
 * @access Public
 */
router.post('/register', upload.single("avatar"), register);

/**
 * @route POST /login
 * @description Logs in the user.
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /logout
 * @description Logs out the user.
 * @access Public
 */
router.post('/logout', logout);

/**
 * @route GET /me
 * @description Fetches the logged-in user's profile.
 * @access Private, Authenticated users only
 */
router.get('/me', isLoggedIn, getProfile);

/**
 * @route POST /reset
 * @description Initiates password reset process by sending a reset link.
 * @access Public
 */
router.post('/reset', forgotPassword);

/**
 * @route POST /reset/:resetToken
 * @description Resets the password using the reset token.
 * @access Public
 */
router.post('/reset/:resetToken', resetPassword);

/**
 * @route POST /change-password
 * @description Changes the logged-in user's password.
 * @access Private, Authenticated users only
 */
router.post('/change-password', isLoggedIn, changePassword);

/**
 * @route PUT /update
 * @description Updates the logged-in user's profile information and avatar.
 * @access Private, Authenticated users only
 */
router.put('/update', isLoggedIn, upload.single("avatar"), updateUser);

/**
 * @route GET /teachers/unverified
 * @description Get all unverified teachers (Admin only)
 * @access Private, Admin only
 */
router.get('/teachers/unverified', isLoggedIn, isAdmin, getUnverifiedTeachers);

/**
 * @route PUT /teachers/:teacherId/verify
 * @description Admin verifies a teacher
 * @access Private, Admin only
 */
router.put('/teachers/:teacherId/verify', isLoggedIn, isAdmin, verifyTeacher);

/**
 * @route DELETE /teachers/:teacherId/reject
 * @description Admin rejects a teacher request
 * @access Private, Admin only
 */
router.delete('/teachers/:teacherId/reject', isLoggedIn, isAdmin, rejectTeacher);

/**
 * @route GET /teachers
 * @description Get all verified teachers
 * @access Public
 */
router.get('/teachers', getAllTeachers);

export default router;