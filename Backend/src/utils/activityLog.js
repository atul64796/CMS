import ActivityLogs from "../models/activitylogs.Schema.js";

 const createActivityLog = async (req, action, details) => {
  try {
    await ActivityLogs.create({
      userId: req.user._id,
      action: action,
      details: details,
      role: req.user?.role,
      ipAddress: req.ip
    });
  } catch (error) {
    console.log("Log Error:", error.message);
  }
};

export default createActivityLog;