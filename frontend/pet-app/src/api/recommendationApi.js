import api from "./axiosConfig.js";

export const recommendationApi = {
  // Get recommendations
  getRecommendations: async (petId, type = "products") => {
    const response = await api.get("/recommendations", {
      params: { pet_id: petId, type },
    });
    return response.data;
  },

  // Get product recommendations
  getProductRecommendations: async (petId) => {
    const response = await api.get("/recommendations/products", {
      params: { pet_id: petId },
    });
    return response.data;
  },

  // Get service recommendations
  getServiceRecommendations: async (petId) => {
    const response = await api.get("/recommendations/services", {
      params: { pet_id: petId },
    });
    return response.data;
  },
};

