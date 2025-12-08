import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
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
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu. Vui lòng đợi một chút trước khi thử lại.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user?.user_id) {
      return req.user.user_id.toString();
    }
    return ipKeyGenerator(req);
  },
});

router.post("/chat", aiChatRateLimiter, sendMessage);
router.get("/chat/history", getChatHistory);
router.delete("/chat/history", deleteChatHistory);

export default router;

