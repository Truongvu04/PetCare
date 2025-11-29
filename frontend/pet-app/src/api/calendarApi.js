import api from "./axiosConfig.js";

export const calendarApi = {
  getCalendarEvents: async (startDate, endDate, petId = null) => {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    if (petId) params.pet_id = petId;
    const response = await api.get("/calendar", { params });
    return response.data;
  },

  getUpcomingExpenses: async () => {
    const response = await api.get("/calendar/upcoming");
    return response.data;
  },

  createCalendarEvent: async (data) => {
    const response = await api.post("/calendar/events", data);
    return response.data;
  },
};

