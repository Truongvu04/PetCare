import axios from "axios";

// BASE_URL: Thay đổi port nếu backend của bạn khác 5000
const BASE_URL = "http://localhost:5000/api/v1/vendor";

const VENDOR_API = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Interceptor: Tự động gắn Token
VENDOR_API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("vendorToken"); // Đọc từ localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Gắn Header
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Auth & Profile ---
export const apiRegisterVendor = (data) => VENDOR_API.post("/register", data);
export const apiLoginVendor = (data) => VENDOR_API.post("/login", data);
export const apiGetVendorProfile = () => VENDOR_API.get("/profile");
export const apiUpdateVendorProfile = (data) => VENDOR_API.put("/profile", data);
export const apiGetAccountInfo = () => VENDOR_API.get("/account"); // Thêm cho AccountSettings
export const apiUpdateAccountInfo = (data) => VENDOR_API.put("/account", data); // Thêm cho AccountSettings

// --- Products ---
export const apiGetVendorProducts = () => VENDOR_API.get("/products");
export const apiAddProduct = (data) => VENDOR_API.post("/products", data);
export const apiUpdateProduct = (id, data) => VENDOR_API.put(`/products/${id}`, data);
export const apiDeleteProduct = (id) => VENDOR_API.delete(`/products/${id}`);

// --- Coupons ---
export const apiGetVendorCoupons = () => VENDOR_API.get("/coupons");
export const apiCreateCoupon = (data) => VENDOR_API.post("/coupons", data);
export const apiUpdateCoupon = (id, data) => VENDOR_API.put(`/coupons/${id}`, data); // Thêm cho CouponManagement
export const apiDeleteCoupon = (id) => VENDOR_API.delete(`/coupons/${id}`);

// --- Orders ---
export const apiGetVendorOrders = () => VENDOR_API.get("/orders");
export const apiUpdateOrderStatus = (id, status) => VENDOR_API.put(`/orders/${id}/status`, { status });

// --- Dashboard & Analytics ---
export const apiGetDashboardStats = () => VENDOR_API.get("/dashboard/stats");
export const apiGetTopProducts = () => VENDOR_API.get("/dashboard/top-products"); // Thêm API này
export const apiGetNotifications = () => VENDOR_API.get("/notifications"); // Thêm API này
// [MỚI] API lấy dữ liệu cho biểu đồ (Trả về mảng: [{date: '19/11', revenue: 500000}, ...])
export const apiGetRevenueChart = () => VENDOR_API.get("/dashboard/revenue-chart");

// --- Account Security ---
export const apiUpdatePassword = (data) => VENDOR_API.put("/account/password", data);

export default VENDOR_API;