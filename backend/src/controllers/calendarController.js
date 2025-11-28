import { prisma } from "../config/prisma.js";
import crypto from "crypto";

// Get calendar events
export const getCalendarEvents = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { start_date, end_date, pet_id } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "Missing required query params: start_date, end_date" });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const where = {
      user_id,
      event_date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (pet_id) {
      // Verify pet belongs to user
      const pet = await prisma.pet.findFirst({
        where: { id: pet_id, user_id },
      });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found or unauthorized" });
      }
      where.pet_id = pet_id;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: {
        event_date: "asc",
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
        expense: {
          select: {
            id: true,
            amount: true,
            category: true,
            description: true,
          },
        },
        reminder: {
          select: {
            reminder_id: true,
            type: true,
            vaccination_type: true,
            reminder_date: true,
          },
        },
      },
    });

    res.json(events);
  } catch (err) {
    console.error("Error fetching calendar events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get upcoming expenses from reminders
export const getUpcomingExpenses = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get reminders that are upcoming (reminder_date >= today) and related to expenses
    const reminders = await prisma.reminder.findMany({
      where: {
        pet: {
          user_id,
        },
        reminder_date: {
          gte: today,
        },
        status: "pending",
        type: {
          in: ["vet_visit", "medication", "grooming"],
        },
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
      orderBy: {
        reminder_date: "asc",
      },
      take: 10, // Limit to 10 upcoming
    });

    // Transform reminders into expense-like format
    const upcomingExpenses = reminders.map((reminder) => {
      let category = "other";
      if (reminder.type === "vet_visit") category = "vet_visit";
      else if (reminder.type === "medication") category = "medicine";
      else if (reminder.type === "grooming") category = "grooming";

      return {
        id: reminder.reminder_id,
        pet_id: reminder.pet_id,
        pet: reminder.pet,
        category,
        description: reminder.vaccination_type || `${reminder.pet.name}'s ${reminder.type}`,
        expense_date: reminder.reminder_date,
        reminder_type: reminder.type,
        is_reminder: true,
      };
    });

    res.json(upcomingExpenses);
  } catch (err) {
    console.error("Error fetching upcoming expenses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create calendar event manually (optional)
export const createCalendarEvent = async (req, res) => {
  try {
    const { pet_id, event_type, title, description, event_date, related_expense_id, related_reminder_id } = req.body;
    const user_id = req.user.user_id;

    if (!pet_id || !event_type || !title || !event_date) {
      return res.status(400).json({ error: "Missing required fields: pet_id, event_type, title, event_date" });
    }

    // Validate event_type
    const validTypes = ["vet_visit", "expense", "reminder"];
    if (!validTypes.includes(event_type)) {
      return res.status(400).json({ error: "Invalid event_type" });
    }

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: { id: pet_id, user_id },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found or unauthorized" });
    }

    // Validate date
    const eventDate = new Date(event_date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ error: "Invalid event_date format" });
    }

    // Verify related entities if provided
    if (related_expense_id) {
      const expense = await prisma.expense.findFirst({
        where: { id: related_expense_id, user_id },
      });
      if (!expense) {
        return res.status(404).json({ error: "Related expense not found" });
      }
    }

    if (related_reminder_id) {
      const reminder = await prisma.reminder.findFirst({
        where: { reminder_id: related_reminder_id },
        include: {
          pet: {
            select: {
              user_id: true,
            },
          },
        },
      });
      if (!reminder || reminder.pet.user_id !== user_id) {
        return res.status(404).json({ error: "Related reminder not found" });
      }
    }

    const event = await prisma.calendarEvent.create({
      data: {
        id: crypto.randomBytes(12).toString("hex"),
        pet_id,
        user_id,
        event_type,
        title,
        description: description || null,
        event_date: eventDate,
        related_expense_id: related_expense_id || null,
        related_reminder_id: related_reminder_id || null,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("Error creating calendar event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

