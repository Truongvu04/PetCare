import axios from "axios";

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
      console.warn("⚠️ Token expired or unauthorized. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
