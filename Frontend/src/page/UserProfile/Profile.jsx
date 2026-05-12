import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { getUserProfile, updateAvatar } from '../../services/api'; 
import { useAuth } from "../../context/AuthContext"; // ✅ added

import { 
  Mail, 
  IdCard, 
  Lock, 
  UserCog,
  ChevronRight,
  Pencil,
  Sparkles,
  Loader2
} from "lucide-react";

const Profile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // ✅ get global user
  const { user, setUser } = useAuth();

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      setData(res.data.data);
    } catch (error) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await updateAvatar(formData);
      const newAvatarUrl = res.data.data.avatar;

      // ✅ update local UI
      setData({ ...data, avatar: newAvatarUrl });

      // ✅ update global auth state
      const updatedUser = { ...user, avatar: newAvatarUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser)); // optional
      setUser(updatedUser); // 🔥 instant navbar update

      alert("Avatar updated successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 font-sans antialiased">
      <div className="max-w-md mx-auto">
        
        <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] overflow-hidden">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-tr from-orange-500 to-red-900 overflow-hidden">
            <Sparkles className="absolute top-[-10px] right-[-10px] text-white/10 w-24 h-24 rotate-12" />
            
            <div className="relative flex items-center gap-5">
              <div className="relative group">
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden" 
                  accept="image/*"
                />
                
                <div className="relative h-20 w-20">
                  <img
                    src={data?.avatar || `https://ui-avatars.com/api/?name=${data?.fullname}`}
                    alt="avatar"
                    className={`h-20 w-20 rounded-2xl border-2 border-white/30 object-cover shadow-lg ${uploading ? 'opacity-40 grayscale' : ''}`}
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Loader2 className="animate-spin" size={24} />
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 bg-white text-indigo-600 p-1.5 rounded-lg shadow-md"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <div className="text-white">
                <h1 className="text-xl font-bold">{data?.fullname}</h1>
                <p className="text-xs mt-1">{data?.role}</p>
                <p className="text-xs text-green-400">{data?.accountStatus}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="space-y-3">
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail size={16} />
                <p>{data?.email}</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <IdCard size={16} />
                <p>{data?.rollNumber || "N/A"}</p>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              
              <NavLink to="/update-account" className="flex justify-between p-3 hover:bg-slate-50 rounded-xl">
                <div className="flex gap-2 items-center">
                  <UserCog size={16} />
                  <span>Edit Profile</span>
                </div>
                <ChevronRight size={16} />
              </NavLink>

              <NavLink to="/update-password" className="flex justify-between p-3 hover:bg-slate-50 rounded-xl">
                <div className="flex gap-2 items-center">
                  <Lock size={16} />
                  <span>Change Password</span>
                </div>
                <ChevronRight size={16} />
              </NavLink>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;