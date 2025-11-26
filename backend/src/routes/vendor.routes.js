import express from 'express';
import { 
    registerVendor,
    loginVendor,
    getVendorProfile,
    updateVendorProfile,
    // Sản phẩm
    createProduct,
    getVendorProducts,
    updateProduct,
    deleteProduct,
    // Coupon
    createCoupon,
    getVendorCoupons,
    deleteCoupon,
    // Đơn hàng
    getVendorOrders,
    updateOrderStatus,
    // Dashboard & Khác
    getVendorDashboardStats,
    getRevenueChart,
    getTopProducts,
    getNotifications,
    updatePassword,
    seedData
} from '../controllers/vendorController.js';

// Middleware bảo vệ (đảm bảo đã đăng nhập mới được làm)
import { vendorAuth } from '../middleware/vendorAuthMiddleware.js'; 

const router = express.Router();

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
router.post('/register', registerVendor);
router.post('/login', loginVendor);

// --- PROTECTED ROUTES (Phải có Token) ---

// 1. Profile & Account
router.get('/profile', vendorAuth, getVendorProfile);
router.put('/profile', vendorAuth, updateVendorProfile);
router.put('/account/password', vendorAuth, updatePassword); // Đổi mật khẩu

// 2. Quản lý Sản phẩm (Products)
router.get('/products', vendorAuth, getVendorProducts); // Lấy danh sách
router.post('/products', vendorAuth, createProduct);    // Thêm mới
router.put('/products/:productId', vendorAuth, updateProduct); // Sửa
router.delete('/products/:productId', vendorAuth, deleteProduct); // Xóa

// 3. Quản lý Coupon
router.get('/coupons', vendorAuth, getVendorCoupons);
router.post('/coupons', vendorAuth, createCoupon);
router.delete('/coupons/:couponId', vendorAuth, deleteCoupon);

// 4. Quản lý Đơn hàng (Orders)
router.get('/orders', vendorAuth, getVendorOrders);
router.put('/orders/:orderId/status', vendorAuth, updateOrderStatus);

// 5. Dashboard & Analytics
router.get('/dashboard/stats', vendorAuth, getVendorDashboardStats);
router.get('/dashboard/revenue-chart', vendorAuth, getRevenueChart);
router.get('/dashboard/top-products', vendorAuth, getTopProducts);
router.get('/notifications', vendorAuth, getNotifications);

// 6. Seed Data (Tạo dữ liệu giả)
router.post('/seed-data', vendorAuth, seedData);

export default router;