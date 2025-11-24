import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isVendor } from "../middleware/checkRole.js";
import {
  createAppointment,
  getCustomerAppointments,
  getVendorAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", verifyToken, createAppointment);

router.get("/my-appointments", verifyToken, getCustomerAppointments);

router.get("/vendor-appointments", verifyToken, isVendor, getVendorAppointments);

router.patch("/:id/status", verifyToken, isVendor, updateAppointmentStatus);

export default router;

