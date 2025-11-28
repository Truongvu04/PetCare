import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  sendChatMessage,
  getChatHistory,
  deleteChatHistory,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", verifyToken, sendChatMessage);
router.get("/chat/history", verifyToken, getChatHistory);
router.delete("/chat/history", verifyToken, deleteChatHistory);

export default router;

