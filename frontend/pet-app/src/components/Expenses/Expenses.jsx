import React, { useState, useEffect } from "react";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { expenseApi } from "../../api/expenseApi.js";
import ExpenseForm from "./ExpenseForm.jsx";
import ExpenseSummary from "./ExpenseSummary.jsx";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("this_month");

  useEffect(() => {
    loadExpenses();
    loadSummary();
  }, [filter]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === "this_month") {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        params.start_date = startOfMonth.toISOString().split("T")[0];
        params.end_date = endOfMonth.toISOString().split("T")[0];
      } else if (filter === "last_month") {
        const now = new Date();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        params.start_date = startOfLastMonth.toISOString().split("T")[0];
        params.end_date = endOfLastMonth.toISOString().split("T")[0];
      }
      const data = await expenseApi.getExpenses(params);
      setExpenses(data);
    } catch (err) {
      console.error("Error loading expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await expenseApi.getExpenseSummary(filter);
      setSummary(data);
    } catch (err) {
      console.error("Error loading summary:", err);
    }
  };

  const handleSuccess = () => {
    loadExpenses();
    loadSummary();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const categoryLabels = {
    food: "Thức ăn",
    medicine: "Thuốc",
    accessories: "Phụ kiện",
    vet_visit: "Khám thú y",
    grooming: "Chải chuốt",
    other: "Khác",
  };

  return (
    <CustomerLayout currentPage="expenses">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Expenses</h2>
      <p className="text-green-600 mb-6">Track your pet's expenses</p>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        {["All", "This month", "Last month"].map((tab) => {
          const tabValue = tab === "All" ? "all" : tab === "This month" ? "this_month" : "last_month";
          return (
            <button
              key={tab}
              onClick={() => setFilter(tabValue)}
              className={`pb-2 px-1 ${
                filter === tabValue
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <ExpenseSummary summary={summary} loading={loading} />

      {/* Expenses List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            + Thêm chi phí
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500">Chưa có chi phí nào</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Category</th>
                  <th className="p-3 border-b">Description</th>
                  <th className="p-3 border-b">Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-green-50">
                    <td className="p-3 border-b">{formatDate(expense.expense_date)}</td>
                    <td className="p-3 border-b">
                      {categoryLabels[expense.category] || expense.category}
                    </td>
                    <td className="p-3 border-b">{expense.description}</td>
                    <td className="p-3 border-b font-medium">{parseFloat(expense.amount).toLocaleString("vi-VN")} VND</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          onSuccess={handleSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </CustomerLayout>
  );
};

export default Expenses;

