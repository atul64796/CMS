import { NavLink, Outlet } from "react-router-dom";
import { 
  HiOutlineViewGrid, 
  HiOutlineClipboardList, 
  HiOutlineUserGroup, 
  HiOutlineAcademicCap,
  HiOutlineLogout
} from "react-icons/hi";
import { RiShieldUserLine } from "react-icons/ri";

export default function AdminPanel() {
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <HiOutlineViewGrid size={22} /> },
    { name: "Activity Logs", path: "/admin/logs", icon: <HiOutlineClipboardList size={22} /> },
    { name: "Teachers", path: "/admin/teachers", icon: <HiOutlineUserGroup size={22} /> },
    { name: "Students", path: "/admin/students", icon: <HiOutlineAcademicCap size={22} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      
      {/* 1. Fixed Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        
        {/* Brand Logo */}
        <div className="p-8 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
            <RiShieldUserLine className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tighter text-slate-900">
            ADMIN<span className="text-indigo-600">{" "}PANEL</span>
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-4">Main Menu</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200
                ${isActive 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <span className={({ isActive }) => isActive ? "text-indigo-600" : "text-slate-400"}>
                {item.icon}
              </span>
              {item.name}
            </NavLink>
          ))}
        </nav>

       
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Optional: Inner Top Header for page titles or Breadcrumbs */}
        <header className="h-16 bg-white/50 backdrop-blur-sm border-b border-slate-100 flex items-center justify-end px-8">
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Server Status:</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Operational
                </span>
            </div>
        </header>

        {/* The "Stage" where Outlet renders */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}