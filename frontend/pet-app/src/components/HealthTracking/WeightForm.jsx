import React, { useState } from "react";

const WeightForm = ({ petId, onSuccess }) => {
  const [weight, setWeight] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { healthApi } = await import("../../api/healthApi.js");
      // Convert kg to lbs for database (1 kg = 2.20462 lbs)
      // Database stores in lbs, but user inputs in kg
      const weightInLbs = parseFloat(weight) * 2.20462;
      await healthApi.createHealthRecord({
        pet_id: petId,
        record_type: "weight",
        value: weightInLbs,
        record_date: recordDate,
      });
      setWeight("");
      setRecordDate(new Date().toISOString().split("T")[0]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Có lỗi xảy ra khi lưu cân nặng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cân nặng (kg)
        </label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
          placeholder="Nhập cân nặng bằng kg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ngày
        </label>
        <input
          type="date"
          value={recordDate}
          onChange={(e) => setRecordDate(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Đang lưu..." : "Lưu cân nặng"}
      </button>
    </form>
  );
};

export default WeightForm;

