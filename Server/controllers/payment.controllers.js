import crypto from 'crypto'

import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Payment from '../models/payment.model.js';
import User from '../models/usermodel.js';
import Course from '../models/course.model.js';
import AppError from "../utils/error.util.js";
import { razorpay } from "../server.js";

/**
 * @GET_RAZORPAY_ID
 * Returns the Razorpay API key for the
 *  client-side.
 */
export const getRaZorpayApikey =asyncHandler(async(req, res, next)=>{
    try {
        res.status(200).json({
            success:true,
            message:'Razarpay API key ',
            key:process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        ) 
    }
  
});
/**
 * @ACTIVATE_SUBSCRIPTION
 * Handles the subscription process for the user by creating a new Razorpay subscription.
 */
export const buySubscription =asyncHandler(async(req, res, next)=>{
    try {
        const {id}= req.user;
        const user =await User.findById(id);
        if(!user){
            return next(
                new AppError("Unauthorize , please login")
            )
        }
        if(user.role==='ADMIN'){
            return next(
                new AppError(" Admin cannot purchase a subscription", 400)
            ) 
        }
        if (user.subscription.id && user.subscription.status === 'created') {
            await user.save()

            res.status(200).json({
                success: true,
                message: "subscribed successfully",
                subscription_id: user.subscription.id
            })
        }
        else{
            const subscription = await razorpay.subscriptions.create({
                plan_id:process.env.RAZORPAY_PLAN_ID,
                customer_notify:1  ,
                total_count: 12,
            });
            user.subscription.id = subscription.id;

            user.subscription.status= subscription.status;
        
            await user.save();
            console.log(user.subscription.id);
            res.status(200).json({
                success:true,
                message:'Subscribed Sucessfully ',
                subscription_id:subscription.id
            });
      }
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        ) 
    }
 
});
/**
 * @VERIFY_SUBSCRIPTION
 * Verifies the payment for the subscription by validating the Razorpay payment signature.
 */
export const verifySubscription = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.user;
        const { courseId } = req.body;

        // Validate courseId
        if (!courseId) {
            return next(new AppError('courseId là bắt buộc', 400));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new AppError('Không tìm thấy người dùng', 404));
        }

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Khóa học không tồn tại', 404));
        }

        // Bật trạng thái active
        if (!user.subscription) {
            user.subscription = {};
        }
        user.subscription.status = 'active';
        await user.save(); 

        // Ghi dữ liệu vào Payment với courseId
        await Payment.create({
            razorpay_payment_id: 'CHUYEN_KHOAN_THU_CONG_123',
            razorpay_signature: 'CHU_KY_THU_CONG_123',
            razorpay_subscription_id: 'HOA_DON_THU_CONG_123',
            userId: id,
            courseId: courseId,
            amount: 499000
        });

        // Enroll user vào KHÓA HỌC CỤ THỂ (không phải tất cả)
        const alreadyEnrolled = course.enrolledStudents.find(
            e => e.studentId.toString() === id
        );

        if (!alreadyEnrolled) {
            course.enrolledStudents.push({
                studentId: id,
                status: 'active',
                enrolledAt: new Date(),
                progress: 0
            });
            course.numberOfStudents = course.enrolledStudents.length;
        } else if (alreadyEnrolled.status === 'inactive') {
            alreadyEnrolled.status = 'active';
        }
        await course.save();

        // Add course to user's enrolledCourses
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
        } else if (userEnrollment.status === 'inactive') {
            userEnrollment.status = 'active';
        }
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Thanh toán thành công! Khóa học đã được mở.'
        });
        
    } catch (error) {
        console.log("============== LỖI MỚI NHẤT Ở ĐÂY ==============");
        console.error(error);
        console.log("================================================");
        return next(new AppError(error.message, 500));
    }
});
/**
 * @CANCEL_SUBSCRIPTION
 * Cancels the user's subscription with Razorpay and updates the user's subscription status to inactive.
 */
export const cancelSubscription =asyncHandler(async(req, res, next)=>{

    try {
        const {id}= req.user;

        const user = await User.findById(id);
        if(!user){
            return next(
                new AppError("Unauthorize , please login")
            )
        }
        if(user.role==='ADMIN'){
            return next(
                new AppError(" Admin cannot purchase a subscription", 400)
            ) 
        }

        const subscriptionId= user.subscription.id;
        const subscription =await razorpay.subscriptions.cancel(
            subscriptionId
        )
        user.subscription.status='Inactive';

        // Set tất cả enrolled courses thành inactive
        user.enrolledCourses.forEach(enrollment => {
            enrollment.status = 'inactive';
        });
        await user.save();

        // Update courses to set user's status to inactive
        const courses = await Course.find({
            'enrolledStudents.studentId': id
        });

        for (const course of courses) {
            const enrollment = course.enrolledStudents.find(
                e => e.studentId.toString() === id
            );
            if (enrollment) {
                enrollment.status = 'inactive';
            }
            await course.save();
        }

        res.status(200).json({
            success:true,
            message:'UnSubscribed  Sucessfully ',
        });
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        ) 
    }
    
});
/**
 * @GET_RAZORPAY_ID
 * Fetches and returns the payment records for all subscriptions, with monthly payment statistics.
 */
export const allPayments =asyncHandler(async(req, res, next)=>{
    try {
        const{count,skip}=req.query;
    
        const allPayments = await razorpay.subscriptions.all({
            count: count ? count : 10, // If count is sent then use that else default to 10
            skip: skip ? skip : 0
        })

        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

         const finalMonths = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0,
        };

        const monthlyWisePayments = allPayments.items.map((payment) => {
            // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
            const monthsInNumbers = new Date(payment.start_at * 1000);
        
            return monthNames[monthsInNumbers.getMonth()];
        });

          monthlyWisePayments.map((month) => {
            Object.keys(finalMonths).forEach((objMonth) => {
              if (month === objMonth) {
                finalMonths[month] += 1;
              }
            });
          });

          const monthlySalesRecord = [];

          Object.keys(finalMonths).forEach((monthName) => {
            monthlySalesRecord.push(finalMonths[monthName]);
          });
        
          res.status(200).json({
            success: true,
            message: 'All payments',
            allPayments,
            finalMonths,
            monthlySalesRecord,
          });
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        ) 
    }
 
   
});
