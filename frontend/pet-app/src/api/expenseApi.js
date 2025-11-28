import api from "./axiosConfig.js";

export const expenseApi = {
  // Create expense
  createExpense: async (data) => {
    const response = await api.post("/expenses", data);
    return response.data;
  },

  // Get expenses
  getExpenses: async (params = {}) => {
    const response = await api.get("/expenses", { params });
    return response.data;
  },

  // Get expense summary
  getExpenseSummary: async (period = "all") => {
    const response = await api.get("/expenses/summary", {
      params: { period },
    });
    return response.data;
  },

  // Get expense by ID
  getExpenseById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Update expense
  updateExpense: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (id) => {
    await api.delete(`/expenses/${id}`);
  },
};

