import api from "./axiosConfig.js";

export const reminderApi = {
  // Get all reminders
  getReminders: async (petId = null) => {
    const params = {};
    if (petId) params.pet_id = petId;
    const response = await api.get("/reminders", { params });
    return response.data;
  },

  // Get reminder by ID
  getReminderById: async (reminderId) => {
    const response = await api.get(`/reminders/${reminderId}`);
    return response.data;
  },

  // Create reminder
  createReminder: async (data) => {
    const response = await api.post("/reminders", data);
    return response.data;
  },

  // Update reminder
  updateReminder: async (reminderId, data) => {
    const response = await api.put(`/reminders/${reminderId}`, data);
    return response.data;
  },

  // Delete reminder
  deleteReminder: async (reminderId) => {
    const response = await api.delete(`/reminders/${reminderId}`);
    return response.data;
  },
};


