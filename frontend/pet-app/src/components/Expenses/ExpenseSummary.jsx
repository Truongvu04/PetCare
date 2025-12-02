import React from "react";

const ExpenseSummary = ({ summary, loading }) => {
  const categoryLabels = {
    food: "Thức ăn",
    medicine: "Thuốc",
    accessories: "Phụ kiện",
    vet_visit: "Khám thú y",
    grooming: "Chải chuốt",
    other: "Khác",
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalSpent = summary?.total_spent || 0;
  const topCategories = summary?.by_category || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Spent */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
        <p className="text-2xl font-bold text-green-700">
          {totalSpent.toLocaleString("vi-VN")} VND
        </p>
      </div>

      {/* Top Categories */}
      {topCategories.slice(0, 2).map((item, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">
            {categoryLabels[item.category] || item.category}
          </p>
          <p className="text-2xl font-bold text-green-700">
            {item.amount.toLocaleString("vi-VN")} VND
          </p>
        </div>
      ))}

      {/* Empty slot if less than 2 categories */}
      {topCategories.length < 2 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Chưa có dữ liệu</p>
          <p className="text-2xl font-bold text-gray-400">0 VND</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;



