import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { showSuccess, showError, showWarning } from "../../utils/notifications";

const EditReminder = () => {
  const navigate = useNavigate();
  const { reminderId } = useParams();
  const { user } = useAuth();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminder, setReminder] = useState(null);
  
  // Form states
  const [selectedPet, setSelectedPet] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [frequency, setFrequency] = useState("none");
  const [vaccinationType, setVaccinationType] = useState("");
  const [feedingTime, setFeedingTime] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Load pets
        const petsRes = await api.get("/pets");
        if (Array.isArray(petsRes.data)) {
          setPets(petsRes.data);
        }
        
        // Load reminder
        const reminderRes = await api.get("/reminders");
        const reminders = Array.isArray(reminderRes.data) ? reminderRes.data : [];
        const foundReminder = reminders.find(r => r.reminder_id === reminderId);
        
        if (!foundReminder) {
          showError("Error", "Reminder not found.");
          navigate("/reminder/list");
          return;
        }
        
        setReminder(foundReminder);
        
        // Populate form
        setSelectedPet(foundReminder.pet_id);
        if (foundReminder.reminder_date) {
          const date = new Date(foundReminder.reminder_date);
          setReminderDate(date.toISOString().slice(0, 10));
        }
        setFrequency(foundReminder.frequency || "none");
        setVaccinationType(foundReminder.vaccination_type || "");
        
        if (foundReminder.feeding_time) {
          // Backend stores time in UTC with Vietnam offset adjustment
          // Need to convert back to local time for display
          const time = new Date(foundReminder.feeding_time);
          // Add Vietnam offset (7 hours) to get local time
          const localTime = new Date(time.getTime() + (7 * 60 * 60 * 1000));
          const hours = localTime.getUTCHours().toString().padStart(2, '0');
          const minutes = localTime.getUTCMinutes().toString().padStart(2, '0');
          setFeedingTime(`${hours}:${minutes}`);
        }
        
        if (foundReminder.end_date) {
          const date = new Date(foundReminder.end_date);
          setEndDate(date.toISOString().slice(0, 10));
        }
      } catch (err) {
        console.error("Error loading data:", err);
        showError("Error", "Unable to load reminder data.");
        navigate("/reminder/list");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, reminderId, navigate]);

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

  const handleCancel = (e) => {
    e.preventDefault();
    navigate("/reminder/list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPet) {
      showWarning("Missing Information", "Please select a pet.");
      return;
    }
    
    if (reminder.type === "feeding") {
      if (!feedingTime) {
        showWarning("Missing Information", "Please select feeding time.");
        return;
      }
    } else {
      if (!reminderDate) {
        showWarning("Missing Information", "Please select reminder date.");
        return;
      }
      if (!isFrequencyValid(reminderDate, frequency)) {
        showWarning("Error", `Frequency '${frequency}' is too short for date ${reminderDate}.`);
        return;
      }
    }
    
    if (frequency !== "none" && endDate) {
      if (new Date(endDate + "T00:00:00Z") < new Date(todayStr + "T00:00:00Z")) {
        showWarning("Error", "End date must be today or later.");
        return;
      }
    }

    try {
      const updateData = {
        reminder_date: reminder.type === "feeding" ? todayStr : reminderDate,
        frequency: frequency,
      };
      
      if (reminder.type === "vaccination" && vaccinationType) {
        updateData.vaccination_type = vaccinationType;
      }
      
      if (reminder.type === "feeding" && feedingTime) {
        updateData.feeding_time = feedingTime;
      }
      
      if (frequency !== "none" && endDate) {
        updateData.end_date = endDate;
      } else if (frequency === "none") {
        updateData.end_date = null;
      }
      
      await api.put(`/reminders/${reminderId}`, updateData);
      showSuccess("Success", "Reminder updated successfully!");
      navigate("/reminder/list");
    } catch (err) {
      console.error("Error updating reminder:", err);
      const errorMsg = err.response?.data?.error || err.message || "Unable to update reminder";
      showError("Lỗi", errorMsg);
    }
  };

  if (loading) {
    return (
      <CustomerLayout currentPage="reminder">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (!reminder) {
    return (
      <CustomerLayout currentPage="reminder">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Reminder not found</p>
        </div>
      </CustomerLayout>
    );
  }

  const getReminderTypeLabel = () => {
    switch (reminder.type) {
      case "vaccination": return "💉 Vaccination";
      case "vet_visit":
      case "checkup": return "🏥 Health Checkup";
      case "feeding": return "🍽️ Feeding";
      case "grooming": return "✂️ Grooming";
      default: return "📋 Reminder";
    }
  };

  return (
    <CustomerLayout currentPage="reminder">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Edit Reminder</h1>
            <p className="text-md text-green-700">{getReminderTypeLabel()}</p>
          </div>
          <button
            onClick={() => navigate("/reminder/list")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Back
          </button>
        </div>

        <form className="bg-white p-8 rounded-2xl shadow-md border border-gray-100" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Pet Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pet *</label>
              <select
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300"
                disabled
              >
                <option value="">Select pet</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Cannot change pet after creation</p>
            </div>

            {/* Vaccination Type (only for vaccination) */}
            {reminder.type === "vaccination" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vaccine Type</label>
                <input
                  type="text"
                  placeholder="VD: Dại, FVRCP, ..."
                  value={vaccinationType}
                  onChange={(e) => setVaccinationType(e.target.value)}
                  className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300"
                />
              </div>
            )}

            {/* Feeding Time (only for feeding) */}
            {reminder.type === "feeding" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feeding Time *</label>
                <input
                  type="time"
                  value={feedingTime}
                  onChange={(e) => setFeedingTime(e.target.value)}
                  className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300"
                />
              </div>
            )}

            {/* Reminder Date (not for feeding) */}
            {reminder.type !== "feeding" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Date *</label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  min={todayStr}
                  className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300"
                />
              </div>
            )}

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${
                  reminder.type !== "feeding" && !reminderDate ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={reminder.type !== "feeding" && !reminderDate}
              >
                <option value="none">{reminder.type === "feeding" ? "Today Only" : "Once"}</option>
                <option value="daily">Daily</option>
                {reminder.type !== "feeding" && (
                  <>
                    <option value="weekly" disabled={!isFrequencyValid(reminderDate, "weekly")}>
                      Weekly
                    </option>
                    <option value="monthly" disabled={!isFrequencyValid(reminderDate, "monthly")}>
                      Monthly
                    </option>
                    <option value="yearly" disabled={!isFrequencyValid(reminderDate, "yearly")}>
                      Yearly
                    </option>
                  </>
                )}
              </select>
            </div>

            {/* End Date (only for repeating reminders) */}
            {frequency !== "none" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={todayStr}
                  className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-8 space-x-4 mt-8 border-t border-gray-200">
            <button
              onClick={handleCancel}
              type="button"
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
};

export default EditReminder;

