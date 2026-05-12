import { 
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateAccountDetails,
    updatePassword,
    updateAvatar,
 } from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

//registered user
router.post("/register", upload.single("avatar"), registerUser);

//login user
router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(verifyJwt,logoutUser);

//get user
router.route("/getuser").get(verifyJwt,getCurrentUser);

//update password & acountdetails
router.route("/updatePassword").patch(verifyJwt,updatePassword);
router.route("/updateAccount").patch(verifyJwt,updateAccountDetails);

//update avatar
router.route("/updateAvatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)




export default router;