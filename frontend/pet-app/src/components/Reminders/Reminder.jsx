// PetCare/frontend/pet-app/src/components/Reminders/Reminder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { showSuccess, showError, showWarning } from "../../utils/notifications";

const RemindersAuto = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [pets, setPets] = useState([]);

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
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to save reminders:", err);
      const errorMsg = err.response?.data?.error || err.message || "Không thể tạo nhắc nhở";
      showError("Lỗi", errorMsg);
    }
  }

  return (
    <CustomerLayout currentPage="reminder">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Set Up Reminders</h1>
                <p className="text-md text-green-700">Schedule reminders for vaccinations, check-ups, feeding, and grooming.</p>
              </div>
              <button
                onClick={() => navigate("/reminder/list")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Xem danh sách
              </button>
            </div>

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
    </CustomerLayout>
  );
};

export default RemindersAuto;
