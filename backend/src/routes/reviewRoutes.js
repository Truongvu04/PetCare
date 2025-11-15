import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createReview,
  getProductReviews,
  getServiceReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", verifyToken, createReview);

router.get("/product/:productId", getProductReviews);

router.get("/service/:serviceId", getServiceReviews);

export default router;

