import React, { useState } from "react";
import { healthApi } from "../../api/healthApi.js";
import { showSuccess, showError } from "../../utils/notifications.js";

const VaccinationForm = ({ petId, onSuccess }) => {
  const [vaccinationName, setVaccinationName] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vaccinationName.trim()) {
      showError("Error", "Please enter vaccine name");
      return;
    }

    setLoading(true);
    try {
      await healthApi.createHealthRecord({
        pet_id: petId,
        record_type: "vaccination",
        vaccination_name: vaccinationName.trim(),
        record_date: recordDate,
      });

      showSuccess("Success", "Vaccination record added successfully");
      setVaccinationName("");
      setRecordDate(new Date().toISOString().split("T")[0]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating vaccination record:", error);
      showError("Error", "Unable to add vaccination record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-lg font-semibold mb-4">Add Vaccination Record</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vaccine Name *
          </label>
          <input
            type="text"
            value={vaccinationName}
            onChange={(e) => setVaccinationName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Rabies vaccine, 5-in-1 vaccine..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vaccination Date *
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
          {loading ? "Adding..." : "Add Vaccination Record"}
        </button>
      </div>
    </form>
  );
};

export default VaccinationForm;






