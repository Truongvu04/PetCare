import api from "./axiosConfig.js";

export const vaccineApi = {
  getVaccinesBySpecies: async (species) => {
    const response = await api.get("/vaccines", {
      params: { species },
    });
    return response.data;
  },

  getVaccineById: async (vaccineId) => {
    const response = await api.get(`/vaccines/${vaccineId}`);
    return response.data;
  },

  getVaccineSchedule: async (vaccineId) => {
    const response = await api.get(`/vaccines/${vaccineId}/schedule`);
    return response.data;
  },

  createVaccine: async (data) => {
    const response = await api.post("/vaccines", data);
    return response.data;
  },

  updateVaccine: async (vaccineId, data) => {
    const response = await api.put(`/vaccines/${vaccineId}`, data);
    return response.data;
  },

  getAllVaccines: async () => {
    const response = await api.get("/vaccines");
    return response.data;
  },

  deleteVaccine: async (vaccineId) => {
    const response = await api.delete(`/vaccines/${vaccineId}`);
    return response.data;
  },
};

