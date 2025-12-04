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
      showError("Lỗi", "Vui lòng nhập tên vaccine");
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

      showSuccess("Thành công", "Đã thêm lịch sử tiêm chủng");
      setVaccinationName("");
      setRecordDate(new Date().toISOString().split("T")[0]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating vaccination record:", error);
      showError("Lỗi", "Không thể thêm lịch sử tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-lg font-semibold mb-4">Thêm lịch sử tiêm chủng</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên vaccine *
          </label>
          <input
            type="text"
            value={vaccinationName}
            onChange={(e) => setVaccinationName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ví dụ: Vaccine phòng dại, Vaccine 5 trong 1..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày tiêm *
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
          {loading ? "Đang thêm..." : "Thêm lịch sử tiêm chủng"}
        </button>
      </div>
    </form>
  );
};

export default VaccinationForm;





