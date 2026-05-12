import React, { useEffect, useState } from "react";

import {
  getMyAssignments,
  deleteAssignment,
  updateAssignment,
} from "../../services/api.js";

import {
  Calendar,
  ChevronRight,
  Hash,
  Layers,
  Layout,
  Pencil,
  Trash2,
  FileText,
  Database,
} from "lucide-react";

const MyAssignments = ({ onSelect }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // UPDATE MODAL STATES
  const [showModal, setShowModal] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    fileType: "",
    maxSize: "",
  });

  // ================= FETCH ASSIGNMENTS =================
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await getMyAssignments();

      setAssignments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE ASSIGNMENT =================
  const handleDelete = async (assignmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assignment?",
    );

    if (!confirmDelete) return;

    try {
      await deleteAssignment(assignmentId);

      // remove deleted assignment from UI
      setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));

      alert("Assignment deleted successfully");
    } catch (error) {
      console.log(error);

      alert("Delete failed");
    }
  };

  // ================= OPEN UPDATE MODAL =================
  const openUpdateModal = (assignment) => {
    setSelectedAssignment(assignment);

    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      deadline: assignment.deadline?.split("T")[0] || "",
      fileType: assignment.fileType || "",
      maxSize: assignment.maxSize || "",
    });

    setShowModal(true);
  };

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= UPDATE ASSIGNMENT =================
  const handleUpdateAssignment = async () => {
    try {
      await updateAssignment(selectedAssignment._id, formData);

      // update UI instantly
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === selectedAssignment._id ? { ...a, ...formData } : a,
        ),
      );

      alert("Assignment updated successfully");

      setShowModal(false);
    } catch (error) {
      console.log(error);

      alert("Update failed");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Assignment Library
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage and track your published course materials.
          </p>
        </div>

        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
          <Layers size={14} />
          {assignments.length} Total
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        // EMPTY STATE
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Layout className="mx-auto text-gray-300 mb-4" size={40} />

          <p className="text-gray-500 font-medium">
            No assignments published yet.
          </p>
        </div>
      ) : (
        // ASSIGNMENT GRID
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="group relative bg-white border border-gray-200 p-6 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
            >
              {/* TOP */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <Hash size={18} />
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Deadline
                  </span>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                    <Calendar size={12} className="text-gray-400" />

                    {new Date(a.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* TITLE */}
              <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {a.title}
              </h3>

              {/* DESCRIPTION */}
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                <FileText size={16} className="mt-0.5 text-gray-400" />

                <p className="line-clamp-2">
                  {a.description || "No description added"}
                </p>
              </div>

              {/* FILE INFO */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
                  File Type: {a.fileType}
                </div>

                <div className="bg-green-50 text-green-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Database size={12} />
                  Max Size: {a.maxSize}
                </div>
              </div>

              {/* ID */}
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-6 bg-gray-50 w-fit px-2 py-1 rounded">
                ID: {a._id}
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2">
                {/* VIEW */}
                <button
                  onClick={() => onSelect(a._id)}
                  className="flex-1 flex items-center justify-between bg-gray-900 group-hover:bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all"
                >
                  View Submissions
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                {/* UPDATE */}
                <button
                  onClick={() => openUpdateModal(a)}
                  className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                >
                  <Pencil size={18} />
                </button>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(a._id)}
                  className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPDATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold  text-gray-900">
                Update Assignment
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter assignment title"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter assignment description"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* DEADLINE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* FILE TYPE */}
              {/* FILE TYPE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Type
                </label>

                <select
                  name="fileType"
                  value={formData.fileType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select File Type</option>

                  <option value="pdf">PDF</option>

                  <option value="doc">DOC</option>

                  <option value="docx">DOCX</option>

                  <option value="xls">XLS</option>
                </select>
              </div>

              {/* MAX SIZE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max File Size
                </label>

                <select
                  name="maxSize"
                  value={formData.maxSize}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select Max File Size</option>

                  <option value="1">1 MB</option>

                  <option value="2">2 MB</option>

                  <option value="5">5 MB</option>

                  <option value="10">10 MB</option>
                </select>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateAssignment}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all"
              >
                Update Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssignments;
