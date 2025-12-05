import api from "./axiosConfig.js";

export const recommendationApi = {
  getProductRecommendations: async (petId) => {
    const response = await api.get("/recommendations/products", {
      params: { pet_id: petId },
    });
    return response.data;
  },

  getServiceRecommendations: async () => {
    const response = await api.get("/recommendations/services");
    return response.data;
  },
};








