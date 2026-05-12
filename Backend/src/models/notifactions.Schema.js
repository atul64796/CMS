import mongoose from "mongoose";

const NotificationsSchema = new mongoose.Schema({
    
    // 👇 student who will receive notification
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UsersSchema",
        required: true,
        index: true
    },

    // 👇 assignment reference
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },

    // 👇 teacher reference (who created assignment)
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UsersSchema",
        required: true
    },

    type: {
        type: String,
        enum: ["assignment", "warning", "info"],
        default: "assignment"
    },

    isRead: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

export default mongoose.model("Notification", NotificationsSchema);