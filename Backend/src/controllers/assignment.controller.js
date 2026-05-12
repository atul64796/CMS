import User from "../models/users.Schema.js";
import Assignment from "../models/assignment.Schema.js";
import Notification from "../models/notifactions.Schema.js";

import archiver from "archiver";
import axios from "axios";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

import {uploadFileToUploadcare} from "../utils/clouduploader.js"

import createActivityLog from "../utils/activityLog.js"


const createAssignment = asyncHandler(async (req, res) => {
    const { title, description, deadline, fileType, maxSize } = req.body;

    if (!title || !deadline || !fileType || !maxSize) {
        throw new ApiError(400, "All fields are required");
    }

    if (req.user.role !== "teacher") {
        throw new ApiError(403, "Only teacher can create assignment");
    }

    // 🔥 create assignment
    const assignment = await Assignment.create({
        title,
        description,
        deadline,
        fileType,
        maxSize,
        createdBy: req.user._id
    });

    // 🔥 get all students
    const students = await User.find({ role: "student" });

    // 🔥 NEW notification structure
    const notifications = students.map(student => ({
        userId: student._id,
        assignmentId: assignment._id,
        teacherId: req.user._id,
        type: "assignment"
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

 await Promise.all(
    students.map(async (student) => {

        // skip teacher/self
        if(student._id.toString() === req.user._id.toString()) {
            return;
        }

        await sendEmail(
            student.email,
            "New Assignment Added",
            `
            <h2>New Assignment Uploaded</h2>

            <p>Hello ${student.fullname},</p>

            <p>A new assignment has been uploaded by your teacher.</p>

            <h3>${title}</h3>

            <p>Deadline: ${deadline}</p>

            <p>Please submit before deadline.</p>
            `
        );
    })
);

    await createActivityLog(
        req,
        "CREATE_ASSIGNMENT",
        `Created assignment ${title}`
    );

    return res.status(201).json(
        new ApiResponse(201, assignment, "Assignment created successfully")
    );
});

// UPDATE ASSIGNMENT
const updateAssignment = asyncHandler(async (req, res) => {

    const { assignmentId } = req.params;

    const { title, description, deadline, fileType, maxSize } = req.body;

    if (!assignmentId) {
        throw new ApiError(400, "Assignment Id Required");
    }

    if (req.user.role !== "teacher") {
        throw new ApiError(403, "Only teacher can update assignment");
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
        throw new ApiError(404, "Assignment not found");
    }

    // only creator teacher can update
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    // update fields
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.deadline = deadline || assignment.deadline;
    assignment.fileType = fileType || assignment.fileType;
    assignment.maxSize = maxSize || assignment.maxSize;

    await assignment.save();

    // activity log
    await createActivityLog(
        req,
        "UPDATE_ASSIGNMENT",
        `Updated assignment ${assignment.title}`
    );

    return res.status(200).json(
        new ApiResponse(200, assignment, "Assignment updated successfully")
    );

});


// DELETE ASSIGNMENT
const deleteAssignment = asyncHandler(async (req, res) => {

    const { assignmentId } = req.params;

    if (!assignmentId) {
        throw new ApiError(400, "Assignment Id Required");
    }

    if (req.user.role !== "teacher") {
        throw new ApiError(403, "Only teacher can delete assignment");
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
        throw new ApiError(404, "Assignment not found");
    }

    // only creator teacher can delete
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    // delete notifications related to assignment
    await Notification.deleteMany({
        assignmentId: assignment._id
    });

    // delete assignment
    await Assignment.findByIdAndDelete(assignmentId);

    // activity log
    await createActivityLog(
        req,
        "DELETE_ASSIGNMENT",
        `Deleted assignment ${assignment.title}`
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Assignment deleted successfully")
    );

});



// GET all assignments created by teacher
const getMyAssignments = asyncHandler(async (req, res) => {
  if (req.user.role !== "teacher") {
    throw new ApiError(403, "Only teacher allowed");
  }

  const assignments = await Assignment.find({
    createdBy: req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, assignments, "Assignments fetched")
  );
});


// SUBMIT ASSIGNMENT (Student)
const submitAssignment = asyncHandler(async (req, res) => {

    const { assignmentId } = req.body;

    // ================= VALIDATION =================

    if (!assignmentId) {
        throw new ApiError(
            400,
            "Assignment ID is required"
        );
    }

    if (!req.file) {
        throw new ApiError(
            400,
            "File is required"
        );
    }

    // ================= FIND ASSIGNMENT =================

    const assignment = await Assignment.findById(
        assignmentId
    );

    if (!assignment) {
        throw new ApiError(
            404,
            "Assignment not found"
        );
    }

    // ================= FILE TYPE VALIDATION =================

    const uploadedExtension =
  req.file.originalname
    .split(".")
    .pop()
    .toLowerCase();

const allowedFileTypes =
  Array.isArray(assignment.fileType)
    ? assignment.fileType.map(type =>
        type.toLowerCase()
      )
    : [assignment.fileType.toLowerCase()];

if (
  !allowedFileTypes.includes(
    uploadedExtension
  )
) {

  throw new ApiError(
    400,
    `Only ${allowedFileTypes.join(", ").toUpperCase()} file allowed`
  );

}

    // ================= FILE SIZE VALIDATION =================

    const maxSizeInBytes =
        assignment.maxSize * 1024 * 1024;

    if (req.file.size > maxSizeInBytes) {

        throw new ApiError(
            400,
            `File size exceeds ${assignment.maxSize} MB`
        );

    }

    // ================= DUPLICATE SUBMISSION CHECK =================

    const alreadySubmitted =
        assignment.submissions.find(
            (sub) =>
                sub.student.toString() ===
                req.user._id.toString()
        );

    if (alreadySubmitted) {

        throw new ApiError(
            400,
            "You have already submitted this assignment"
        );

    }

    // ================= UPLOAD FILE =================

    const file = await uploadFileToUploadcare(
        req.file.path,
        req.file.originalname
    );

    if (!file) {

        throw new ApiError(
            500,
            "File upload failed"
        );

    }

    // ================= SAVE SUBMISSION =================

    assignment.submissions.push({
        student: req.user._id,
        fileUrl: file.url,
        fileName: req.file.originalname
    });

    await assignment.save();

    // ================= ACTIVITY LOG =================

    await createActivityLog(
        req,
        "SUBMIT_ASSIGNMENT",
        `Submitted Assignment ${assignmentId}`
    );

    // ================= RESPONSE =================

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Assignment submitted successfully"
        )
    );

});


const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        userId: req.user._id
    })
    .populate({
        path: "assignmentId",
        select: "title description fileType maxSize deadline createdBy submissions",
        populate: {
            path: "createdBy",
            select: "fullname avatar"
        }
    })
    .populate({
        path: "teacherId",   
        select: "fullname avatar"
    })
    .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

//GET ALL ASSIGNMENT

const getAllAssignment = asyncHandler(async (req,res) => {
    
    const {assignmentId } = req.params;

    if(!assignmentId)
    {
        throw new ApiError(400,"Assignment Id Required");
    }

    if(req.user.role !== "teacher")
    {
        throw new ApiError(400,"Only Teacher Can get All assignment");       
    }

    const assignment = await Assignment.findById(assignmentId)
    .populate("submissions.student","fullname rollNumber avatar");

     if (!assignment) {
        throw new ApiError(404, "Assignment not found");
    }


    res.status(200)
    .json(new ApiResponse(200,assignment.submissions,"Submition fetched"));

})



const downloadAllSubmission = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  if (!assignmentId) {
    throw new ApiError(400, "Assignment Id Required");
  }

  if (req.user.role !== "teacher") {
    throw new ApiError(403, "Only teacher can download");
  }

  const assignment = await Assignment.findById(assignmentId)
    .populate("submissions.student", "fullname rollNumber");

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  await createActivityLog(
    req,
    "DOWNLOAD_SUBMISSIONS",
    `Download All Submissions ${assignment.title}`
  )



  const submissions = assignment.submissions;

  if (!submissions.length) {
    throw new ApiError(400, "No submissions found");
  }

  // headers
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${assignment.title}.zip`
  );

  const archive = archiver("zip", {
    zlib: { level: 9 }
  });

  archive.on("error", (err) => {
    throw new ApiError(500, err.message);
  });

  archive.pipe(res);

  for (const sub of submissions) {
    try {
      if (!sub.fileUrl) continue;

      console.log("👉 Downloading:", sub.fileUrl);

const response = await axios({
  method: "GET",
  url: sub.fileUrl,
  responseType: "stream"
});

if (response.status !== 200) {
  console.log(" Skip file:", sub.fileUrl);
  continue;
}


      const safeName = sub.student.fullname.replace(/\s+/g, "_");

     const fileName = `${sub.student.rollNumber}_${safeName}_${sub.fileName}`;

      archive.append(response.data, { name: fileName });

      console.log("Added:", fileName);

    } catch (error) {
      console.log("Failed:", sub.fileUrl);
    }
  }


  await archive.finalize();
});


export {
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getNotifications,
    getAllAssignment,
    downloadAllSubmission,
    getMyAssignments
};