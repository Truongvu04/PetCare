import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Debug middleware to log all cart requests
router.use((req, res, next) => {
  console.log(`[CART] ${req.method} ${req.path}`);
  next();
});

// All cart routes require authentication
router.get("/", verifyToken, getCart);
router.post("/items", verifyToken, addToCart);
router.patch("/items/:itemId", verifyToken, updateCartItem);
router.delete("/items/:itemId", verifyToken, removeFromCart);
router.delete("/", verifyToken, clearCart);

console.log("✅ Cart routes defined");

export default router;

