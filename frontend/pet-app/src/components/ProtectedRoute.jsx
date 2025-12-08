import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1️⃣ Chờ auth load xong
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  // 2️⃣ Nếu chưa login → redirect /login với returnUrl để quay lại sau khi đăng nhập
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // 3️⃣ Nếu đã login → render component con
  return children;
};

export default ProtectedRoute;
