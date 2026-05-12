import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "lucide-react";

import Login from "./page/Login/Login.jsx";
import Register from "./page/Register/Register.jsx";
import Dashboard from "./page/Dashboard/Dashboard.jsx";
import Profile from "./page/UserProfile/Profile.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import UpdateAccount from "./page/update/updateAccount.jsx";
import UpdatePassword from "./page/update/UpdatePassword.jsx";

// ✅ Admin imports
import AdminPanel from "./page/Admin/AdminPanel.jsx"; // ⭐ NEW
import AdminDashboard from "./page/Admin/Dashboard.jsx";
import ActivityLogs from "./page/Admin/ActivityLogs.jsx";
import Teachers from "./page/Admin/Teachers.jsx";
import Students from "./page/Admin/Students.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";

// Container
const PageContainer = ({ children }) => (
  <div className="animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {children}
  </div>
);

function AppContent() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans antialiased">
      
      <Navbar />

      <main className="pt-16">
        <Routes>

          {/* Home */}
          <Route path="/" element={
            <PageContainer>
              <div className="flex flex-col items-center justify-center text-center mt-20 space-y-6">
                <div className="bg-indigo-100 p-3 rounded-2xl mb-4">
                  <Home className="w-10 h-10 text-indigo-600" />
                </div>

                <h1 className="text-5xl font-black">
                  Manage your content <br />
                  <span className="text-indigo-600">with precision.</span>
                </h1>

                <p className="max-w-2xl text-lg text-slate-500">
                  A secure, streamlined platform for modern workflows.
                </p>
              </div>
            </PageContainer>
          } />

          {/* Auth */}
          <Route path="/login" element={
            <PublicRoute>
              <PageContainer><Login /></PageContainer>
            </PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute>
              <PageContainer><Register /></PageContainer>
            </PublicRoute>
          } />

          {/* User Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PageContainer><Dashboard /></PageContainer>
            </ProtectedRoute>
          } />

          <Route path="/getProfile" element={
            <ProtectedRoute>
              <PageContainer><Profile /></PageContainer>
            </ProtectedRoute>
          } />

          <Route path="/update-account" element={
            <ProtectedRoute>
              <PageContainer><UpdateAccount /></PageContainer>
            </ProtectedRoute>
          } />

          <Route path="/update-password" element={
            <ProtectedRoute>
              <PageContainer><UpdatePassword /></PageContainer>
            </ProtectedRoute>
          } />

          {/* ================= ADMIN ROUTES (UPDATED) ================= */}

          <Route path="/admin" element={
            <AdminRoute>
              <PageContainer>
                <AdminPanel />   {/* ⭐ Layout with sidebar */}
              </PageContainer>
            </AdminRoute>
          }>

            {/* Nested routes */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="students" element={<Students />} />

          </Route>

        </Routes>
      </main>

      <footer className="border-t py-8 mt-20 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} YourSaaS Inc.
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;