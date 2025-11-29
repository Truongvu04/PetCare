import { prisma } from "../config/prisma.js";

/**
 * Get calendar events
 * GET /api/calendar
 */
export const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { start_date, end_date, pet_id } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "start_date and end_date are required" });
    }

    const whereClause = {
      user_id: userId,
      event_date: {
        gte: new Date(start_date),
        lte: new Date(end_date),
      },
    };

    if (pet_id) {
      whereClause.pet_id = pet_id;
    }

    // Get calendar events
    let calendarEvents = [];
    try {
      calendarEvents = await prisma.calendarEvent.findMany({
        where: whereClause,
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
              category: true,
              amount: true,
              description: true,
            },
          },
        },
        orderBy: {
          event_date: "asc",
        },
      });
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      // If table doesn't exist, just use empty array
      calendarEvents = [];
    }

    // Get reminders as events
    const reminderWhereClause = {
      pet: {
        user_id: userId,
      },
      reminder_date: {
        gte: new Date(start_date),
        lte: new Date(end_date),
      },
    };

    if (pet_id) {
      reminderWhereClause.pet_id = pet_id;
    }

    let reminders = [];
    try {
      reminders = await prisma.reminder.findMany({
        where: reminderWhereClause,
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
      });
    } catch (error) {
      console.error("Error fetching reminders:", error);
      reminders = [];
    }

    // Format reminders as events
    const reminderEvents = reminders.map((reminder) => {
      let title = "";
      if (reminder.type === "vaccination" && reminder.vaccination_type) {
        title = `Tiêm chủng: ${reminder.vaccination_type}`;
      } else if (reminder.type === "feeding" && reminder.feeding_time) {
        const time = new Date(`2000-01-01T${reminder.feeding_time}`).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        title = `Cho ăn lúc ${time}`;
      } else {
        title = reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1);
      }

      return {
        id: reminder.reminder_id,
        pet_id: reminder.pet_id,
        user_id: userId,
        event_type: "reminder",
        title: title,
        description: reminder.vaccination_type || reminder.type,
        event_date: reminder.reminder_date,
        related_reminder_id: reminder.reminder_id,
        pet: reminder.pet,
        status: reminder.status,
      };
    });

    // Combine and sort all events
    const allEvents = [...calendarEvents, ...reminderEvents].sort(
      (a, b) => new Date(a.event_date) - new Date(b.event_date)
    );

    return res.json({
      success: true,
      events: allEvents,
    });
  } catch (error) {
    console.error("Error in getCalendarEvents:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return res.status(500).json({
      message: "Error fetching calendar events",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

/**
 * Get upcoming expenses from reminders
 * GET /api/calendar/upcoming
 */
export const getUpcomingExpenses = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminders = await prisma.reminder.findMany({
      where: {
        pet: {
          user_id: userId,
        },
        status: "pending",
        reminder_date: {
          gte: today,
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
      take: 10,
    });

    // Format reminders as upcoming expenses
    const upcomingExpenses = reminders.map((reminder) => {
      let category = "other";
      let description = reminder.type;
      let amount = 0;

      if (reminder.type === "vaccination") {
        category = "vet_visit";
        description = `Tiêm chủng: ${reminder.vaccination_type || "Không xác định"}`;
        amount = 200000; // Default vaccination cost
      } else if (reminder.type === "vet_visit") {
        category = "vet_visit";
        description = "Khám thú y";
        amount = 500000; // Default vet visit cost
      } else if (reminder.type === "grooming") {
        category = "grooming";
        description = "Chải chuốt";
        amount = 150000; // Default grooming cost
      }

      return {
        id: reminder.reminder_id,
        date: reminder.reminder_date,
        category: category,
        description: description,
        amount: amount,
        pet: reminder.pet,
        reminder_id: reminder.reminder_id,
      };
    });

    return res.json({
      success: true,
      upcoming_expenses: upcomingExpenses,
    });
  } catch (error) {
    console.error("Error in getUpcomingExpenses:", error);
    return res.status(500).json({
      message: "Error fetching upcoming expenses",
      error: error.message,
    });
  }
};

/**
 * Create calendar event manually
 * POST /api/calendar/events
 */
export const createCalendarEvent = async (req, res) => {
  try {
    const { pet_id, event_type, title, description, event_date, related_expense_id, related_reminder_id } = req.body;
    const userId = req.user.user_id;

    // Validate pet ownership
    const pet = await prisma.pet.findFirst({
      where: {
        id: pet_id,
        user_id: userId,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or you don't have permission" });
    }

    // Validate event type
    const validTypes = ["vet_visit", "expense", "reminder"];
    if (!validTypes.includes(event_type)) {
      return res.status(400).json({ message: "Invalid event_type" });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        pet_id,
        user_id: userId,
        event_type,
        title: title.trim(),
        description: description ? description.trim() : null,
        event_date: new Date(event_date),
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

    return res.status(201).json({
      success: true,
      event: event,
    });
  } catch (error) {
    console.error("Error in createCalendarEvent:", error);
    return res.status(500).json({
      message: "Error creating calendar event",
      error: error.message,
    });
  }
};

