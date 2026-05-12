import { Router } from "express";
import { verifyJwt } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/admin.middlewares.js";

import {
  getTeachers,
  getStudents,
  toggleAccountStatus,
  toggleUserBan,
  verifyUserByAdmin
} from "../controllers/user.controller.js";

import getActivityLogs from "../controllers/activitylogs.controller.js";

const router = Router();

// Protect all admin routes
router.use(verifyJwt, adminOnly);

// 👤 Current logged-in admin
router.get("/me", (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// 📊 Activity logs
router.get("/", getActivityLogs);

// Get All Teachers
router.get("/users/teacher", getTeachers);

// Get All Students
router.get("/users/student", getStudents);

// Ban / unban user
router.patch("/users/:userId/ban", toggleUserBan);

// toggle accountStatus
router.patch("/users/:userId/status", toggleAccountStatus);

router.patch("/verify/:userId", verifyUserByAdmin);

export default router;