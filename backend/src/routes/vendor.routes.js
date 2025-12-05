import express from 'express';
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { 
    registerVendor,
    loginVendor,
    requestVendorAccount,
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
    getAllVendors,
    seedData
} from '../controllers/vendorController.js';

// Middleware bảo vệ (đảm bảo đã đăng nhập mới được làm)
import { vendorAuth } from '../middleware/vendorAuthMiddleware.js';
import { verifyToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Multer configuration for image uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      crypto.randomBytes(4).toString("hex") +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpeg", ".jpg", ".png", ".webp", ".gif", ".jfif"];
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype.toLowerCase();

    const isValidExtension = allowedExtensions.includes(extname);
    // JFIF files typically have MIME type "image/jpeg" or "image/pjpeg", but we accept any image/* MIME type
    const isValidMimeType = mimetype.startsWith("image/");

    if (isValidExtension && isValidMimeType) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, WEBP, GIF, JFIF)"));
    }
  },
});

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.get('/list', getAllVendors); // Public endpoint for browsing vendors

// --- PROTECTED ROUTES (Phải có Token) ---

// User đăng ký làm vendor (cần đăng nhập nhưng chưa cần là vendor)
router.post('/request', verifyToken, requestVendorAccount);

// 1. Profile & Account
router.get('/profile', vendorAuth, getVendorProfile);
router.put('/profile', vendorAuth, updateVendorProfile);
router.put('/account/password', vendorAuth, updatePassword); // Đổi mật khẩu

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
    console.log("🔍 handleMulterError called, error:", err);
    if (err instanceof multer.MulterError) {
        console.error("❌ Multer error:", err.code, err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File quá lớn. Kích thước tối đa là 5MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Quá nhiều file. Tối đa 5 ảnh.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Trường file không hợp lệ. Sử dụng trường "images".' });
        }
        return res.status(400).json({ message: `Lỗi upload file: ${err.message}` });
    }
    if (err) {
        console.error("❌ Other error in handleMulterError:", err);
        return res.status(400).json({ message: err.message || 'Lỗi xử lý file upload' });
    }
    console.log("✅ handleMulterError: No error, calling next()");
    next();
};

// 2. Quản lý Sản phẩm (Products)
router.get('/products', vendorAuth, getVendorProducts); // Lấy danh sách
router.post('/products', vendorAuth, upload.array('images', 5), handleMulterError, createProduct);    // Thêm mới (supports up to 5 images)

// Middleware để log trước khi vào updateProduct
const logBeforeUpdate = (req, res, next) => {
    console.log("🔍 Route handler: PUT /products/:productId");
    console.log("🔍 Query params:", req.query);
    console.log("🔍 Body:", req.body);
    console.log("🔍 Files:", req.files);
    next();
};

router.put('/products/:productId', vendorAuth, upload.array('images', 5), handleMulterError, logBeforeUpdate, updateProduct); // Sửa (supports up to 5 images)
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