import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { prisma } from "../config/prisma.js";

const router = express.Router();

// Get notification preferences
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    let preferences = await prisma.notification_preferences.findUnique({
      where: { user_id },
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await prisma.notification_preferences.create({
        data: {
          user_id,
          appointment_reminders: true,
          community_events: true,
          platform_updates: true,
          new_products_services: true,
          urgent_care_alerts: true,
          account_activity_alerts: true,
        },
      });
    }

    res.json(preferences);
  } catch (err) {
    console.error("Error fetching notification preferences:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update notification preferences
router.put("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const {
      appointment_reminders,
      community_events,
      platform_updates,
      new_products_services,
      urgent_care_alerts,
      account_activity_alerts,
    } = req.body;

    console.log("📝 Updating notification preferences for user_id:", user_id);
    console.log("📝 Request body:", {
      appointment_reminders,
      community_events,
      platform_updates,
      new_products_services,
      urgent_care_alerts,
      account_activity_alerts,
    });

    // Check if preferences exist
    const existing = await prisma.notification_preferences.findUnique({
      where: { user_id },
    });

    console.log("📝 Existing preferences:", existing);

    let preferences;
    if (existing) {
      preferences = await prisma.notification_preferences.update({
        where: { user_id },
        data: {
          appointment_reminders:
            appointment_reminders !== undefined
              ? appointment_reminders
              : existing.appointment_reminders,
          community_events:
            community_events !== undefined
              ? community_events
              : existing.community_events,
          platform_updates:
            platform_updates !== undefined
              ? platform_updates
              : existing.platform_updates,
          new_products_services:
            new_products_services !== undefined
              ? new_products_services
              : existing.new_products_services,
          urgent_care_alerts:
            urgent_care_alerts !== undefined
              ? urgent_care_alerts
              : existing.urgent_care_alerts,
          account_activity_alerts:
            account_activity_alerts !== undefined
              ? account_activity_alerts
              : existing.account_activity_alerts,
        },
      });
    } else {
      preferences = await prisma.notification_preferences.create({
        data: {
          user_id,
          appointment_reminders:
            appointment_reminders !== undefined
              ? appointment_reminders
              : true,
          community_events:
            community_events !== undefined ? community_events : true,
          platform_updates:
            platform_updates !== undefined ? platform_updates : true,
          new_products_services:
            new_products_services !== undefined
              ? new_products_services
              : true,
          urgent_care_alerts:
            urgent_care_alerts !== undefined ? urgent_care_alerts : true,
          account_activity_alerts:
            account_activity_alerts !== undefined
              ? account_activity_alerts
              : true,
        },
      });
    }

    console.log("✅ Notification preferences updated successfully:", preferences);
    res.json({
      message: "Notification preferences updated successfully",
      preferences,
    });
  } catch (err) {
    console.error("Error updating notification preferences:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      meta: err.meta,
      stack: err.stack
    });
    
    // Provide more detailed error message
    let errorMessage = "Server error";
    if (err.code === 'P2002') {
      errorMessage = "Duplicate entry. Notification preferences already exist.";
    } else if (err.code === 'P2025') {
      errorMessage = "Record not found.";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;

