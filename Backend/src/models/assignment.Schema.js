import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    deadline: {
        type: Date,
        required: true
    },

    fileType: {
        type: [String],   
        required: true
    },

    maxSize: {
        type: Number, // in MB
        required: true
    },

    // who created assignment (teacher)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UsersSchema",
        required: true
    },

    // 🔥 student submissions (for future ZIP download)
    submissions: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UsersSchema"
            },
            fileUrl: String,
            fileName: String,
            submittedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

}, { timestamps: true });

export default mongoose.model("Assignment", assignmentSchema);