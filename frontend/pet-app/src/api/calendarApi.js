import api from "./axiosConfig.js";

export const calendarApi = {
  // Get calendar events
  getCalendarEvents: async (startDate, endDate, petId = null) => {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    if (petId) params.pet_id = petId;
    const response = await api.get("/calendar", { params });
    return response.data;
  },

  // Get upcoming expenses
  getUpcomingExpenses: async () => {
    const response = await api.get("/calendar/upcoming");
    return response.data;
  },

  // Create calendar event
  createCalendarEvent: async (data) => {
    const response = await api.post("/calendar/events", data);
    return response.data;
  },
};

