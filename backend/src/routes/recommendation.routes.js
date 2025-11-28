import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getRecommendations,
  getProductRecommendations,
  getServiceRecommendations,
} from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/", verifyToken, getRecommendations);
router.get("/products", verifyToken, getProductRecommendations);
router.get("/services", verifyToken, getServiceRecommendations);

export default router;

