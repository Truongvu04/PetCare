import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "./LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the URL user was trying to access before login
  const from = location.state?.from || "/";

  const handleClose = () => {
    // When user closes without logging in, always redirect to home page
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <LoginForm onClose={handleClose} redirectTo={from} />
      </div>
    </div>
  );
};

export default LoginPage;

