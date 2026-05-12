import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // wait until user loads
  if (loading) return <p>Loading...</p>;

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // not admin
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;