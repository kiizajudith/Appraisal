import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext"; // Adjust the import path as needed

const ProtectedRoutes = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;
