import api from "./axiosConfig.js";

export const healthApi = {
  // Create health record
  createHealthRecord: async (data) => {
    const response = await api.post("/health", data);
    return response.data;
  },

  // Get all health records for a pet
  getHealthRecords: async (petId, recordType = null) => {
    const params = recordType ? { record_type: recordType } : {};
    const response = await api.get(`/health/pet/${petId}`, { params });
    return response.data;
  },

  // Get weight history
  getWeightHistory: async (petId) => {
    const response = await api.get(`/health/pet/${petId}/weight`);
    return response.data;
  },

  // Get vaccination history
  getVaccinationHistory: async (petId) => {
    const response = await api.get(`/health/pet/${petId}/vaccination`);
    return response.data;
  },

  // Update health record
  updateHealthRecord: async (recordId, data) => {
    const response = await api.put(`/health/${recordId}`, data);
    return response.data;
  },

  // Delete health record
  deleteHealthRecord: async (recordId) => {
    await api.delete(`/health/${recordId}`);
  },
};

