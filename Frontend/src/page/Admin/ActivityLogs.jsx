import { useEffect, useState, useMemo } from "react";
import { getActivityLogsAPI } from "../../services/api";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";

// Corrected Imports
import { HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineLockClosed } from "react-icons/hi";
import { FiActivity, FiUser, FiClock, FiShield } from "react-icons/fi";
import { MdOutlineHistory, MdOutlineDesktopWindows } from "react-icons/md";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getActivityLogsAPI();
      setLogs(res.data.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for the graph
  const chartData = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      const date = new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      counts[date] = (counts[date] || 0) + 1;
    });

    return Object.keys(counts).map((date) => ({
      date,
      count: counts[date],
    })).reverse(); // Assuming API returns newest first
  }, [logs]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading system logs...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 font-sans">
      
      {/* Header & Stats Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MdOutlineHistory className="text-indigo-600" size={28} /> Activity Audit Trail
          </h1>
          <p className="text-slate-500 text-sm">Monitoring real-time system events and user authentication</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Events</p>
                <p className="text-xl font-bold text-indigo-600">{logs.length}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Users</p>
                <p className="text-xl font-bold text-emerald-600">
                    {[...new Set(logs.map(l => l.userId?._id))].length}
                </p>
            </div>
        </div>
      </div>

      {/* Graph Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="flex items-center gap-2 mb-6">
            <FiActivity className="text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Traffic Overview</h3>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} dy={10} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b">User</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b">Action</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b">Details</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b">Network</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 italic">No logs found in the database.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                           <FiUser size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{log.userId?.fullname || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest border ${
                        log.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        log.action === 'LOGOUT' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                        {log.details}
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                            <MdOutlineDesktopWindows />
                            {log.ipAddress}
                        </div>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                       <div className="flex items-center gap-1">
                            <FiClock size={12} />
                            {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}