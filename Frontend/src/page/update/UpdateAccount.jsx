import React, { useEffect, useState } from "react";
import { updateAccount, getUserProfile } from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // ✅ added

// React Icons
import { FiUser, FiMail, FiArrowLeft, FiCheck, FiAlertCircle } from "react-icons/fi";
import { RiLoader4Line } from "react-icons/ri";

const UpdateAccount = () => {
  const [formData, setFormData] = useState({ fullname: "", email: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const navigate = useNavigate();

  // ✅ get user from context
  const { user, setUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUserProfile();
        const userData = res.data.data;

        setFormData({
          fullname: userData.fullname || "",
          email: userData.email || "",
        });
      } catch (err) {
        setStatus({ type: "error", message: "Error loading data" });
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await updateAccount(formData);

      // ✅ update context + localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser)); // optional
      setUser(updatedUser); // 🔥 instant UI update

      setStatus({ type: "success", message: "Profile updated successfully" });

      setTimeout(() => navigate("/getProfile"), 1500);
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.response?.data?.message || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <RiLoader4Line className="animate-spin text-3xl text-indigo-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[450px]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/getProfile")}
            className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-indigo-600 transition-all hover:shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">
            Account Settings
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Edit Profile</h2>
            <p className="text-slate-500 text-sm mt-1">
              Change your public identity
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* Inputs */}
            <div className="space-y-4">
              <div className="relative group">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">
                  Display Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-indigo-500 outline-none"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-indigo-500 outline-none"
                    placeholder="Email"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            {status.message && (
              <div
                className={`flex items-center gap-2 text-sm font-medium p-4 rounded-2xl ${
                  status.type === "success"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {status.type === "success" ? <FiCheck /> : <FiAlertCircle />}
                {status.message}
              </div>
            )}

            {/* Button */}
            <button
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RiLoader4Line className="animate-spin text-xl" />
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-center text-slate-400 text-xs mt-8">
          Need help?{" "}
          <span className="text-indigo-500 cursor-pointer hover:underline">
            Contact Support
          </span>
        </p>
      </div>
    </div>
  );
};

export default UpdateAccount;