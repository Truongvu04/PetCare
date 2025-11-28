import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createHealthRecord,
  getHealthRecords,
  getWeightHistory,
  getVaccinationHistory,
  updateHealthRecord,
  deleteHealthRecord,
} from "../controllers/healthController.js";

const router = express.Router();

router.post("/", verifyToken, createHealthRecord);
router.get("/pet/:petId", verifyToken, getHealthRecords);
router.get("/pet/:petId/weight", verifyToken, getWeightHistory);
router.get("/pet/:petId/vaccination", verifyToken, getVaccinationHistory);
router.put("/:recordId", verifyToken, updateHealthRecord);
router.delete("/:recordId", verifyToken, deleteHealthRecord);

export default router;

