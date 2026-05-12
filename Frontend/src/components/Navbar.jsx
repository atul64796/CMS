import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logoutUser } from "../services/api.js";
import { useAuth } from "../context/AuthContext"; // ✅ added

import { 
  LayoutDashboard, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  ShieldCheck
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ get user from context (no localStorage here)
  const { user, setUser } = useAuth();

  const [open, setOpen] = useState(false);

  // ✅ only for closing dropdown
  useEffect(() => {
    const closeDropdown = () => setOpen(false);
    window.addEventListener("click", closeDropdown);

    return () => {
      window.removeEventListener("click", closeDropdown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("user"); // optional but fine
      setUser(null); // ✅ important for instant UI update
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-3 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CMS<span className="text-indigo-600">Portal</span>
            </span>
          </Link>

          {/* Navigation Links & Auth */}
          <div className="flex items-center gap-6">
            {!user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* Profile Trigger */}
                <button 
                  className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                  }}
                >
                  <div className="text-right hidden sm:block ">
                    <p className="text-sm font-bold text-slate-900 leading-none">
                      {user?.fullname}
                    </p>
                    <div className="flex justify-end gap-4">
                      <p className="text-xs text-slate-500 mt-1">
                        {user?.role?.toUpperCase()}
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        {user?.accountStatus}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <img
                      src={
                        user?.avatar || 
                        `https://ui-avatars.com/api/?name=${user?.fullname}`
                      }
                      alt="avatar"
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-50"
                    />
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  <ChevronDown 
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      open ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {open && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Account
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/dashboard")}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                        isActive('/dashboard')
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => navigate("/getProfile")}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                        isActive('/getProfile')
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile
                    </button>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;