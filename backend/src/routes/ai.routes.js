import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getChatHistory,
  deleteChatHistory,
} from "../controllers/aiController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.post("/chat", sendMessage);
router.get("/chat/history", getChatHistory);
router.delete("/chat/history", deleteChatHistory);

export default router;



