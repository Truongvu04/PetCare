import express from "express";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getChatHistory,
  deleteChatHistory,
} from "../controllers/aiController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Rate limiting for AI chat endpoint
// Limit: 10 requests per 1 minute per user (to prevent quota exhaustion)
const aiChatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
  message: {
    success: false,
    message: "Quá nhiều yêu cầu. Vui lòng đợi một chút trước khi thử lại.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use user ID as key for per-user rate limiting
  keyGenerator: (req) => {
    return req.user?.user_id?.toString() || req.ip;
  },
});

router.post("/chat", aiChatRateLimiter, sendMessage);
router.get("/chat/history", getChatHistory);
router.delete("/chat/history", deleteChatHistory);

export default router;

