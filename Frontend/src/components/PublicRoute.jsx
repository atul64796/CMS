import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {

  const user = JSON.parse(localStorage.getItem("user"));

  // if already logged in -> go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;