import React, { useEffect, useState } from "react";
import {
  getNotifications,
  submitAssignmentAPI
} from "../../services/api.js";

import Swal from "sweetalert2";

import {
  Upload,
  CheckCircle,
  Clock,
  FileText,
  User
} from "lucide-react";

const StudentPanel = () => {

  const [notifications, setNotifications] = useState([]);

  const [selectedFile, setSelectedFile] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(null);

  const fetchNotifications = async () => {

    try {

      const res = await getNotifications();

      setNotifications(res.data.data);

    } catch (err) {

      console.error(
        "Failed to fetch notifications",
        err
      );

    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ================= SUBMIT ASSIGNMENT =================

 const handleSubmit = async (
  assignmentId
) => {

  const file =
    selectedFile[assignmentId];

  if (!file) {

    return Swal.fire({
      icon: "warning",
      title: "No File Selected",
      text: "Please select a file first",
    });

  }

  setIsSubmitting(assignmentId);

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "assignmentId",
    assignmentId
  );

  try {

    await submitAssignmentAPI(
      formData
    );

    Swal.fire({
      icon: "success",
      title: "Assignment Submitted",
      text: "Assignment turned in successfully 🚀",
      timer: 2000,
      showConfirmButton: false,
    });

    // remove selected file
    const updatedFiles = {
      ...selectedFile
    };

    delete updatedFiles[
      assignmentId
    ];

    setSelectedFile(updatedFiles);

    fetchNotifications();

  } catch (err) {

    console.log(err);

    const errorMessage =
      err?.response?.data?.message ||
      "Submission failed";

    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: errorMessage,
    });

  } finally {

    setIsSubmitting(null);

  }

};

  return (

    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">

      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <div className="mb-10">

          <h1 className="text-3xl font-bold text-slate-800">
            Student Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your assignments and
            track submissions
          </p>

        </div>

        <div className="grid gap-6">

          {notifications.map((notif) => {

            const assignment =
              notif.assignmentId;

            const teacher =
              assignment?.createdBy ||
              notif.teacherId ||
              {};

            const isSubmitted =
              assignment?.submissions?.some(
                (sub) =>
                  sub.student ===
                  notif.userId
              );

            return (

              <div
                key={notif._id}
                className={`group relative bg-white border rounded-2xl p-6 transition-all duration-200 hover:shadow-md ${
                  isSubmitted
                    ? "border-green-100 bg-green-50/20"
                    : "border-slate-200"
                }`}
              >

                <div className="flex flex-col md:flex-row md:items-center gap-6">

                  {/* Teacher Profile */}
                  <div className="flex items-center gap-4 min-w-[200px]">

                    <div className="relative">

                      <img
                        src={
                          teacher.avatar ||
                          "https://ui-avatars.com/api/?name=" +
                            teacher.fullname
                        }
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />

                      <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-full text-white">

                        <User size={10} />

                      </div>

                    </div>

                    <div>

                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Instructor
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        {teacher.fullname ||
                          "Unknown"}
                      </p>

                    </div>

                  </div>

                  {/* Assignment Info */}
                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-1">

                      <h3 className="text-lg font-bold text-slate-800">
                        {assignment?.title}
                      </h3>

                      {isSubmitted && (

                        <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">

                          <CheckCircle
                            size={12}
                          />

                          Completed

                        </span>

                      )}

                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">

                      {
                        assignment?.description
                      }

                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-medium">

                      <div className="flex items-center gap-1.5 text-slate-500">

                        <FileText size={14} />

                        {
                          assignment?.fileType
                        }{" "}
                        (
                        {
                          assignment?.maxSize
                        }
                        MB)

                      </div>

                      <div
                        className={`flex items-center gap-1.5 ${
                          isSubmitted
                            ? "text-slate-400"
                            : "text-red-500"
                        }`}
                      >

                        <Clock size={14} />

                        Due:{" "}

                        {new Date(
                          assignment?.deadline
                        ).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric"
                          }
                        )}

                      </div>

                    </div>

                  </div>

                  {/* Action Area */}
                  <div className="md:border-l pl-0 md:pl-6 flex flex-col justify-center min-w-[240px]">

                    {!isSubmitted ? (

                      <div className="space-y-3">

                        <label className="flex items-center justify-center w-full h-10 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-400 focus:outline-none">

                          <span className="flex items-center space-x-2">

                            <Upload
                              size={16}
                              className="text-gray-600"
                            />

                            <span className="text-xs font-medium text-gray-600">

                              {selectedFile[
                                assignment?._id
                              ]?.name ? (

                                <span className="text-blue-600 truncate max-w-[120px]">

                                  {
                                    selectedFile[
                                      assignment
                                        ._id
                                    ].name
                                  }

                                </span>

                              ) : (

                                "Choose File"

                              )}

                            </span>

                          </span>

                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              setSelectedFile({
                                ...selectedFile,
                                [assignment._id]:
                                  e.target
                                    .files[0],
                              })
                            }
                          />

                        </label>

                        <button
                          disabled={
                            isSubmitting ===
                            assignment?._id
                          }
                          onClick={() =>
                            handleSubmit(
                              assignment?._id
                            )
                          }
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                        >

                          {isSubmitting ===
                          assignment?._id
                            ? "Uploading..."
                            : "Turn In Assignment"}

                        </button>

                      </div>

                    ) : (

                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">

                        <p className="text-green-700 text-sm font-medium">
                          Well done! ✨
                        </p>

                        <p className="text-[11px] text-green-600">
                          Submission received
                        </p>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            );
          })}

        </div>

        {/* EMPTY STATE */}
        {notifications.length === 0 && (

          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">

            <p className="text-slate-400">
              No assignments found at the
              moment.
            </p>

          </div>

        )}

      </div>

    </div>

  );
};

export default StudentPanel;