import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { 
  getStudentsAPI, 
  toggleUserBanAPI, 
  verifyUserAPI, 
  toggleUserStatusAPI // <--- Import the status toggle API
} from "../../services/api";

// Icons
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { 
  FiSearch, 
  FiShieldOff, 
  FiShield, 
  FiCheckCircle, 
  FiPower // <--- Added Power Icon
} from "react-icons/fi";
import { PiStudentBold } from "react-icons/pi";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getStudentsAPI();
      setStudents(res.data.data || []);
    } catch (error) {
      console.error(error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.includes(searchTerm)
  );

  // Toggle Account Status (Active/Deactivate)
  const toggleStatus = async (student) => {
    const isDeactivating = student.accountStatus === "active";
    const action = isDeactivating ? "Deactivate" : "Activate";

    const result = await Swal.fire({
      title: `<span class="text-xl">${action} Account?</span>`,
      text: `Are you sure you want to ${action.toLowerCase()} ${student.fullname}'s access?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: isDeactivating ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: `Yes, ${action}!`,
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        await toggleUserStatusAPI(student._id);
        Swal.fire({
          title: "Updated!",
          text: `Account is now ${isDeactivating ? 'inactive' : 'active'}.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        fetchStudents();
      } catch (error) {
        Swal.fire("Error", "Failed to update account status", "error");
      }
    }
  };

  const handleVerify = async (student) => {
    if (student.isVerified) return;
    const result = await Swal.fire({
      title: "Verify Student?",
      text: `Confirming identity for ${student.fullname}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Verify!",
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        await verifyUserAPI(student._id);
        Swal.fire({
          title: "Verified!",
          text: "Student account has been marked as verified.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        fetchStudents();
      } catch (error) {
        Swal.fire("Error", "Verification failed", "error");
      }
    }
  };

  const toggleBan = async (student) => {
    const action = student.isBanned ? "Unban" : "Ban";
    const result = await Swal.fire({
      title: `<span class="text-xl">${action} Account?</span>`,
      text: `Are you sure you want to ${action.toLowerCase()} ${student.fullname}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: student.isBanned ? "#10b981" : "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: `Yes, ${action}!`,
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        await toggleUserBanAPI(student._id);
        fetchStudents();
      } catch (error) {
        Swal.fire("Error", "Action failed", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-9 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <PiStudentBold className="text-indigo-600" size={32} /> Student Directory
          </h1>
          <p className="text-slate-500 text-sm">Manage verification and access control.</p>
        </div>

        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or roll..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse font-bold">Loading directory...</div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-5">Student Details</th>
                  <th className="px-6 py-5">Verification</th>
                  <th className="px-6 py-5">Account Life</th>
                  <th className="px-6 py-5">Ban Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <img src={s.avatar} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100" alt="" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{s.fullname}</p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">{s.rollNumber}</p>
                        </div>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                        s.isVerified 
                        ? "bg-blue-50 border-blue-100 text-blue-600" 
                        : "bg-amber-50 border-amber-100 text-amber-600"
                      }`}>
                        {s.isVerified ? <HiOutlineBadgeCheck size={14}/> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {s.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </td>

                    {/* NEW: Active/Inactive Status */}
                    <td className="px-6 py-4">
                      <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${s.accountStatus === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${s.accountStatus === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-300'}`} />
                        {s.accountStatus}
                      </div>
                    </td>

                    {/* Ban Status */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${s.isBanned ? 'text-rose-500' : 'text-slate-400'}`}>
                        {s.isBanned ? 'Banned' : 'Clear'}
                      </span>
                    </td>

                    <td className="px-8 py-4 text-right space-x-2">
                      {/* 1. Toggle Active/Deactivate Button */}
                      <button
                        onClick={() => toggleStatus(s)}
                        className={`p-2.5 rounded-xl transition-all ${
                          s.accountStatus === 'active' 
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white" 
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                        }`}
                        title={s.accountStatus === 'active' ? "Deactivate Account" : "Activate Account"}
                      >
                        <FiPower size={18} />
                      </button>

                      {/* 2. Verify Button */}
                      {!s.isVerified && (
                        <button
                          onClick={() => handleVerify(s)}
                          className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                          title="Verify User"
                        >
                          <FiCheckCircle size={18} />
                        </button>
                      )}

                      {/* 3. Ban/Unban Button */}
                      <button
                        onClick={() => toggleBan(s)}
                        className={`p-2.5 rounded-xl transition-all ${
                          s.isBanned 
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" 
                          : "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
                        }`}
                        title={s.isBanned ? "Unban" : "Ban"}
                      >
                        {s.isBanned ? <FiShield size={18} /> : <FiShieldOff size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}