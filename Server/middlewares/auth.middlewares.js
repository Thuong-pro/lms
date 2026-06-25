import jwt from "jsonwebtoken";

import User from '../models/usermodel.js'
import AppError from "../utils/error.util.js";

/**
 * @isLoggedIn - Middleware to check if the user is authenticated.
 * Verifies the JWT token from the cookies and attaches the user details to the request object.
 * If no token is present or invalid, it returns an "Unauthenticated" error.
 */

const isLoggedIn = async (req, res, next)=>{
    const {token}= req.cookies;

    if(!token){
        return next(new AppError('Unauthenticated, pls login  again ', 401));
    }
    try {
        const userDetails= await jwt.verify(token , process.env.JWT_SECRET );
        req.user = userDetails;
        next();
    } catch(error) {
        return next(new AppError('Invalid or expired token', 401));
    }
}

/**
 * @authorizedRoles - Middleware to check if the user has authorized roles.
 * It ensures that the current user has one of the roles required to access the route.
 * FIXED: Changed 'roles' to 'role' and inverted logic
 */
const authorizedRoles = (...roles)=>async(req, res, next)=>{
    const currentUserRole = req.user.role;
    if(!roles.includes(currentUserRole)){
        return next (
            new AppError("You do not have permission to access this route", 403)
        )
    }
    next();
}

/**
 * @isAdmin - Middleware to check if the user is an admin.
 */
const isAdmin = async(req, res, next) => {
    if(req.user.role !== 'ADMIN') {
        return next(new AppError("Only admins can access this route", 403));
    }
    next();
}

/**
 * @isTeacher - Middleware to check if the user is a teacher.
 */
const isTeacher = async(req, res, next) => {
    if(req.user.role !== 'TEACHER') {
        return next(new AppError("Only teachers can access this route", 403));
    }
    next();
}

/**
 * @isAdminOrTeacher - Middleware to check if the user is admin or teacher.
 */
const isAdminOrTeacher = async(req, res, next) => {
    console.log("=== THÔNG TIN USER GỬI LÊN ===");
    console.log("Role đang có là:", req.user?.role);
    if(req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
        return next(new AppError("Only admins and teachers can access this route", 403));
    }
    next();
}

/**
 * @authorizedSubscriber - Middleware to check if the user has an active subscription.
 * If the user is not an admin and does not have an active subscription, it returns a "Forbidden" error.
 */
const authorizedSubscriber = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const subscription = user.subscription.status;
        const currentUserRole = user.role;
        
        if (currentUserRole !== 'ADMIN' && currentUserRole !== 'TEACHER' && subscription !== 'active') {
            return next(new AppError("Please subscribe to access this course", 403));
        }
        next();
    } catch(error) {
        return next(new AppError("Error checking subscription", 500));
    }
}


export{
    isLoggedIn,
    authorizedRoles,
    authorizedSubscriber,
    isAdmin,
    isTeacher,
    isAdminOrTeacher
}
