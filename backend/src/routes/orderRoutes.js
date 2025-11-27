import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isVendor } from "../middleware/checkRole.js";
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
  cancelOrder,
  markOrderAsReceived,
} from "../controllers/orderController.js";

const router = express.Router();

console.log("✅ Order routes loaded");

// Router-level logger
router.use((req, res, next) => {
  console.log(`[Order Router] ${req.method} ${req.url}`);
  next();
});

router.get("/ping", (req, res) => {
  res.json({ message: "Order router is working" });
});

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Otherwise Express will match /:id first and never reach /:id/received or /:id/cancel

// Customer endpoint to mark order as received - MUST be before /:id route
router.patch("/:id/received", verifyToken, (req, res, next) => {
  console.log(`[ORDER ROUTES] PATCH /:id/received matched for order ${req.params.id}`);
  next();
}, markOrderAsReceived);

// Move cancel route to top to avoid any potential shadowing
router.patch("/:id/cancel", verifyToken, cancelOrder);

router.post("/", verifyToken, createOrder);

router.get("/my-orders", verifyToken, getCustomerOrders);

router.get("/vendor-orders", verifyToken, isVendor, getVendorOrders);

router.patch("/:id/status", verifyToken, isVendor, updateOrderStatus);

// This must be LAST as it matches any /:id
router.get("/:id", verifyToken, getOrderById);

export default router;

