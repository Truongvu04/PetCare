import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getProductRecommendations,
  getServiceRecommendations,
} from "../controllers/recommendationController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get("/products", getProductRecommendations);
router.get("/services", getServiceRecommendations);

export default router;


