import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isVendor } from "../middleware/checkRole.js";
import {
  createOrder,
  getCustomerOrders,
  getVendorOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);

router.get("/my-orders", verifyToken, getCustomerOrders);

router.get("/vendor-orders", verifyToken, isVendor, getVendorOrders);

router.patch("/:id/status", verifyToken, isVendor, updateOrderStatus);

export default router;

