import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isVendor } from "../middleware/checkRole.js";
import {
  createService,
  updateService,
  getVendorServices,
  getAllServices,
  getServiceById,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", verifyToken, isVendor, createService);

router.get("/", getAllServices);

router.get("/my-services", verifyToken, isVendor, getVendorServices);

router.get("/:id", getServiceById);

router.put("/:id", verifyToken, isVendor, updateService);

router.delete("/:id", verifyToken, isVendor, deleteService);

export default router;

