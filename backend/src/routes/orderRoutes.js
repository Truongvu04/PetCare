import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isVendor } from "../middleware/checkRole.js";
import {
  createOrder,
  getCustomerOrders,
  getVendorOrders,
  updateOrderStatus,
  cancelOrder,
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

// Move cancel route to top to avoid any potential shadowing
router.patch("/:id/cancel", verifyToken, cancelOrder);

router.post("/", verifyToken, createOrder);

router.get("/my-orders", verifyToken, getCustomerOrders);

router.get("/vendor-orders", verifyToken, isVendor, getVendorOrders);

router.patch("/:id/status", verifyToken, isVendor, updateOrderStatus);

export default router;

