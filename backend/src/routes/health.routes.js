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

// All routes require authentication
router.use(verifyToken);

router.post("/", createHealthRecord);
router.get("/pet/:petId", getHealthRecords);
router.get("/pet/:petId/weight", getWeightHistory);
router.get("/pet/:petId/vaccination", getVaccinationHistory);
router.put("/:recordId", updateHealthRecord);
router.delete("/:recordId", deleteHealthRecord);

export default router;

