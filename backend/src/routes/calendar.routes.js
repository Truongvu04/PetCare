import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getCalendarEvents,
  getUpcomingExpenses,
  createCalendarEvent,
} from "../controllers/calendarController.js";

const router = express.Router();

router.get("/", verifyToken, getCalendarEvents);
router.get("/upcoming", verifyToken, getUpcomingExpenses);
router.post("/events", verifyToken, createCalendarEvent);

export default router;

