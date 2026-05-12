import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getTeachersAPI, toggleUserBanAPI, verifyUserAPI } from "../../services/api"; // ✅ Added verifyUserAPI

// Modern Icons
import { HiOutlineMail, HiOutlineIdentification, HiOutlineCheckCircle } from "react-icons/hi";
import { FiUser, FiSlash, FiCheck, FiShield } from "react-icons/fi"; // ✅ Added FiShield
import { MdOutlinePersonSearch } from "react-icons/md";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await getTeachersAPI();
      setTeachers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ New Verify Function
  const handleVerify = async (teacher) => {
    const result = await Swal.fire({
      title: `<span class="text-2xl font-bold">Verify Faculty?</span>`,
      text: `Confirming ${teacher.fullname} will allow them to access the portal.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Verify Account",
      borderRadius: "20px"
    });

    if (result.isConfirmed) {
      try {
        await verifyUserAPI(teacher._id);
        Swal.fire({
          title: "Account Verified",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchTeachers();
      } catch (error) {
        Swal.fire("Error", error.response?.data?.message || "Verification failed", "error");
      }
    }
  };

  const toggleBan = async (teacher) => {
    const action = teacher.isBanned ? "Unban" : "Ban";
    
    const result = await Swal.fire({
      title: `<span class="text-2xl font-bold">${action} User?</span>`,
      text: `Are you sure you want to ${action.toLowerCase()} ${teacher.fullname}?`,
      icon: teacher.isBanned ? "info" : "warning",
      showCancelButton: true,
      confirmButtonColor: teacher.isBanned ? "#10b981" : "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${action}!`,
      borderRadius: "20px"
    });

    if (result.isConfirmed) {
      try {
        await toggleUserBanAPI(teacher._id);
        Swal.fire({
          title: "Success",
          text: `Teacher has been ${action.toLowerCase()}ed.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchTeachers();
      } catch (error) {
        Swal.fire("Error", "Action failed. Please try again.", "error");
      }
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Loading faculty data...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <MdOutlinePersonSearch className="text-indigo-600" /> Faculty Management
        </h1>
        <p className="text-slate-500 mt-1">Manage teacher accounts, verification status, and access control.</p>
      </div>

      {teachers.length === 0 ? (
        <div className="bg-white p-20 rounded-[2rem] text-center border border-dashed border-slate-300">
            <FiUser className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No teachers found in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((t) => (
            <div 
              key={t._id} 
              className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative"
            >
              {/* Card Header/Banner Area */}
              <div className={`h-24 ${t.isBanned ? 'bg-slate-100' : 'bg-indigo-600'}`}></div>
              
              <div className="px-6 pb-6 text-center -mt-12">
                {/* Avatar */}
                <div className="relative inline-block">
                  <img
                    src={t.avatar || "https://ui-avatars.com/api/?name=User"}
                    alt="avatar"
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md mx-auto"
                  />
                  {t.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <HiOutlineCheckCircle className="text-blue-500" size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{t.fullname}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mt-1">{t.role}</p>
                </div>

                <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl mb-6">
                  <div className="flex items-center gap-3 text-slate-600">
                    <HiOutlineMail className="text-slate-400" />
                    <span className="text-xs font-medium truncate">{t.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <HiOutlineIdentification className="text-slate-400" />
                    <span className="text-xs font-medium uppercase tracking-tighter">Id No: {t.rollNumber}</span>
                  </div>
                </div>

                {/* ✅ Combined Action Buttons */}
                <div className="flex flex-col gap-2">
                  {!t.isVerified && (
                    <button
                      onClick={() => handleVerify(t)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      <FiShield /> Verify Account
                    </button>
                  )}

                  <button
                    onClick={() => toggleBan(t)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                      t.isBanned 
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                      : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                    }`}
                  >
                    {t.isBanned ? (
                      <><FiCheck /> Lift Suspension</>
                    ) : (
                      <><FiSlash /> Restrict Access</>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Badge Overlay */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${
                    t.isBanned ? 'bg-rose-500 text-white' : 'bg-white/20 text-white backdrop-blur-md border border-white/30'
                }`}>
                    {t.isBanned ? 'Banned' : 'Active'}
                </span>
                {!t.isVerified && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm">
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}