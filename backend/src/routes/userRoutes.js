// src/routes/userRoutes.js
import express from 'express';
import { userAuth } from '../middleware/userAuthMiddleware.js';
import { vendorAuth } from '../middleware/vendorAuthMiddleware.js';
import { requireRole } from '../middleware/roleAuthMiddleware.js';

const router = express.Router();

// 1. Tuyến đường chỉ dành cho User thông thường
router.get('/profile', userAuth, (req, res) => {
    // req.user có sẵn ở đây
    res.json({ message: "User Profile", user: req.user });
});

// 2. Tuyến đường chỉ dành cho Vendor
router.post('/products', vendorAuth, (req, res) => {
    // req.vendor có sẵn ở đây
    res.json({ message: "Vendor created product", vendor: req.vendor.id });
});

// 3. Tuyến đường chỉ dành cho Admin (Cần userAuth trước)
router.get('/admin/dashboard', userAuth, requireRole("ADMIN"), (req, res) => {
    // req.user có sẵn ở đây VÀ vai trò là ADMIN
    res.json({ message: "Admin Dashboard Access Granted", admin: req.user.id });
});

// Tuyến đường cho cả User & Admin (Chỉ cần xác thực là User)
router.get('/public-data', userAuth, (req, res) => {
    // Cả User và Admin đều vào được
    res.json({ message: "User or Admin can access", user: req.user.id });
});

export default router;