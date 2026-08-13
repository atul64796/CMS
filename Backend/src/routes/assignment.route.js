import {Router} from "express";
import {verifyJwt} from "../middlewares/authMiddleware.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getNotifications,
    getAllAssignment,
    downloadAllSubmission,
    getMyAssignments,
    getStudentAssignments
} from "../controllers/assignment.controller.js";

const router = Router();

//Teacher -> Create Assignment
router.post("/create-assignment",verifyJwt,createAssignment)

router.put(
    "/update-assignment/:assignmentId",
    verifyJwt,
    updateAssignment
);

router.delete(
    "/delete-assignment/:assignmentId",
    verifyJwt,
    deleteAssignment
);


router.get("/my-assignments", verifyJwt, getMyAssignments);
//student -> Submit Assignment (file upload)
router.post("/submit-assignment",
    verifyJwt,
    upload.single("file"),
    submitAssignment
);

//Get Notifications (Student)
router.get(
    "/notifications",
    verifyJwt,
    getNotifications
)

//Get all submission of assignment
router.get("/submission/:assignmentId",
    verifyJwt,
    getAllAssignment
)
//Get all assignment of student
router.route("/studentAssignments")
    .get(verifyJwt, getStudentAssignments);

router.get("/download-zip/:assignmentId",
    verifyJwt,
    downloadAllSubmission
)

export default router;
