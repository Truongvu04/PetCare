import axios from "axios";
import { performCompleteLogout } from "../utils/logoutHelper.js";

// BASE_URL: Thay đổi port nếu backend của bạn khác 5000
const BASE_URL = "http://localhost:5000/api/v1/vendor";

export const VENDOR_API = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Interceptor: Tự động gắn Token (using unified user token)
VENDOR_API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // Use unified user token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Gắn Header
            console.log("📤 Vendor API Request:", config.method?.toUpperCase(), config.url, "Token:", token.substring(0, 20) + "...");
        } else {
            console.warn("⚠️ Vendor API Request without token:", config.method?.toUpperCase(), config.url);
        }
        
        // If data is FormData, let browser set Content-Type header automatically (includes boundary)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            console.log("📎 Sending FormData with files");
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor: Xử lý lỗi token hết hạn / không hợp lệ
VENDOR_API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || '';
            
            console.error("❌ Vendor API Error:", status, message);
            
            if (status === 401) {
                const isVendorRoute = window.location.pathname.startsWith('/vendor');
                if (isVendorRoute) {
                    // Check if we just logged in (token exists in localStorage)
                    const token = localStorage.getItem('token');
                    const userInfo = localStorage.getItem('userInfo');
                    
                    // If we have token and userInfo, this might be a temporary error
                    // Don't logout immediately - let the component handle it
                    if (token && userInfo) {
                        console.warn("⚠️ 401 error but token exists - might be temporary. Not logging out.");
                        // Don't logout - let the component retry or handle gracefully
                    } else {
                        // No token or userInfo, definitely need to logout
                    console.warn("⚠️ Token expired or unauthorized. Logging out...");
                    performCompleteLogout();
                    }
                }
            } else if (status === 403) {
                // 403 means user doesn't have vendor role - but check localStorage first
                const isVendorRoute = window.location.pathname.startsWith('/vendor');
                if (isVendorRoute) {
                    const userInfo = localStorage.getItem('userInfo');
                    let parsedUserInfo = null;
                    if (userInfo) {
                        try {
                            parsedUserInfo = JSON.parse(userInfo);
                        } catch (e) {
                            // Invalid JSON
                        }
                    }
                    
                    // Only redirect if userInfo confirms they're not a vendor
                    if (parsedUserInfo && parsedUserInfo.role !== 'vendor' && !parsedUserInfo.vendor) {
                        console.warn("⚠️ Access denied. User is not a vendor. Redirecting...");
                    window.location.href = '/';
                    } else {
                        console.warn("⚠️ 403 error but userInfo suggests vendor role. Might be temporary API issue.");
                        // Don't redirect - might be a temporary backend issue
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

// --- Auth & Profile ---
export const apiRegisterVendor = (data) => VENDOR_API.post("/register", data);
export const apiLoginVendor = (data) => VENDOR_API.post("/login", data);
// User đăng ký làm vendor (user đã tồn tại)
export const apiRequestVendorAccount = (data) => VENDOR_API.post("/request", data);
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