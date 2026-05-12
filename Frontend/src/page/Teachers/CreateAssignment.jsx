import React, { useState } from "react";
import { createAssignment } from "../../services/api.js";
import { Send, Calendar, FileText, HardDrive, Type, ChevronDown } from "lucide-react";

// ✅ Helper component moved outside to prevent focus loss during re-renders
const FormField = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
      <Icon size={13} strokeWidth={2.5} />
      {label}
    </label>
    <div className="relative group">{children}</div>
  </div>
);

const inputClasses = 
  "w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm";

const CreateAssignment = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    fileType: "",
    maxSize: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAssignment(form);
      alert("Assignment Created ✅");
      setForm({ title: "", description: "", deadline: "", fileType: "", maxSize: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Main Content Card */}
        <div className="grid gap-6">
          <FormField label="Title" icon={Type}>
            <input
              name="title"
              type="text"
              placeholder="e.g. Introduction to Quantum Physics"
              value={form.title}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </FormField>

          <FormField label="Assignment Details" icon={FileText}>
            <textarea
              name="description"
              rows="5"
              placeholder="Outline the submission requirements..."
              value={form.description}
              onChange={handleChange}
              className={`${inputClasses} resize-none`}
              required
            />
          </FormField>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormField label="Due Date" icon={Calendar}>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </FormField>

          <FormField label="Format" icon={FileText}>
            <div className="relative">
              <select
                name="fileType"
                value={form.fileType}
                onChange={handleChange}
                className={`${inputClasses} appearance-none pr-10`}
                required
              >
                <option value="">Any Format</option>
                <option value="pdf">PDF Document</option>
                <option value="doc">Word (DOCX)</option>
                <option value="xls">Excel Sheet</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </FormField>

          <FormField label="Max Size" icon={HardDrive}>
            <div className="relative">
              <select
                name="maxSize"
                value={form.maxSize}
                onChange={handleChange}
                className={`${inputClasses} appearance-none pr-10`}
                required
              >
                <option value="">No Limit</option>
                <option value="1">1 MB</option>
                <option value="5">5 MB</option>
                <option value="10">10 MB</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </FormField>
        </div>

        {/* Action Bar */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400 italic">
            * Assignment will be visible to all enrolled students.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-100 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Publish Assignment
                <Send size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssignment;