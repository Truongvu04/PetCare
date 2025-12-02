import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getCalendarEvents,
  getUpcomingExpenses,
  createCalendarEvent,
} from "../controllers/calendarController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getCalendarEvents);
router.get("/upcoming", getUpcomingExpenses);
router.post("/events", createCalendarEvent);

export default router;





