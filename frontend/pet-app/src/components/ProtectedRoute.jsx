import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1️⃣ Chờ auth load xong
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  // 2️⃣ Nếu chưa login → redirect /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Nếu đã login → render component con
  return children;
};

export default ProtectedRoute;
