import React, { useEffect, useState } from "react";
import { getMyAssignments, getSubmissions, downloadZip } from "../../services/api.js";
import { Download, Users, ExternalLink, Calendar, Filter, ChevronDown, FileIcon } from "lucide-react";

const ViewSubmissions = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await getMyAssignments();
      setAssignments(res.data.data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await getSubmissions(selectedId);
      setSubmissions(res.data.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!selectedId) return;
    try {
      const res = await downloadZip(selectedId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `submissions_${selectedId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
            Assignment Source
          </label>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none text-gray-700"
            >
              <option value="">Select an assignment to review...</option>
              {assignments.map((a) => (
                <option key={a._id} value={a._id}>{a.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={fetchSubmissions}
            disabled={!selectedId || loading}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            <Users size={16} />
            {loading ? "Fetching..." : "View Results"}
          </button>
          
          <button
            onClick={handleDownloadZip}
            disabled={!selectedId}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30 shadow-sm"
            title="Download all as ZIP"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {submissions.length === 0 ? (
          <div className="py-24 text-center">
            <div className="bg-indigo-50 text-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileIcon size={32} />
            </div>
            <h3 className="text-gray-900 font-semibold">No Submissions Yet</h3>
            <p className="text-gray-500 text-sm mt-1">Select an assignment to see student progress.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Roll Number</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={sub.student.avatar} 
                        alt={sub.student.fullname}
                        className="h-10 w-10 rounded-full object-cover border border-gray-100 shadow-sm bg-gray-200"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${sub.student.fullname}&background=6366f1&color=fff`; }}
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{sub.student.fullname}</p>
                        <p className="text-[11px] text-indigo-500 font-medium">Verified Student</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 tracking-tighter">
                    {sub.student.rollNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-5">
                        at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      Review File
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewSubmissions;