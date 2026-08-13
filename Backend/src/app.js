import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import user from "./routes/User.route.js";
import assignment from "./routes/assignment.route.js";
import admin from "./routes/admin.route.js";
import "./services/cron/reminderCron.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: 'https://cms-silk-gamma.vercel.app', // Your specific frontend domain
  credentials: true // Required to allow cookies/auth headers
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ routes
app.use("/cms/v1/user", user);
app.use("/cms/v1/assignment", assignment);
app.use("/cms/v1/admin", admin);

// ✅ ❗ ERROR HANDLER (ALWAYS LAST)
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "SERVER_ERROR",
    errors: err.errors || [],
  });
});

export default app;