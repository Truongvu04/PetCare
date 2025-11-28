import api from "./axiosConfig.js";

export const aiApi = {
  // Send chat message
  sendChatMessage: async (message, petId = null) => {
    const response = await api.post("/ai/chat", {
      message,
      pet_id: petId,
    });
    return response.data;
  },

  // Get chat history
  getChatHistory: async (petId = null, limit = 50) => {
    const params = { limit };
    if (petId) params.pet_id = petId;
    const response = await api.get("/ai/chat/history", { params });
    return response.data;
  },

  // Delete chat history
  deleteChatHistory: async (petId = null) => {
    const params = petId ? { pet_id: petId } : {};
    await api.delete("/ai/chat/history", { params });
  },
};

