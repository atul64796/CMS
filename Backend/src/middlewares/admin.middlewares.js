import { ApiError } from "../utils/ApiError.js";


export const adminOnly = (req,_,next)=>{
    if(req.user?.role !== "admin")
    {
        throw new ApiError(403,"Admin access required");
    }

    if(req.user.isBanned || req.user.accountStatus !== "active")
    {
        throw new Api(403,"Account is not active");
    }
    next();
}
