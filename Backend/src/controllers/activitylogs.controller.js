import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import ActivityLogs from "../models/activitylogs.Schema.js"

 const getActivityLogs = asyncHandler(async (req,res) => {
    const {action,role,page =1,limit = 10} = req.query;

    //only teacher and admin can view logs
    if(req.user.role !== "teacher" && req.user.role !== "admin")
    {
        throw new ApiError(400,"Only Admin and teacher can viwe logs");
    }

    //filter object
    let filter = {};

    if(action) filter.action = action;
    if(role) filter.role = role;

    const logs = await ActivityLogs.find(filter)
    .populate("userId","fullname email rollNumber")
    .sort({createdAt:-1})
    .skip((page-1) * limit)
    .limit(Number(limit));

    return res.status(200)
    .json(new ApiResponse(200,logs,"Activity logs fetched successfully"))

})

export default getActivityLogs;