import { ApiError } from "../utils/ApiError.js";

//  Only For Teacher's Middleware
export const isTeacher = (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    if (req.user.role !== "teacher") {
        throw new ApiError(403, "Access denied: Teacher only");
    }

    next(); 
};