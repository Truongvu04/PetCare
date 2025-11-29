import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/checkRole.js";
import {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  getPendingProducts,
  approveProduct,
  getPendingVendors,
  approveVendor
} from "../controllers/adminController.js";

const router = express.Router();

// Tất cả routes đều cần verifyToken và isAdmin
router.use(verifyToken);
router.use(isAdmin);

// GET /api/admin/stats - Thống kê tổng quan
router.get("/stats", getAdminStats);

// GET /api/admin/users - Danh sách users với pagination
router.get("/users", getAllUsers);

// GET /api/admin/users/:id - Lấy thông tin chi tiết user
router.get("/users/:id", getUserById);

// PUT /api/admin/users/:id - Cập nhật thông tin user
router.put("/users/:id", updateUser);

// PUT /api/admin/users/:id/status - Khóa/mở khóa user
router.put("/users/:id/status", updateUserStatus);

// GET /api/admin/products/pending - Danh sách sản phẩm chờ duyệt
router.get("/products/pending", getPendingProducts);

// PUT /api/admin/products/:id/approval - Duyệt/từ chối sản phẩm
router.put("/products/:id/approval", approveProduct);

// GET /api/admin/vendors/pending - Danh sách vendor requests chờ duyệt
router.get("/vendors/pending", getPendingVendors);

// PUT /api/admin/vendors/:id/approval - Duyệt/từ chối vendor request
router.put("/vendors/:id/approval", approveVendor);

export default router;

