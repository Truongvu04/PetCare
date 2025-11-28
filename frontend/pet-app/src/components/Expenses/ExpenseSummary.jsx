import React from "react";

const ExpenseSummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-green-50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const categoryLabels = {
    food: "Thức ăn",
    medicine: "Thuốc",
    accessories: "Phụ kiện",
    vet_visit: "Khám thú y",
    grooming: "Chải chuốt",
    other: "Khác",
  };

  const topCategories = Object.entries(summary.by_category || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-green-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
        <p className="text-2xl font-bold text-gray-900">
          {summary.total_spent ? `${summary.total_spent.toLocaleString("vi-VN")} VND` : "0 VND"}
        </p>
      </div>
      {topCategories[0] && (
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">
            {categoryLabels[topCategories[0][0]] || topCategories[0][0]}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {topCategories[0][1] ? `${topCategories[0][1].toLocaleString("vi-VN")} VND` : "0 VND"}
          </p>
        </div>
      )}
      {topCategories[1] && (
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">
            {categoryLabels[topCategories[1][0]] || topCategories[1][0]}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {topCategories[1][1] ? `${topCategories[1][1].toLocaleString("vi-VN")} VND` : "0 VND"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;

