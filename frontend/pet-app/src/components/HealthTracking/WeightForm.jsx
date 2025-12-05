import React, { useState } from "react";
import { healthApi } from "../../api/healthApi.js";
import { showSuccess, showError } from "../../utils/notifications.js";

const WeightForm = ({ petId, onSuccess }) => {
  const [weight, setWeight] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) {
      showError("Error", "Please enter a valid weight");
      return;
    }

    setLoading(true);
    try {
      // Convert kg to lbs before sending to backend
      const weightInLbs = parseFloat(weight) * 2.20462;
      
      await healthApi.createHealthRecord({
        pet_id: petId,
        record_type: "weight",
        value: weightInLbs,
        record_date: recordDate,
      });

      showSuccess("Success", "Weight record added successfully");
      setWeight("");
      setRecordDate(new Date().toISOString().split("T")[0]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating weight record:", error);
      showError("Error", "Unable to add weight record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-lg font-semibold mb-4">Add Weight</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter weight (kg)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Weight"}
        </button>
      </div>
    </form>
  );
};

export default WeightForm;






