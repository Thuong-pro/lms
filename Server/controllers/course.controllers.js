import cloudinary from 'cloudinary'
import fs from 'fs/promises'

import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Course from "../models/course.model.js"
import User from "../models/usermodel.js"
import AppError from "../utils/error.util.js";

/**
 * @GET_ALL_COURSES
 * Fetches all courses excluding lectures.
 */
export const getAllCourse = asyncHandler(async (req, res, next)=>{
    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success:true,
            message:'All course',
            courses,
        })
        
    } catch (error) {
        return next(
            new AppError(e.message,500)
        )
    }
      
});
/**
 * @GET_LECTURES_BY_COURSE_ID
 * Fetches lectures and quizzes for a specific course - only if user is enrolled or is teacher/admin
 */
export const getLecturesByCourseId = asyncHandler(async (req, res, next)=>{
    try {
        const {id} = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log('=== GET LECTURES BY COURSE ID ===');
        console.log('courseId:', id);
        console.log('userId:', userId);
        console.log('userRole:', userRole);

        const course = await Course.findById(id).populate('quizzes');

        console.log('Course found:', !!course);
        console.log('Course quizzes count:', course?.quizzes?.length || 0);
        console.log('Course lectures count:', course?.lectures?.length || 0);

        if(!course){
            console.log('Course not found');
            return next(
                new AppError('Course not found',404)
            )
        }

        // Check enrollment - only enrolled students or admin/teacher can view lectures
        const enrollment = course.enrolledStudents.find(
            e => e.studentId.toString() === userId && e.status === 'active'
        );

        console.log('Enrollment found:', !!enrollment);
        console.log('User role check:', userRole === 'ADMIN' || userRole === 'TEACHER');

        if (userRole !== 'ADMIN' && userRole !== 'TEACHER' && !enrollment) {
            console.log('Access denied: Not enrolled');
            return next(
                new AppError('Bạn chưa đăng ký khóa học này. Vui lòng mua để xem các bài giảng.', 403)
            )
        }

        console.log('=== SUCCESS ===');
        console.log('Returning:', {
            lectures: course.lectures.length,
            quizzes: course.quizzes.length
        });

        res.status(200).json({
            success:true,
            message:'Course lectures and quizzes fetched successfully',
            lectures: course.lectures,
            quizzes: course.quizzes || []
        })
        
    } catch (error) {
        console.error('Error in getLecturesByCourseId:', error);
        return next(
            new AppError(error.message,500)
        )
    }
});
/**
 * @CREATE_COURSE
 * Creates a new course and optionally uploads a thumbnail image.
 * Only TEACHER and ADMIN can create courses
 */
export const createCourse = asyncHandler(async (req, res, next)=>{
    const {title, description, category}= req.body;
    const userId = req.user.id;
    
    if(!title || !description || !category){
        return next(
            new AppError('Title, description and category are required', 400)
        )
    }
    
    const course = await Course.create({
        title,
        description,
        category,
        teacherId: userId,
        createdBy: req.user.fullName || userId,
        thumbnail:{
            public_id:'Dummy',
            secure_url:'Dummy'
        },
    });

    if(!course){
        return next(
            new AppError('Course creation failed, please try again', 500)
        )
    }
    
    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'lms'
            });
            if(result){
                course.thumbnail.public_id=result.public_id;
                course.thumbnail.secure_url=result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);
        }catch (error) {
            return next(
                new AppError(error.message, 500)
            )
        }
    }
    
    await course.save();
    
    res.status(201).json({
        success:true,
        message:'Course created successfully',
        course,
    })
});
/**
 * @UPDATE_COURSE_BY_ID
 * Updates an existing course by ID.
 * Only teacher who created it or admin can update
 */
export const updateCourse = asyncHandler(async (req, res, next)=>{
    try {
        const {id}= req.params;
        const userId = req.user.id;

        const course = await Course.findById(id);
        
        if(!course){
            return next (
                new AppError("Course with given id does not exist", 404)
            ) 
        }

        // Check if user is the teacher or admin
        if(course.teacherId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError("You can only update courses you created", 403));
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body
            },
            {
                runValidators: true,
                new: true
            }
        );
        
        res.status(200).json({
            success:true,
            message:'Course updated successfully',
            course: updatedCourse
        })
    } catch (error) {
        return next (
            new AppError(error.message, 500)
        )
    }
});
/**
 * @DELETE_COURSE_BY_ID
 * Deletes a course by its ID.
 * Only teacher who created it or admin can delete
 */
export const removeCourse = asyncHandler(async (req, res, next)=>{
    try {
        const {id }= req.params;
        const userId = req.user.id;
        
        const course = await  Course.findById(id);
        if(!course){
            return next (
                new AppError("Course with given id does not exist", 404)
            ) 
        }

        // Check if user is the teacher or admin
        if(course.teacherId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError("You can only delete courses you created", 403));
        }
        
        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success:true,
            message:'Course deleted successfully',
        })
        
    } catch (error) {
        return next (
            new AppError(error.message, 500)
        )
    }
});


/**
 * @ADD_LECTURE
 * Adds a lecture to a course and uploads video to Cloudinary.
 * Only teacher who created course or admin can add lectures
 */
export const addLectureToCourseById= asyncHandler(async(req, res, next )=>{
    const { title, description} = req.body;
    const {id }= req.params;
    const userId = req.user.id;

    if(!title || !description){
        return next(
            new AppError('Title and description are required', 400)
        )
    }

    const course = await Course.findById(id);

    if(!course){
        return next(
            new AppError('Course does not exist', 404)
        )
    }

    // Check if user is the teacher or admin
    if(course.teacherId.toString() !== userId && req.user.role !== 'ADMIN') {
        return next(new AppError("You can only add lectures to your own courses", 403));
    }

    const lectureData ={
        title,
        description,
        lecture:{}
    }
    
    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'lms',
                chunk_size:50000000,
                resource_type:'video'
            });
            if(result){
                lectureData.lecture.public_id=result.public_id;
                lectureData.lecture.secure_url=result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);
        }catch (error) {
            return next(
                new AppError(error.message, 500)
            )
        }
        course.lectures.push(lectureData);
        course.numberOfLectures=course.lectures.length;
        await course.save();
        
        res.status(200).json({
            success:true,
            message:'Lecture added successfully',
            course,
        })
    } else {
        return next(new AppError('Lecture video file is required', 400));
    }
});
/**
 * @REMOVE_LECTURE
 * Removes a lecture from a course by its ID and deletes the video from Cloudinary.
 * Only teacher who created course or admin can remove lectures
 */
export const removeLecture =asyncHandler( async(req, res, next )=>{
    try {
        const courseId = req.params.courseId;
        const lectureId = req.params.lectureId;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Check if user is the teacher or admin
        if(course.teacherId.toString() !== userId && req.user.role !== 'ADMIN') {
            return next(new AppError("You can only remove lectures from your own courses", 403));
        }

        // Find the index of the lecture in the array
        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId
        );

        if (lectureIndex === -1) {
            return next(new AppError('Lecture not found', 404));
        }
        
        // Delete the lecture from cloudinary
        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            {
            resource_type: 'video',
            }
        );
        
        // Remove the lecture from the array
        course.lectures.splice(lectureIndex, 1);
        course.numberOfLectures -= 1;
        
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture removed successfully',
        });

    }catch (error) {
        return next (
            new AppError(error.message, 500)
        )
    }
});

/**
 * @GET_MY_ENROLLED_COURSES
 * Fetches all courses where the user is enrolled with status 'active'
 */
export const getMyEnrolledCourses = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const courses = await Course.find({
            'enrolledStudents': {
                $elemMatch: {
                    studentId: userId,
                    status: 'active'
                }
            }
        }).select('-lectures');

        if (!courses) {
            return res.status(200).json({
                success: true,
                message: 'No enrolled courses',
                courses: []
            });
        }

        // Thêm thông tin progress từ enrolledStudents
        const coursesWithProgress = courses.map(course => {
            const enrollment = course.enrolledStudents.find(
                e => e.studentId.toString() === userId && e.status === 'active'
            );
            return {
                ...course.toObject(),
                progress: enrollment?.progress || 0,
                enrollmentStatus: enrollment?.status || 'inactive'
            };
        });

        res.status(200).json({
            success: true,
            message: 'Enrolled courses fetched successfully',
            courses: coursesWithProgress
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @ENROLL_COURSE
 * Enrolls a user into a course
 */
export const enrollCourse = asyncHandler(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Check if already enrolled
        const alreadyEnrolled = course.enrolledStudents.find(
            e => e.studentId.toString() === userId
        );

        if (alreadyEnrolled) {
            if (alreadyEnrolled.status === 'active') {
                return next(new AppError('You are already enrolled in this course', 400));
            }
            // Reactivate if inactive
            alreadyEnrolled.status = 'active';
            await course.save();
        } else {
            // Add new enrollment
            course.enrolledStudents.push({
                studentId: userId,
                status: 'active',
                enrolledAt: new Date(),
                progress: 0
            });
            course.numberOfStudents = course.enrolledStudents.length;
            await course.save();
        }

        // Add course to user's enrolledCourses
        const user = await User.findById(userId);
        
        const userEnrollment = user.enrolledCourses.find(
            e => e.courseId.toString() === courseId
        );

        if (!userEnrollment) {
            user.enrolledCourses.push({
                courseId: courseId,
                status: 'active',
                enrolledAt: new Date(),
                progress: 0
            });
            await user.save();
        } else if (userEnrollment.status === 'inactive') {
            userEnrollment.status = 'active';
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Enrolled successfully',
            course
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UNENROLL_COURSE
 * Unenrolls a user from a course (sets status to inactive)
 */
export const unenrollCourse = asyncHandler(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Update in Course model
        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    'enrolledStudents.$[elem].status': 'inactive'
                }
            },
            {
                arrayFilters: [
                    {
                        'elem.studentId': userId
                    }
                ],
                new: true
            }
        );

        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Update in User model
        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'enrolledCourses.$[elem].status': 'inactive'
                }
            },
            {
                arrayFilters: [
                    {
                        'elem.courseId': courseId
                    }
                ]
            }
        );

        res.status(200).json({
            success: true,
            message: 'Unenrolled successfully'
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @CHECK_ENROLLMENT
 * Check if user is enrolled in a specific course
 */
export const checkEnrollment = asyncHandler(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const enrollment = course.enrolledStudents.find(
            e => e.studentId.toString() === userId && e.status === 'active'
        );

        res.status(200).json({
            success: true,
            isEnrolled: !!enrollment,
            enrollment: enrollment || null
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UPDATE_COURSE_PROGRESS
 * Update student's progress in a course
 */
export const updateCourseProgress = asyncHandler(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { progress } = req.body;
        const userId = req.user.id;

        console.log('=== UPDATE PROGRESS ===');
        console.log('courseId:', courseId);
        console.log('progress:', progress);
        console.log('userId:', userId);

        if (!progress && progress !== 0 || progress < 0 || progress > 100) {
            console.log('Invalid progress:', progress);
            return next(new AppError('Invalid progress value (0-100)', 400));
        }

        const course = await Course.findById(courseId);
        console.log('Course found:', !!course);
        
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Find and update student's progress in course
        const enrollment = course.enrolledStudents.find(
            e => e.studentId.toString() === userId
        );

        console.log('Enrollment found:', !!enrollment);
        console.log('Current progress:', enrollment?.progress);

        if (!enrollment) {
            return next(new AppError('You are not enrolled in this course', 403));
        }

        // Only increase progress, never decrease
        const newProgress = Math.max(enrollment.progress, progress);
        enrollment.progress = newProgress;
        console.log('Updated progress in course:', newProgress);
        
        await course.save();
        console.log('Course saved');

        // Also update user's enrolledCourses progress
        const user = await User.findById(userId);
        const userEnrollment = user.enrolledCourses.find(
            e => e.courseId.toString() === courseId
        );
        
        console.log('User enrollment found:', !!userEnrollment);
        
        if (userEnrollment) {
            userEnrollment.progress = newProgress;
            console.log('Updated progress in user:', newProgress);
            await user.save();
            console.log('User saved');
        }

        console.log('=== PROGRESS UPDATE SUCCESS ===');

        res.status(200).json({
            success: true,
            message: 'Progress updated successfully',
            progress: newProgress
        });
    } catch (error) {
        console.error('Error in updateCourseProgress:', error);
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_TEACHER_STUDENTS
 * Quét toàn bộ khóa học của Giáo viên và gom danh sách học viên đang đăng ký
 */
export const getTeacherStudents = asyncHandler(async (req, res, next) => {
    try {
        const teacherId = req.user.id;

        // 1. Tìm tất cả khóa học do Giáo viên này tạo, và "populate" (lấy chi tiết) thông tin học sinh
        const courses = await Course.find({ teacherId })
            .populate({
                path: 'enrolledStudents.studentId',
                select: 'fullName email avatar' // Chỉ lấy Tên, Email, Avatar của user
            });

        if (!courses || courses.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Chưa có khóa học nào",
                students: []
            });
        }

        // 2. Gom tất cả học sinh từ các khóa học vào 1 mảng duy nhất
        let allStudents = [];

        courses.forEach(course => {
            // Chỉ lấy những học sinh có trạng thái 'active' (đang học)
            const activeEnrollments = course.enrolledStudents.filter(e => e.status === 'active');

            activeEnrollments.forEach(enrollment => {
                // Kiểm tra xem tài khoản studentId có tồn tại không (tránh lỗi học sinh đã xóa tài khoản)
                if (enrollment.studentId) { 
                    allStudents.push({
                        userId: enrollment.studentId._id,
                        fullName: enrollment.studentId.fullName,
                        email: enrollment.studentId.email,
                        courseTitle: course.title,
                        progress: enrollment.progress || 0
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            message: "Lấy danh sách học viên thành công",
            students: allStudents
        });

    } catch (error) {
        console.error('Error in getTeacherStudents:', error);
        return next(new AppError(error.message, 500));
    }
});