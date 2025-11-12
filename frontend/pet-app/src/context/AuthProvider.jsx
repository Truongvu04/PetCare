import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext.js";
import Swal from "sweetalert2"; 
import 'animate.css';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // --- fetch user info từ backend ---
  const fetchUser = useCallback(async (authToken) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      if (!data?.user_id) throw new Error("Invalid user data");
      setUser(data);
      return data;
    } catch (err) {
      console.error("❌ Auth error:", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- kiểm tra token từ URL (Google/Facebook) ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (token) fetchUser(token);
    else setLoading(false);
  }, [token, fetchUser]);

  // --- login chuẩn, đồng bộ với backend ---
  const login = async ({ token: newToken, user: loginUser }) => {
    if (!newToken) return;
    localStorage.setItem("token", newToken);
    setToken(newToken);

    // fetch user thật từ backend để đảm bảo đồng bộ
    const fetchedUser = loginUser || await fetchUser(newToken);

    if (fetchedUser) {
      setUser(fetchedUser);

      // Toast + Confetti
      Swal.fire({
        title: `Welcome, ${fetchedUser.full_name || fetchedUser.email}!`,
        html: "<b>PetCare+</b> chào mừng bạn 💙",
        icon: "success",
        iconColor: "#4CAF50",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        color: "#333",
        showClass: { popup: 'animate__animated animate__zoomIn', icon: 'animate__animated animate__bounceIn' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' },
        willClose: () => { /* có thể trigger confetti library tại đây */ }
      });
    } else {
      // nếu login fail thì remove token
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);

    Swal.fire({
      title: "<strong>Đăng xuất thành công!</strong>",
      html: "Cảm ơn bạn đã sử dụng <b>PetCare+</b> 💙<br>Hẹn gặp lại!",
      icon: "success",
      iconColor: "#4CAF50",
      showConfirmButton: true,
      confirmButtonText: "Đóng",
      confirmButtonColor: "#1E88E5",
      background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
      color: "#333333",
      showClass: { popup: 'animate__animated animate__zoomIn', icon: 'animate__animated animate__bounceIn' },
      hideClass: { popup: 'animate__animated animate__fadeOutUp' },
      timer: 1000,
      timerProgressBar: true,
      customClass: { popup: 'shadow-lg rounded-xl border border-gray-200', confirmButton: 'hover:scale-105 transition-transform duration-200' }
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
