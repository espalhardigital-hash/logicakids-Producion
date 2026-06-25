import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const [showRescueBtn, setShowRescueBtn] = useState(false);
  const token = localStorage.getItem("logicakids_token"); // Simplificado para que compile directo

  useEffect(() => {
    let timer = setTimeout(() => setShowRescueBtn(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleResetUrl = () => { localStorage.removeItem("logicakids_api_url"); window.location.reload(); };

  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
};