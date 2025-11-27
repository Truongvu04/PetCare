import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { showConfirm, showToast } from "../../utils/notifications";
import {
  Syringe,
  Scissors,
  Stethoscope,
  Utensils,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

const getReminderIcon = (type) => {
  switch (type) {
    case "vaccination":
      return <Syringe className="text-green-700" size={20} />;
    case "grooming":
      return <Scissors className="text-green-700" size={20} />;
    case "vet_visit":
    case "checkup":
      return <Stethoscope className="text-green-700" size={20} />;
    case "feeding":
      return <Utensils className="text-green-700" size={20} />;
    default:
      return <Stethoscope className="text-gray-600" size={20} />;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ReminderList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchReminders();
  }, [user, filter]);

  const fetchReminders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("/reminders");
      let data = Array.isArray(res.data) ? res.data : [];

      // Apply filter
      if (filter !== "all") {
        data = data.filter((r) => r.type === filter);
      }

      setReminders(data);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      showToast("Không thể tải danh sách nhắc nhở", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reminderId) => {
    const result = await showConfirm("Xóa nhắc nhở", "Bạn có chắc chắn muốn xóa nhắc nhở này?");
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/reminders/${reminderId}`);
      showToast("Đã xóa nhắc nhở thành công", "success");
      fetchReminders();
    } catch (err) {
      console.error("Error deleting reminder:", err);
      showToast("Không thể xóa nhắc nhở", "error");
    }
  };

  const handleMarkDone = async (reminderId) => {
    try {
      await api.put(`/reminders/${reminderId}`, { status: "done" });
      showToast("Đã đánh dấu hoàn thành", "success");
      fetchReminders();
    } catch (err) {
      console.error("Error updating reminder:", err);
      showToast("Không thể cập nhật nhắc nhở", "error");
    }
  };

  const handleEdit = (reminderId) => {
    navigate(`/reminder/edit/${reminderId}`);
  };

  const filterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "vaccination", label: "Tiêm chủng" },
    { value: "checkup", label: "Khám sức khỏe" },
    { value: "feeding", label: "Cho ăn" },
    { value: "grooming", label: "Chải lông" },
  ];

  if (loading) {
    return (
      <CustomerLayout currentPage="reminder">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Đang tải danh sách nhắc nhở...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="reminder">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Danh sách Nhắc nhở
            </h1>
            <p className="text-sm text-green-700">
              Quản lý và xem tất cả các nhắc nhở của bạn
            </p>
          </div>
          <button
            onClick={() => navigate("/reminder")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Tạo nhắc nhở mới
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Filter className="text-gray-600" size={20} />
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === option.value
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              {filter === "all"
                ? "Chưa có nhắc nhở nào. Hãy tạo nhắc nhở mới!"
                : "Không có nhắc nhở nào thuộc loại này."}
            </p>
            {filter === "all" && (
              <button
                onClick={() => navigate("/reminder")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Tạo nhắc nhở đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.reminder_id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-green-50 p-3 rounded-lg">
                      {getReminderIcon(reminder.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {reminder.display_title || `${reminder.pet?.name}'s ${reminder.type}`}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {reminder.subtitle || "Không có mô tả"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Ngày: {formatDate(reminder.reminder_date)}
                        </span>
                        {reminder.feeding_time && (
                          <span>
                            Giờ: {new Date(reminder.feeding_time).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded ${
                            reminder.status === "done"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {reminder.status === "done" ? "Hoàn thành" : "Chờ xử lý"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reminder.status !== "done" && (
                      <>
                        <button
                          onClick={() => handleMarkDone(reminder.reminder_id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Đánh dấu hoàn thành"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleEdit(reminder.reminder_id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit size={20} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(reminder.reminder_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default ReminderList;

