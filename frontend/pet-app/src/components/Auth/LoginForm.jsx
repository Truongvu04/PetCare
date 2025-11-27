import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axiosConfig";
import confetti from "canvas-confetti";
import { showToast } from "../../utils/notifications";

// --- SVG ICONS ---
const EyeIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88M21 12c-1.27 4.06-5.07 7-9.54 7a9.94 9.94 0 01-7.13-3L3 12a9.94 9.94 0 017.13-3c4.47 0 8.27 2.94 9.54 7z" />
  </svg>
);
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.01c0-.78-.07-1.53-.2-2.27H12v4.51h6.24c-.28 1.45-1.17 2.68-2.48 3.55v2.92h3.76c2.2-2.02 3.48-5.01 3.48-8.71z" fill="#4285F4" />
    <path d="M12 22.58c3.24 0 5.95-1.08 7.93-2.92l-3.76-2.92c-1.04.7-2.38 1.11-4.17 1.11-3.2 0-5.9-2.16-6.88-5.11H1.52v3.01c2.18 4.31 6.83 7.33 10.48 7.33z" fill="#34A853" />
    <path d="M5.12 14.1c-.2-.7-.31-1.45-.31-2.26s.11-1.56.31-2.26V6.6H1.52A11.96 11.96 0 0 0 0 12c0 4.32 2.18 8.1 5.4 10.15l3.76-3.01c-.98-2.95-3.68-5.11-6.88-5.11z" fill="#FBBC04" />
    <path d="M12 4.14c1.78 0 3.32.61 4.56 1.79l3.36-3.36C18.01 1.7 15.22.42 12 .42c-3.65 0-8.3 3.02-10.48 7.33l3.76 3.01c.98-2.95 3.68-5.11 6.88-5.11z" fill="#EA4335" />
  </svg>
);
const FacebookIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
  </svg>
);

const inputClass =
  "w-full bg-gray-50 border border-transparent px-5 py-3 rounded-2xl text-sm transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none placeholder-gray-500";

function LoginForm({ onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // --- Real-time password validation ---
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    setPasswordError(
      !regex.test(value)
        ? "Password must have at least 6 chars, 1 uppercase, 1 special char"
        : ""
    );
  };

  // --- Send OTP ---
  const sendOTP = async () => {
    if (!email) return showToast("Enter email", "error");
    try {
      const res = await api.post("/auth/send-otp", { email });
      showToast(res.data.message || "OTP sent!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send OTP", "error");
    }
  };

  // --- Register ---
  const handleRegister = async () => {
    if (!fullName || !email || !password || !rePassword || !otp)
      return showToast("Please fill all fields!", "error");
    if (password !== rePassword) return showToast("Passwords do not match!", "error");
    if (passwordError) return showToast(passwordError, "error");

    setLoading(true);
    try {
      await api.post("/auth/register", { fullName, email, password });
      await api.post("/auth/verify-otp", { email, otp });
      showToast("Registration successful! Please login.", "success");
      confetti({ particleCount: 100, spread: 70 });
      setIsRegister(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Login ---  
  const handleLogin = async () => {
    if (!email || !password) return showToast("Please fill all fields!", "error");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      if (!token || !user) return showToast("Invalid server response", "error");

      // Save userInfo to localStorage immediately for VendorProtectedRouteWrapper fallback
      localStorage.setItem("userInfo", JSON.stringify(user));
      
      // Log role for debugging
      console.log("🔐 LoginForm: User role check:", {
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        hasVendor: !!user.vendor
      });
      
      login({ token, user });

      // Determine role-based welcome message
      const roleMessages = {
        vendor: "Vendor",
        admin: "Admin",
        owner: "Customer"
      };
      const roleLabel = roleMessages[user.role] || "Customer";
      
      // Use vendor store name if available, otherwise use full_name or email
      let displayName = user.vendor?.store_name || user.vendor?.shopName || user.full_name || user.email;
      
      // If full_name is "Admin" but role is vendor, use email or vendor store name instead
      if (user.role === 'vendor' && user.full_name?.toLowerCase() === 'admin') {
        displayName = user.vendor?.store_name || user.vendor?.shopName || user.email;
        console.log("⚠️ Full name is 'Admin' but role is vendor, using:", displayName);
      }
      
      // Show role-specific welcome message
      showToast(`Welcome back, ${displayName}! (${roleLabel})`, "success");
      confetti({ particleCount: 120, spread: 90 });

      // Auto-redirect to home page after successful login
      setTimeout(() => {
        if (onClose) onClose(); // Close modal if exists
        
        // Always redirect to home page regardless of role
        navigate("/");
      }, 1000); // Increased from 800ms to 1000ms to ensure AuthProvider state is updated
    } catch (err) {
      if (err.response?.status === 401) {
        showToast(err.response?.data?.message || "Invalid email or password", "error");
        setPassword("");
      } else {
        showToast(err.response?.data?.message || "Login failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isRegister ? handleRegister() : handleLogin();
  };

  // --- Close with animation ---
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 250);
  };

  // --- Auto detect ?token=... from Google/Facebook redirect ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      api
        .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          const user = res.data;
          localStorage.setItem("userInfo", JSON.stringify(user));
          
          // Log role for debugging
          console.log("🔐 LoginForm (OAuth): User role check:", {
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            hasVendor: !!user.vendor
          });
          
          login({ token, user });
          
          // Determine role-based welcome message
          const roleMessages = {
            vendor: "Vendor",
            admin: "Admin",
            owner: "Customer"
          };
          const roleLabel = roleMessages[user.role] || "Customer";
          
          // Use vendor store name if available, otherwise use full_name or email
          let displayName = user.vendor?.store_name || user.vendor?.shopName || user.full_name || user.email;
          
          // If full_name is "Admin" but role is vendor, use email or vendor store name instead
          if (user.role === 'vendor' && user.full_name?.toLowerCase() === 'admin') {
            displayName = user.vendor?.store_name || user.vendor?.shopName || user.email;
            console.log("⚠️ Full name is 'Admin' but role is vendor, using:", displayName);
          }
          
          // Show role-specific welcome message
          showToast(`Welcome back, ${displayName}! (${roleLabel})`, "success");
          confetti({ particleCount: 100, spread: 70 });
          
          // Auto-redirect to home page after successful login
          setTimeout(() => {
            // Always redirect to home page regardless of role
            navigate("/");
          }, 1000); // Increased from 800ms to 1000ms to ensure AuthProvider state is updated
        })
        .catch(() => showToast("Invalid Google login", "error"));
    }
  }, [login, navigate]);

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center bg-gray-900/60 backdrop-blur-md p-4 z-50 font-sans
        transition-all duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative transform transition-all duration-300
          ${isClosing ? "scale-90 opacity-0" : "scale-100 opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
          onClick={handleClose}>
          ✕
        </button>

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6 pt-2">
          <div className="text-3xl font-extrabold text-green-600 tracking-wide">
            PetCare+
          </div>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {isRegister ? "Create an account to get started." : "Welcome back! Sign in to continue."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-6 rounded-full bg-gray-100 shadow-inner">
          {["Login", "Register"].map((t, i) => (
            <button
              key={t}
              onClick={() => setIsRegister(i === 1)}
              className={`w-1/2 py-2 text-sm font-bold rounded-full transition-all ${
                (i === 0 && !isRegister) || (i === 1 && isRegister)
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:text-green-600"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              disabled={loading}
            />
          )}

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            disabled={loading}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className={`${inputClass} pr-12 ${passwordError && isRegister ? "border-red-400" : ""}`}
              disabled={loading}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-green-600"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
            {isRegister && passwordError && (
              <p className="text-xs text-red-500 mt-1 ml-1">{passwordError}</p>
            )}
          </div>

          {isRegister && (
            <>
              <div className="relative">
                <input
                  type={showRePassword ? "text" : "password"}
                  placeholder="Re-enter Password"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  disabled={loading}
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-green-600"
                  onClick={() => setShowRePassword(!showRePassword)}>
                  {showRePassword ? <EyeOffIcon /> : <EyeIcon />}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`${inputClass} flex-grow`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={sendOTP}
                  className="px-4 py-3 rounded-2xl text-sm font-bold bg-green-100 text-green-700 hover:bg-green-200"
                  disabled={loading}>
                  Send OTP
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            className={`bg-green-600 text-white py-3.5 rounded-2xl font-extrabold mt-4 text-lg hover:bg-green-700 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-500 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Social buttons */}
        <div className="flex justify-between gap-4">
          <a
            href="http://localhost:5000/auth/google"
            className="flex items-center justify-center w-1/2 gap-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-50">
            <GoogleIcon /> Google
          </a>
          <a
            href="http://localhost:5000/auth/facebook"
            className="flex items-center justify-center w-1/2 gap-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-50">
            <FacebookIcon /> Facebook
          </a>
        </div>

        <p className="text-center mt-6 text-sm">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <span
            className="text-green-600 font-semibold cursor-pointer hover:text-green-700"
            onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;