import { useEffect, useState } from "react";
import { 
  getAdminProfile, 
  getActivityLogsAPI, 
  getTeachersAPI, 
  getStudentsAPI 
} from "../../services/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, CartesianGrid
} from 'recharts';

// Icons
import { HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineLockClosed, HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineDotsVertical } from "react-icons/hi";
import { FiActivity, FiTrendingUp } from "react-icons/fi";

export default function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    verifiedTeachers: 0,
    verifiedStudents: 0,
    banned: 0,
    logs: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, teachersRes, studentsRes, logsRes] = await Promise.all([
        getAdminProfile(),
        getTeachersAPI(),
        getStudentsAPI(),
        getActivityLogsAPI()
      ]);

      const teacherList = teachersRes.data?.data || [];
      const studentList = studentsRes.data?.data || [];
      const logsList = logsRes.data?.data || [];
      
      const vTeachers = teacherList.filter(t => t.isVerified).length;
      const vStudents = studentList.filter(s => s.isVerified).length;
      const totalBanned = [...teacherList, ...studentList].filter(u => u.isBanned).length;

      setAdmin(profileRes.data?.data);
      setStats({
        teachers: teacherList.length,
        students: studentList.length,
        verifiedTeachers: vTeachers,
        verifiedStudents: vStudents,
        banned: totalBanned,
        logs: logsList,
        loading: false
      });
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const barData = [
    { name: 'Teachers', count: stats.teachers, color: '#4F46E5' },
    { name: 'Students', count: stats.students, color: '#0EA5E9' },
    { name: 'Banned', count: stats.banned, color: '#EF4444' },
  ];

  const pieData = [
    { name: 'Verified', value: stats.verifiedTeachers + stats.verifiedStudents, color: '#10B981' },
    { name: 'Pending', value: (stats.teachers + stats.students) - (stats.verifiedTeachers + stats.verifiedStudents), color: '#F59E0B' },
  ];

  if (stats.loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse">Synchronizing Data...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-4 lg:p-8 font-sans">
      
      {/* Top Navbar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg"><FiActivity className="text-white"/></div>
            Analytics Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time oversight </p>
        </div>

        
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Faculty" value={stats.teachers} icon={<HiOutlineUserGroup />} trend="+12%" color="indigo" />
        <StatCard label="Students" value={stats.students} icon={<HiOutlineAcademicCap />} trend="+18%" color="cyan" />
        <StatCard label="Verified" value={stats.verifiedTeachers + stats.verifiedStudents} icon={<HiOutlineShieldCheck />} trend="94%" color="emerald" />
        <StatCard label="Restricted" value={stats.banned} icon={<HiOutlineLockClosed />} trend="Low" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Growth Chart */}
        <div className="lg:col-span-8 bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">User Distribution</h3>
            <div className="px-3 py-1 bg-slate-700/50 rounded-md text-xs text-slate-300">Last 30 Days</div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                    cursor={{fill: '#1e293b'}} 
                    contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff'}} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={45}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Logs */}
        <div className="lg:col-span-4 bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <HiOutlineLightningBolt className="text-amber-400" /> Live Feed
          </h3>
          <div className="space-y-6">
            {stats.logs.slice(0, 5).map((log, idx) => (
              <div key={log._id} className="flex gap-4 relative">
                {idx !== 4 && <div className="absolute left-2.5 top-8 w-[1px] h-10 bg-slate-700"></div>}
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex-shrink-0 mt-1 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium truncate leading-tight">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors">
            VIEW ALL LOGS
          </button>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, trend }) {
    const colorMap = {
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl hover:border-slate-600 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-slate-700/50 ${color === 'rose' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {trend}
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}