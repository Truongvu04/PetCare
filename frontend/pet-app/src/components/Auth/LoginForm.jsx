import React, { useState, useEffect } from "react";
import axios from "axios";

// --- SVG Icons cho UX ---
const EyeIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274 4.057 5.064-7 9.542-7 1.487 0 2.937.288 4.316.825M21 12c-1.274 4.057-5.065 7-9.542 7-1.487 0-2.937-.288-4.316-.825" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c1.789 0 3.538.455 5.093 1.248M21 12c-1.274 4.057-5.065 7-9.542 7A9.954 9.954 0 016.907 16.752" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.01c0-.78-.07-1.53-.2-2.27H12v4.51h6.24c-.28 1.45-1.17 2.68-2.48 3.55v2.92h3.76c2.2-2.02 3.48-5.01 3.48-8.71z" fill="#4285F4" />
    <path d="M12 22.58c3.24 0 5.95-1.08 7.93-2.92l-3.76-2.92c-1.04.7-2.38 1.11-4.17 1.11-3.2 0-5.9-2.16-6.88-5.11H1.52v3.01c2.18 4.31 6.83 7.33 10.48 7.33z" fill="#34A853" />
    <path d="M5.12 14.1c-.2-.7-.31-1.45-.31-2.26s.11-1.56.31-2.26V6.6H1.52A11.96 11.96 0 0 0 0 12c0 4.32 2.18 8.1 5.4 10.15l3.76-3.01c-.98-2.95-3.68-5.11-6.88-5.11z" fill="#FBBC04" />
    <path d="M12 4.14c1.78 0 3.32.61 4.56 1.79l3.36-3.36C18.01 1.7 15.22.42 12 .42c-3.65 0-8.3 3.02-10.48 7.33l3.76 3.01c.98-2.95 3.68-5.11 6.88-5.11z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
  </svg>
);
// --- CSS chung cho Input ---
const inputClass = "w-full bg-gray-50 border border-transparent px-5 py-3 rounded-2xl text-sm transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none placeholder-gray-500";
// --- END ICONS & STYLES ---

function LoginForm({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  //const [isRegister, setIsRegister] = useState(true);


  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // --- Kiểm tra mật khẩu realtime ---
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    if (!regex.test(value)) {
      setPasswordError("Password must have at least 6 chars, 1 uppercase, 1 special char");
    } else {
      setPasswordError("");
    }
  };

  // --- Gửi OTP ---
  const sendOTP = async () => {
    if (!emailOrPhone) return alert("Enter email or phone");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: emailOrPhone,
      });
      setOtpSent(true);
      alert("OTP sent! Check your email.");
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  // --- Đăng ký ---
  const handleRegister = async () => {
    if (!fullName || !emailOrPhone || !password || !rePassword || !otp)
      return alert("Please fill all fields!");
    if (password !== rePassword) return alert("Passwords do not match!");
    if (passwordError) return alert(passwordError);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        fullName,
        email: emailOrPhone,
        password,
      });
      alert(res.data.message);

      const verifyRes = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email: emailOrPhone,
          otp,

        }
      );
      alert(verifyRes.data.message);

      // Chuyển sang màn hình Đăng nhập sau khi Đăng ký thành công (Đây là thay đổi nhỏ về UX)
      setIsRegister(false);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  // --- Đăng nhập ---
  const handleLogin = async () => {
    if (!emailOrPhone || !password) return alert("Please fill all fields!");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: emailOrPhone,
        password,
      });
      alert("Login success!");
      localStorage.setItem("token", res.data.token);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) handleRegister();
    else handleLogin();
  };

  // --- Tự động điền email nếu OAuth trả về query param ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    if (email) setEmailOrPhone(email);
  }, []);

  // Custom header
  const Header = () => (
    <div className="flex flex-col items-center mb-6 pt-2">
      <div className="text-3xl font-extrabold text-green-600 tracking-wide">PetCare+</div>
      <p className="text-sm text-gray-500 mt-1 text-center">
        {isRegister ? "Tạo tài khoản để bắt đầu." : "Chào mừng trở lại! Đăng nhập để tiếp tục."}
      </p>
    </div>
  );

  return (
    // Backdrop
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 font-sans">

      {/* Login Card */}
      <div className="bg-white p-7 sm:p-9 rounded-[2rem] w-full max-w-sm shadow-2xl relative transition-all duration-500 transform scale-100 shadow-gray-700/50">

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <Header />

        {/* --- TAB SWITCH: Nổi bật, bo tròn, chuyển màu xanh lá --- */}
        <div className="flex p-1 mb-6 rounded-full bg-gray-100 shadow-inner">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`w-1/2 py-2 text-sm font-bold transition-all duration-300 rounded-full ${!isRegister ? "bg-green-600 text-white shadow-md shadow-green-400/50" : "text-gray-600 hover:text-green-600"}`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`w-1/2 py-2 text-sm font-bold transition-all duration-300 rounded-full ${isRegister ? "bg-green-600 text-white shadow-md shadow-green-400/50" : "text-gray-600 hover:text-green-600"}`}
          >
            Đăng ký
          </button>
        </div>
        {/* --- END TAB SWITCH --- */}


        {/* Form Fields */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          )}
          <input
            type="text"
            placeholder="Email / Phone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className={inputClass}
          />

          {/* Password Field with Toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className={`${inputClass} pr-12 ${passwordError ? 'border-red-400 focus:border-red-500' : ''}`}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-green-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
            {isRegister && passwordError && (
              <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{passwordError}</p>
            )}
          </div>

          {isRegister && (
            <>
              {/* Re-enter Password Field with Toggle */}
              <div className="relative">
                <input
                  type={showRePassword ? "text" : "password"}
                  placeholder="Re-enter Password"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-green-600 transition-colors"
                  onClick={() => setShowRePassword(!showRePassword)}
                  aria-label="Toggle re-enter password visibility"
                >
                  {showRePassword ? <EyeOffIcon /> : <EyeIcon />}
                </span>
              </div>

              {/* OTP Input & Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`${inputClass} flex-grow`}
                />
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={!emailOrPhone}
                  className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all ${!emailOrPhone ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-100 text-green-700 hover:bg-green-200 shadow-sm"}`}
                >
                  Send OTP
                </button>
              </div>
            </>
          )}

          {/* Submit Button: Bo tròn lớn, nổi bật */}
          <button
            type="submit"
            className="bg-green-600 text-white py-3.5 rounded-2xl font-extrabold mt-4 text-lg hover:bg-green-700 transition transform hover:scale-[1.005] shadow-lg shadow-green-400/50"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">Or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Social Login Buttons: Bo tròn lớn, có shadow nhẹ */}
        <div className="flex justify-between gap-4">
          <a
            href="http://localhost:5000/auth/google"
            className="flex items-center justify-center w-1/2 gap-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-50 transition shadow-sm text-sm font-medium"
          >
            <GoogleIcon /> Google
          </a>
          <a
            href="http://localhost:5000/auth/facebook"
            className="flex items-center justify-center w-1/2 gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl hover:bg-gray-50 transition shadow-sm text-sm font-medium"
          >

            <FacebookIcon /> Facebook
          </a>
        </div>

        {/* Chuyển đổi trạng thái Đăng nhập/Đăng ký ở cuối form */}
        <p className="text-center mt-6 text-sm">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <span
            className="text-green-600 font-semibold cursor-pointer hover:text-green-700 transition-colors"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default LoginForm;
