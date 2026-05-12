import React, { useState } from "react";
import { updatePassword } from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import { FiLock, FiArrowLeft, FiCheck, FiAlertCircle } from "react-icons/fi";
import { RiLoader4Line } from "react-icons/ri";

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    oldpassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // ✅ check password match
    if (formData.newPassword !== formData.confirmPassword) {
      return setStatus({ type: "error", message: "Passwords do not match ❌" });
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await updatePassword({
        oldpassword: formData.oldpassword,
        newPassword: formData.newPassword,
      });

      setStatus({ type: "success", message: "Password updated successfully ✅" });

      setTimeout(() => navigate("/getProfile"), 1500);
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.response?.data?.message || "Update failed ❌",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-[450px]">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/getProfile")}
            className="p-2 bg-white rounded-full border"
          >
            <FiArrowLeft />
          </button>
          <h1 className="text-lg font-bold">Update Password</h1>
          <div className="w-8"></div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow">

          <form onSubmit={handleUpdate} className="space-y-5">

            {/* Old Password */}
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="oldpassword"
                placeholder="Old Password"
                value={formData.oldpassword}
                onChange={handleChange}
                required
                className="w-full pl-10 py-3 border rounded-xl"
              />
            </div>

            {/* New Password */}
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 py-3 border rounded-xl"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 py-3 border rounded-xl"
              />
            </div>

            {/* Status */}
            {status.message && (
              <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                status.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                {status.type === "success" ? <FiCheck /> : <FiAlertCircle />}
                {status.message}
              </div>
            )}

            {/* Button */}
            <button
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl flex justify-center items-center"
            >
              {loading ? <RiLoader4Line className="animate-spin" /> : "Update Password"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;