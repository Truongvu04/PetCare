import axios from "axios";
import { performCompleteLogout } from "../utils/logoutHelper.js";
  
// 👉 Tạo instance axios mặc định
const api = axios.create({
  baseURL: "http://localhost:5000/api", // ⚠️ sửa port nếu backend của bạn khác
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Tự động gắn token vào tất cả request nếu có trong localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚡ Xử lý lỗi token hết hạn / không hợp lệ
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isVendorRoute = window.location.pathname.startsWith('/vendor');
      const isAuthRoute = window.location.pathname.includes('/auth') || window.location.pathname === '/';
      
      // Don't auto-logout if we're on vendor route or auth route (might be temporary)
      if (!isVendorRoute && !isAuthRoute) {
        console.warn("⚠️ Token expired or unauthorized. Logging out...");
        performCompleteLogout();
      } else {
        console.warn("⚠️ 401 on vendor/auth route - not auto-logging out");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
