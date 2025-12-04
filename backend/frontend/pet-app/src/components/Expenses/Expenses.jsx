import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import { expenseApi } from "../../api/expenseApi.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import ExpenseForm from "./ExpenseForm.jsx";
import ExpenseSummary from "./ExpenseSummary.jsx";
import { showError } from "../../utils/notifications.js";
import { Plus } from "lucide-react";

const Expenses = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await api.get("/pets");
        setPets(response.data || []);
      } catch (error) {
        console.error("Error loading pets:", error);
      }
    };
    if (user) {
      loadPets();
    }
  }, [user]);

  useEffect(() => {
    loadExpenses();
    loadSummary();
  }, [activeFilter]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const filters = {};
      
      if (activeFilter === "this_month") {
        const now = new Date();
        filters.start_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        filters.end_date = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
      } else if (activeFilter === "last_month") {
        const now = new Date();
        filters.start_date = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
        filters.end_date = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
      }

      const response = await expenseApi.getExpenses(filters);
      setExpenses(response.expenses || []);
    } catch (error) {
      console.error("Error loading expenses:", error);
      showError("Lỗi", "Không thể tải danh sách chi phí");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      let period = "all";
      if (activeFilter === "this_month") period = "this_month";
      else if (activeFilter === "last_month") period = "last_month";

      const response = await expenseApi.getExpenseSummary(period);
      setSummary(response.summary);
    } catch (error) {
      console.error("Error loading summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSuccess = () => {
    loadExpenses();
    loadSummary();
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Chi phí thú cưng</h1>
            <p className="text-gray-600">Theo dõi và quản lý chi phí chăm sóc thú cưng</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Plus size={20} />
            <span>Thêm chi phí</span>
          </button>
        </div>

        {/* Summary Cards */}
        <ExpenseSummary summary={summary} loading={summaryLoading} />

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            {[
              { id: "all", label: "Tất cả" },
              { id: "this_month", label: "Tháng này" },
              { id: "last_month", label: "Tháng trước" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                  activeFilter === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : expenses.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Chưa có chi phí nào
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thú cưng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Danh mục
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mô tả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 text-sm">
                        {new Date(expense.expense_date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {expense.pet?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {categoryLabels[expense.category] || expense.category}
                      </td>
                      <td className="px-4 py-3 text-sm">{expense.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-700">
                        {parseFloat(expense.amount).toLocaleString("vi-VN")} VND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Expense Form Modal */}
        {showForm && (
          <ExpenseForm
            pets={pets}
            onSuccess={handleSuccess}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </CustomerLayout>
  );
};

export default Expenses;

