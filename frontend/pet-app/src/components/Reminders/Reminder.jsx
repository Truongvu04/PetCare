// PetCare/frontend/pet-app/src/components/Reminders/Reminder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { showSuccess, showError, showWarning, showConfirm, showToast } from "../../utils/notifications";
import {
  Syringe,
  Scissors,
  Stethoscope,
  Utensils,
  Edit,
  Trash2,
  CheckCircle,
  Filter,
  Plus,
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

const RemindersAuto = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [pets, setPets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  // --- States cho từng loại reminder ---
  const [vPet, setVPet] = useState("");
  const [vaccinationType, setVaccinationType] = useState("");
  const [vDate, setVDate] = useState("");
  const [vFreq, setVFreq] = useState("none");

  const [cPet, setCPet] = useState("");
  const [cDate, setCDate] = useState("");
  const [cFreq, setCFreq] = useState("none");

  const [fPet, setFPet] = useState("");
  const [feedingTime, setFeedingTime] = useState("");
  const [fFreq, setFFreq] = useState("none");
  const [fEndDate, setFEndDate] = useState("");

  const [gPet, setGPet] = useState("");
  const [gDate, setGDate] = useState("");
  const [gFreq, setGFreq] = useState("none");
  // ------------------------------------

  useEffect(() => {
    async function loadPets() {
      if (!user) {
        setPets([]);
        return;
      }
      try {
        const res = await api.get("/pets");
        if (Array.isArray(res.data)) setPets(res.data);
        else setPets([]);
      } catch (err) {
        console.error("Failed to load pets", err);
        setPets([]);
      }
    }
    loadPets();
  }, [user]);

  // Load reminders on component mount
  useEffect(() => {
    fetchReminders();
  }, [user, filter]);

  const fetchReminders = async () => {
    if (!user) {
      setLoadingReminders(false);
      return;
    }

    try {
      setLoadingReminders(true);
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
      setLoadingReminders(false);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
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

  const handleCancel = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const calculateDaysDiff = (dateStr1, dateStr2) => {
    if (!dateStr1 || !dateStr2) return Infinity;
    const date1 = new Date(dateStr1 + "T00:00:00Z");
    const date2 = new Date(dateStr2 + "T00:00:00Z");
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return Infinity;
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isFrequencyValid = (startDateStr, freq) => {
    if (!startDateStr || freq === "none" || freq === "daily") return true;
    const daysDiff = calculateDaysDiff(todayStr, startDateStr);
    if (freq === "weekly" && daysDiff < 7) return false;
    if (freq === "monthly" && daysDiff < 28) return false;
    if (freq === "yearly" && daysDiff < 365) return false;
    return true;
  };

  const isRepeating = (freq) => freq !== "none";

  const validateReminder = (pet, date, freq, endDate, typeName, feedingTime) => {
    if (!pet) {
      showWarning("Thiếu thông tin", `Vui lòng chọn thú cưng cho ${typeName}.`);
      return false;
    }
    if (typeName !== "Feeding" && !date) {
      showWarning("Thiếu thông tin", `Vui lòng chọn ngày cho ${typeName}.`);
      return false;
    }
    if (typeName === "Feeding" && !feedingTime) {
      showWarning("Thiếu thông tin", "Vui lòng chọn thời gian cho nhắc nhở cho ăn.");
      return false;
    }
    if (typeName !== "Feeding" && !isFrequencyValid(date, freq)) {
      showWarning("Lỗi", `${typeName}: Tần suất '${freq}' quá ngắn cho ngày ${date}.`);
      return false;
    }
    if (typeName === "Feeding" && endDate) {
      if (!isRepeating(freq)) {
        showWarning("Lỗi", `${typeName}: Ngày kết thúc chỉ áp dụng cho nhắc nhở lặp lại.`);
        return false;
      }
      if (new Date(endDate + "T00:00:00Z") < new Date(todayStr + "T00:00:00Z")) {
        showWarning("Lỗi", `${typeName}: Ngày kết thúc phải là hôm nay hoặc sau đó.`);
        return false;
      }
    }
    return true;
  };

  // Hàm lưu một reminder đơn lẻ
  const handleSaveSingleReminder = async (type, payload, resetCallback) => {
    try {
      await api.post("/reminders", payload);
      showSuccess("Thành công", `Đã thêm nhắc nhở ${type} thành công!`);
      if (resetCallback) resetCallback();
      // Refresh reminders list after adding
      fetchReminders();
    } catch (err) {
      console.error(`Failed to save ${type} reminder:`, err);
      const errorMsg = err.response?.data?.error || err.message || `Không thể tạo nhắc nhở ${type}`;
      showError("Lỗi", errorMsg);
    }
  };

  // Lưu từng loại reminder riêng lẻ
  const handleSaveVaccination = async () => {
    if (!validateReminder(vPet, vDate, vFreq, null, "Vaccination", null)) return;
    await handleSaveSingleReminder(
      "tiêm chủng",
      { pet_id: vPet, type: "vaccination", vaccination_type: vaccinationType || null, reminder_date: vDate, frequency: vFreq, end_date: null },
      () => { setVPet(""); setVaccinationType(""); setVDate(""); setVFreq("none"); }
    );
  };

  const handleSaveCheckUp = async () => {
    if (!validateReminder(cPet, cDate, cFreq, null, "Check-Up", null)) return;
    await handleSaveSingleReminder(
      "khám sức khỏe",
      { pet_id: cPet, type: "vet_visit", reminder_date: cDate, frequency: cFreq, end_date: null },
      () => { setCPet(""); setCDate(""); setCFreq("none"); }
    );
  };

  const handleSaveFeeding = async () => {
    if (!validateReminder(fPet, todayStr, fFreq, fEndDate, "Feeding", feedingTime)) return;
    await handleSaveSingleReminder(
      "cho ăn",
      {
        pet_id: fPet,
        type: "feeding",
        feeding_time: feedingTime,
        reminder_date: todayStr,
        frequency: fFreq,
        end_date: isRepeating(fFreq) ? fEndDate || null : null,
      },
      () => { setFPet(""); setFeedingTime(""); setFFreq("none"); setFEndDate(""); }
    );
  };

  const handleSaveGrooming = async () => {
    if (!validateReminder(gPet, gDate, gFreq, null, "Grooming", null)) return;
    await handleSaveSingleReminder(
      "chải chuốt",
      { pet_id: gPet, type: "grooming", reminder_date: gDate, frequency: gFreq, end_date: null },
      () => { setGPet(""); setGDate(""); setGFreq("none"); }
    );
  };

  // Lưu tất cả reminders cùng lúc
  async function handleSubmit(e) {
    e.preventDefault();
    const toCreate = [];

    // Vaccination
    const isVValid = validateReminder(vPet, vDate, vFreq, null, "Vaccination", null);
    if (isVValid === false) return;
    if (isVValid) toCreate.push({ pet_id: vPet, type: "vaccination", vaccination_type: vaccinationType || null, reminder_date: vDate, frequency: vFreq, end_date: null });

    // Check-Up
    const isCValid = validateReminder(cPet, cDate, cFreq, null, "Check-Up", null);
    if (isCValid === false) return;
    if (isCValid) toCreate.push({ pet_id: cPet, type: "vet_visit", reminder_date: cDate, frequency: cFreq, end_date: null });

    // Feeding
    const isFValid = validateReminder(fPet, todayStr, fFreq, fEndDate, "Feeding", feedingTime);
    if (isFValid === false) return;
    if (isFValid)
      toCreate.push({
        pet_id: fPet,
        type: "feeding",
        feeding_time: feedingTime,
        reminder_date: todayStr,
        frequency: fFreq,
        end_date: isRepeating(fFreq) ? fEndDate || null : null,
      });

    // Grooming
    const isGValid = validateReminder(gPet, gDate, gFreq, null, "Grooming", null);
    if (isGValid === false) return;
    if (isGValid) toCreate.push({ pet_id: gPet, type: "grooming", reminder_date: gDate, frequency: gFreq, end_date: null });

    if (toCreate.length === 0) {
      showWarning("Thiếu thông tin", "Vui lòng điền ít nhất một phần nhắc nhở.");
      return;
    }

    try {
      await Promise.all(toCreate.map((payload) => api.post("/reminders", payload)));
      showSuccess("Thành công", `Đã lưu ${toCreate.length} nhắc nhở thành công!`);
      // Refresh reminders list
      fetchReminders();
      // Reset all form fields
      setVPet(""); setVaccinationType(""); setVDate(""); setVFreq("none");
      setCPet(""); setCDate(""); setCFreq("none");
      setFPet(""); setFeedingTime(""); setFFreq("none"); setFEndDate("");
      setGPet(""); setGDate(""); setGFreq("none");
      // Optionally hide form after saving
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save reminders:", err);
      const errorMsg = err.response?.data?.error || err.message || "Không thể tạo nhắc nhở";
      showError("Lỗi", errorMsg);
    }
  }

  const filterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "vaccination", label: "Tiêm chủng" },
    { value: "vet_visit", label: "Khám sức khỏe" },
    { value: "feeding", label: "Cho ăn" },
    { value: "grooming", label: "Chải lông" },
  ];

  return (
    <CustomerLayout currentPage="reminder">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Set Up Reminders</h1>
                <p className="text-md text-green-700">Schedule reminders for vaccinations, check-ups, feeding, and grooming.</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus size={18} />
                {showForm ? "Ẩn form" : "Thêm nhắc nhở"}
              </button>
            </div>

            {/* Reminders List Section - Always visible */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách nhắc nhở</h2>
                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-600" size={18} />
                  <div className="flex gap-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
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
              </div>

              {loadingReminders ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">Đang tải danh sách nhắc nhở...</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500 text-lg mb-4">
                    {filter === "all"
                      ? "Chưa có nhắc nhở nào. Hãy tạo nhắc nhở mới!"
                      : "Không có nhắc nhở nào thuộc loại này."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.reminder_id}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-green-50 p-2 rounded-lg">
                            {getReminderIcon(reminder.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              {reminder.pet?.name}'s {reminder.type === "vaccination" && reminder.vaccination_type 
                                ? `Vaccination: ${reminder.vaccination_type}` 
                                : reminder.type === "vet_visit" 
                                ? "Check-Up" 
                                : reminder.type}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Ngày: {formatDate(reminder.reminder_date)}</span>
                              {reminder.feeding_time && (
                                <span>
                                  Giờ: {new Date(`2000-01-01T${reminder.feeding_time}`).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                              <span
                                className={`px-2 py-1 rounded text-xs ${
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
                            <button
                              onClick={() => handleMarkDone(reminder.reminder_id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Đánh dấu hoàn thành"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/reminder/edit/${reminder.reminder_id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(reminder.reminder_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Section - Toggleable */}
            {showForm && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Thêm nhắc nhở mới</h2>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Vaccination */}
              <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-900 text-lg">💉 Vaccination Reminders</h2>
                  <button
                    type="button"
                    onClick={handleSaveVaccination}
                    disabled={!vPet || !vDate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Thêm nhắc nhở
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Thêm nhắc nhở tiêm chủng cho thú cưng của bạn</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn thú cưng *</label>
                    <select value={vPet} onChange={(e) => setVPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="">Select pet</option>
                      {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại vaccine (tùy chọn)</label>
                    <input type="text" placeholder="VD: Dại, FVRCP, ..." value={vaccinationType} onChange={(e) => setVaccinationType(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhắc nhở *</label>
                    <input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} min={todayStr} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tần suất</label>
                    <select value={vFreq} onChange={(e) => setVFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!vDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!vDate}>
                      <option value="none">Một lần</option>
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly" disabled={!isFrequencyValid(vDate, "weekly")}>Hàng tuần</option>
                      <option value="monthly" disabled={!isFrequencyValid(vDate, "monthly")}>Hàng tháng</option>
                      <option value="yearly" disabled={!isFrequencyValid(vDate, "yearly")}>Hàng năm</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Check-Up */}
              <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-900 text-lg">🏥 Check-Up Reminders</h2>
                  <button
                    type="button"
                    onClick={handleSaveCheckUp}
                    disabled={!cPet || !cDate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Thêm nhắc nhở
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Thêm nhắc nhở khám sức khỏe định kỳ</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn thú cưng *</label>
                    <select value={cPet} onChange={(e) => setCPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="">Select pet</option>
                      {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhắc nhở *</label>
                    <input type="date" value={cDate} min={todayStr} onChange={(e) => setCDate(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tần suất</label>
                    <select value={cFreq} onChange={(e) => setCFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!cDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!cDate}>
                      <option value="none">Một lần</option>
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly" disabled={!isFrequencyValid(cDate, "weekly")}>Hàng tuần</option>
                      <option value="monthly" disabled={!isFrequencyValid(cDate, "monthly")}>Hàng tháng</option>
                      <option value="yearly" disabled={!isFrequencyValid(cDate, "yearly")}>Hàng năm</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Feeding */}
              <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-900 text-lg">🍽️ Feeding Reminders</h2>
                  <button
                    type="button"
                    onClick={handleSaveFeeding}
                    disabled={!fPet || !feedingTime}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Thêm nhắc nhở
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Thêm nhắc nhở cho ăn hàng ngày</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn thú cưng *</label>
                    <select value={fPet} onChange={(e) => setFPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="">Select pet</option>
                      {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian cho ăn *</label>
                    <input type="time" value={feedingTime} onChange={(e) => setFeedingTime(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tần suất</label>
                    <select value={fFreq} onChange={(e) => setFFreq(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="none">Chỉ hôm nay</option>
                      <option value="daily">Hàng ngày</option>
                    </select>
                  </div>
                  {fFreq !== "none" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (tùy chọn)</label>
                      <input type="date" value={fEndDate} onChange={(e) => setFEndDate(e.target.value)} min={todayStr} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                    </div>
                  )}
                </div>
              </section>

              {/* Grooming */}
              <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-900 text-lg">✂️ Grooming Reminders</h2>
                  <button
                    type="button"
                    onClick={handleSaveGrooming}
                    disabled={!gPet || !gDate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Thêm nhắc nhở
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Thêm nhắc nhở chải chuốt, tắm rửa</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn thú cưng *</label>
                    <select value={gPet} onChange={(e) => setGPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="">Select pet</option>
                      {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhắc nhở *</label>
                    <input type="date" value={gDate} min={todayStr} onChange={(e) => setGDate(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tần suất</label>
                    <select value={gFreq} onChange={(e) => setGFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!gDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!gDate}>
                      <option value="none">Một lần</option>
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly" disabled={!isFrequencyValid(gDate, "weekly")}>Hàng tuần</option>
                      <option value="monthly" disabled={!isFrequencyValid(gDate, "monthly")}>Hàng tháng</option>
                      <option value="yearly" disabled={!isFrequencyValid(gDate, "yearly")}>Hàng năm</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Footer Actions */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Mẹo:</strong> Bạn có thể thêm từng nhắc nhở riêng lẻ bằng nút "Thêm nhắc nhở" ở mỗi section, hoặc điền nhiều section và nhấn "Lưu tất cả" bên dưới.
                  </p>
                  <div className="flex space-x-3">
                    <button onClick={handleCancel} type="button" className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition">Hủy</button>
                    <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition">Lưu tất cả</button>
                  </div>
                </div>
              </div>
            </form>
            </div>
            )}
          </div>
    </CustomerLayout>
  );
};

export default RemindersAuto;
