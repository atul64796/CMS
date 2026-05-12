import React, { useState } from "react";
import CreateAssignment from "./CreateAssignment";
import ViewSubmissions from "./ViewSubmissions";
import MyAssignments from "./MyAssignments";

const TeacherPanel = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedId, setSelectedId] = useState("");

  const tabs = [
    { id: "create", label: "Create New", icon: "➕" },
    { id: "list", label: "My Assignments", icon: "📚" },
    { id: "view", label: "Submissions", icon: "📁" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-700 tracking-tight">Welcome</h2>
          <p className="text-xs text-gray-400 uppercase font-semibold">Teacher Portal</p>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-gray-500 mt-1">College Assignment</p>
          </div>
          
          
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
          {activeTab === "create" && <CreateAssignment />}

          {activeTab === "list" && (
            <MyAssignments
              onSelect={(id) => {
                setSelectedId(id);
                setActiveTab("view");
              }}
            />
          )}

          {activeTab === "view" && (
            <ViewSubmissions assignmentId={selectedId} />
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherPanel;