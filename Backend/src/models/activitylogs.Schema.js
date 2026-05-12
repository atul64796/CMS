import mongoose from "mongoose";

const ActivityLogsSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"UsersSchema",
        index:true,
        required:true
    },
    action: {
  type: String,
  enum: [
    "CREATE_ASSIGNMENT",
    "SUBMIT_ASSIGNMENT",
    "DOWNLOAD_SUBMISSIONS",
    "REGISTER",
    "LOGIN",
    "LOGOUT"
  ],
  required: true
},
   
    details:{
        type:String,
    },
   role: {
  type: String,
  enum: ["student", "teacher", "admin"]
},
    ipAddress: {
        type: String,
    },
},{timestamps:true})

export default mongoose.model("ActivityLogs",ActivityLogsSchema)