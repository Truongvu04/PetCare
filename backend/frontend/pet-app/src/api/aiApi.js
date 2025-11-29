import api from "./axiosConfig.js";

export const aiApi = {
  sendMessage: async (message, petId = null) => {
    const response = await api.post("/ai/chat", { message, pet_id: petId });
    return response.data;
  },

  getChatHistory: async (petId = null, limit = 50) => {
    const params = { limit };
    if (petId) params.pet_id = petId;
    const response = await api.get("/ai/chat/history", { params });
    return response.data;
  },

  deleteChatHistory: async (petId = null) => {
    const params = {};
    if (petId) params.pet_id = petId;
    const response = await api.delete("/ai/chat/history", { params });
    return response.data;
  },
};

