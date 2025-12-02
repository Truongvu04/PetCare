import React, { useState } from "react";
import { healthApi } from "../../api/healthApi.js";
import { showSuccess, showError } from "../../utils/notifications.js";

const HealthNoteForm = ({ petId, onSuccess }) => {
  const [healthNote, setHealthNote] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!healthNote.trim()) {
      showError("Lỗi", "Vui lòng nhập ghi chú sức khỏe");
      return;
    }

    setLoading(true);
    try {
      await healthApi.createHealthRecord({
        pet_id: petId,
        record_type: "health_note",
        health_note: healthNote.trim(),
        record_date: recordDate,
      });

      showSuccess("Thành công", "Đã thêm ghi chú sức khỏe");
      setHealthNote("");
      setRecordDate(new Date().toISOString().split("T")[0]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating health note:", error);
      showError("Lỗi", "Không thể thêm ghi chú sức khỏe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-lg font-semibold mb-4">Thêm ghi chú sức khỏe</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú sức khỏe *
          </label>
          <textarea
            value={healthNote}
            onChange={(e) => setHealthNote(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập ghi chú về sức khỏe của thú cưng..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày *
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
          {loading ? "Đang thêm..." : "Thêm ghi chú"}
        </button>
      </div>
    </form>
  );
};

export default HealthNoteForm;



