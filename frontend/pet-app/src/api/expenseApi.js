import api from "./axiosConfig.js";

export const expenseApi = {
  createExpense: async (data) => {
    const response = await api.post("/expenses", data);
    return response.data;
  },

  getExpenses: async (filters = {}) => {
    const params = {};
    if (filters.pet_id) params.pet_id = filters.pet_id;
    if (filters.category) params.category = filters.category;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    const response = await api.get("/expenses", { params });
    return response.data;
  },

  getExpenseSummary: async (period = "all") => {
    const response = await api.get("/expenses/summary", {
      params: { period },
    });
    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};


