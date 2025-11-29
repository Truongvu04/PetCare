import api from "./axiosConfig.js";

export const healthApi = {
  createHealthRecord: async (data) => {
    const response = await api.post("/health", data);
    return response.data;
  },

  getHealthRecords: async (petId, recordType = null) => {
    const params = {};
    if (recordType) params.record_type = recordType;
    const response = await api.get(`/health/pet/${petId}`, { params });
    return response.data;
  },

  getWeightHistory: async (petId) => {
    const response = await api.get(`/health/pet/${petId}/weight`);
    return response.data;
  },

  getVaccinationHistory: async (petId) => {
    const response = await api.get(`/health/pet/${petId}/vaccination`);
    return response.data;
  },

  updateHealthRecord: async (recordId, data) => {
    const response = await api.put(`/health/${recordId}`, data);
    return response.data;
  },

  deleteHealthRecord: async (recordId) => {
    const response = await api.delete(`/health/${recordId}`);
    return response.data;
  },
};

