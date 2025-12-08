// PetCare/frontend/pet-app/src/components/Reminders/Reminder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import { vaccineApi } from "../../api/vaccineApi.js";
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
  return date.toLocaleDateString("en-US", {
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
  const [vVaccineId, setVVaccineId] = useState("");
  const [vDoseNumber, setVDoseNumber] = useState(1);
  const [vVaccines, setVVaccines] = useState([]);
  const [vSchedule, setVSchedule] = useState([]);
  const [vLoadingVaccines, setVLoadingVaccines] = useState(false);
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

  const mapSpeciesToEnglish = (species) => {
    if (!species) return '';
    const normalized = species.toLowerCase().trim();
    const speciesMap = {
      'mèo': 'cat',
      'meo': 'cat',
      'cat': 'cat',
      'chó': 'dog',
      'cho': 'dog',
      'dog': 'dog',
      'chó con': 'dog',
      'mèo con': 'cat',
      'puppy': 'dog',
      'kitten': 'cat',
    };
    return speciesMap[normalized] || normalized;
  };

  useEffect(() => {
    async function loadVaccines() {
      if (!vPet) {
        setVVaccines([]);
        setVVaccineId("");
        setVSchedule([]);
        setVLoadingVaccines(false);
        return;
      }
      const selectedPet = pets.find(p => p.id === vPet);
      if (!selectedPet || !selectedPet.species) {
        setVVaccines([]);
        setVLoadingVaccines(false);
        return;
      }
      try {
        setVLoadingVaccines(true);
        const englishSpecies = mapSpeciesToEnglish(selectedPet.species);
        console.log("Loading vaccines for species:", selectedPet.species, "-> mapped to:", englishSpecies);
        if (!englishSpecies) {
          console.warn("Pet species could not be mapped:", selectedPet.species);
          setVVaccines([]);
          setVLoadingVaccines(false);
          return;
        }
        const vaccines = await vaccineApi.getVaccinesBySpecies(englishSpecies);
        console.log("Loaded vaccines:", vaccines);
        setVVaccines(Array.isArray(vaccines) ? vaccines : []);
      } catch (err) {
        console.error("Failed to load vaccines", err);
        console.error("Error details:", err.response?.data || err.message);
        setVVaccines([]);
      } finally {
        setVLoadingVaccines(false);
      }
    }
    loadVaccines();
  }, [vPet, pets]);

  useEffect(() => {
    async function loadSchedule() {
      if (!vVaccineId) {
        setVSchedule([]);
        return;
      }
      try {
        const schedule = await vaccineApi.getVaccineSchedule(vVaccineId);
        setVSchedule(schedule || []);
        if (schedule && schedule.length > 0) {
          const maxDose = Math.max(...schedule.map(s => s.dose_number));
          if (vDoseNumber > maxDose) {
            setVDoseNumber(1);
          }
        }
      } catch (err) {
        console.error("Failed to load vaccine schedule", err);
        setVSchedule([]);
      }
    }
    loadSchedule();
  }, [vVaccineId]);

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
      showToast("Unable to load reminders list", "error");
    } finally {
      setLoadingReminders(false);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    const result = await showConfirm("Delete Reminder", "Are you sure you want to delete this reminder?");
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/reminders/${reminderId}`);
      showToast("Reminder deleted successfully", "success");
      fetchReminders();
    } catch (err) {
      console.error("Error deleting reminder:", err);
      showToast("Unable to delete reminder", "error");
    }
  };

  const handleMarkDone = async (reminderId) => {
    try {
      await api.put(`/reminders/${reminderId}`, { status: "done" });
      showToast("Marked as completed", "success");
      fetchReminders();
    } catch (err) {
      console.error("Error updating reminder:", err);
      showToast("Unable to update reminder", "error");
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
      showWarning("Missing Information", `Please select a pet for ${typeName}.`);
      return false;
    }
    if (typeName !== "Feeding" && !date) {
      showWarning("Missing Information", `Please select a date for ${typeName}.`);
      return false;
    }
    if (typeName === "Feeding" && !feedingTime) {
      showWarning("Missing Information", "Please select a time for feeding reminder.");
      return false;
    }
    if (typeName !== "Feeding" && !isFrequencyValid(date, freq)) {
      showWarning("Error", `${typeName}: Frequency '${freq}' is too short for date ${date}.`);
      return false;
    }
    if (typeName === "Feeding" && endDate) {
      if (!isRepeating(freq)) {
        showWarning("Error", `${typeName}: End date only applies to repeating reminders.`);
        return false;
      }
      if (new Date(endDate + "T00:00:00Z") < new Date(todayStr + "T00:00:00Z")) {
        showWarning("Error", `${typeName}: End date must be today or later.`);
        return false;
      }
    }
    return true;
  };

  // Hàm lưu một reminder đơn lẻ
  const handleSaveSingleReminder = async (type, payload, resetCallback) => {
    try {
      await api.post("/reminders", payload);
      showSuccess("Success", `${type} reminder added successfully!`);
      if (resetCallback) resetCallback();
      // Refresh reminders list after adding
      fetchReminders();
    } catch (err) {
      console.error(`Failed to save ${type} reminder:`, err);
      const errorMsg = err.response?.data?.error || err.message || `Unable to create ${type} reminder`;
      showError("Lỗi", errorMsg);
    }
  };

  const handleSaveVaccination = async () => {
    if (!validateReminder(vPet, vDate, vFreq, null, "Vaccination", null)) return;
    
    const payload = {
      pet_id: vPet,
      type: "vaccination",
      reminder_date: vDate,
      frequency: vFreq,
      end_date: null,
    };

    if (vVaccineId) {
      payload.vaccine_id = vVaccineId;
      payload.dose_number = vDoseNumber;
    } else if (vaccinationType) {
      payload.vaccination_type = vaccinationType;
    }

    await handleSaveSingleReminder(
      "vaccination",
      payload,
      () => {
        setVPet("");
        setVaccinationType("");
        setVVaccineId("");
        setVDoseNumber(1);
        setVDate("");
        setVFreq("none");
        setVSchedule([]);
      }
    );
  };

  const handleSaveCheckUp = async () => {
    if (!validateReminder(cPet, cDate, cFreq, null, "Check-Up", null)) return;
    await handleSaveSingleReminder(
      "check-up",
      { pet_id: cPet, type: "vet_visit", reminder_date: cDate, frequency: cFreq, end_date: null },
      () => { setCPet(""); setCDate(""); setCFreq("none"); }
    );
  };

  const handleSaveFeeding = async () => {
    if (!validateReminder(fPet, todayStr, fFreq, fEndDate, "Feeding", feedingTime)) return;
    await handleSaveSingleReminder(
      "feeding",
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
      "grooming",
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
    if (isVValid) {
      const vPayload = {
        pet_id: vPet,
        type: "vaccination",
        reminder_date: vDate,
        frequency: vFreq,
        end_date: null,
      };
      if (vVaccineId) {
        vPayload.vaccine_id = vVaccineId;
        vPayload.dose_number = vDoseNumber;
      } else if (vaccinationType) {
        vPayload.vaccination_type = vaccinationType;
      }
      toCreate.push(vPayload);
    }

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
      showWarning("Missing Information", "Please fill at least one reminder section.");
      return;
    }

    try {
      await Promise.all(toCreate.map((payload) => api.post("/reminders", payload)));
      showSuccess("Success", `Saved ${toCreate.length} reminders successfully!`);
      // Refresh reminders list
      fetchReminders();
      // Reset all form fields
      setVPet(""); setVaccinationType(""); setVVaccineId(""); setVDoseNumber(1); setVDate(""); setVFreq("none"); setVSchedule([]);
      setCPet(""); setCDate(""); setCFreq("none");
      setFPet(""); setFeedingTime(""); setFFreq("none"); setFEndDate("");
      setGPet(""); setGDate(""); setGFreq("none");
      // Optionally hide form after saving
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save reminders:", err);
      const errorMsg = err.response?.data?.error || err.message || "Unable to create reminder";
      showError("Lỗi", errorMsg);
    }
  }

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "vaccination", label: "Vaccination" },
    { value: "vet_visit", label: "Health Checkup" },
    { value: "feeding", label: "Feeding" },
    { value: "grooming", label: "Grooming" },
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
                {showForm ? "Hide Form" : "Add Reminder"}
              </button>
            </div>

            {/* Reminders List Section - Always visible */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Reminders List</h2>
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
                  <p className="text-gray-500">Loading reminders list...</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500 text-lg mb-4">
                    {filter === "all"
                      ? "No reminders yet. Create a new reminder!"
                      : "No reminders of this type."}
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
                                : reminder.type === "vaccination" && reminder.vaccine?.name
                                ? `Vaccination: ${reminder.vaccine.name}${reminder.dose_number ? ` - Dose ${reminder.dose_number}` : ""}`
                                : reminder.type === "vet_visit" 
                                ? "Check-Up" 
                                : reminder.type}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Date: {formatDate(reminder.reminder_date)}</span>
                              {reminder.feeding_time && (
                                <span>
                                  Time: {new Date(`2000-01-01T${reminder.feeding_time}`).toLocaleTimeString("en-US", {
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
                                {reminder.status === "done" ? "Completed" : "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {reminder.status !== "done" && (
                            <button
                              onClick={() => handleMarkDone(reminder.reminder_id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Mark as completed"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/reminder/edit/${reminder.reminder_id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(reminder.reminder_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Reminder</h2>

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
                    Add Reminder
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Add vaccination reminders for your pets</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet *</label>
                    <select value={vPet} onChange={(e) => setVPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="">Select pet</option>
                      {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  {vPet && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Type *</label>
                        <select 
                          value={vVaccineId} 
                          onChange={(e) => setVVaccineId(e.target.value)} 
                          disabled={vLoadingVaccines}
                          className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${vLoadingVaccines ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="">
                            {vLoadingVaccines ? 'Loading vaccines...' : 'Select vaccine'}
                          </option>
                          {vVaccines.length > 0 ? (
                            vVaccines.map((v) => (
                              <option key={v.vaccine_id} value={v.vaccine_id}>
                                {v.name}
                              </option>
                            ))
                          ) : !vLoadingVaccines ? (
                            <option value="" disabled>No vaccines available</option>
                          ) : null}
                        </select>
                        {vLoadingVaccines && (
                          <p className="text-xs text-blue-600 mt-1">Loading vaccines for {pets.find(p => p.id === vPet)?.species || 'this pet'}...</p>
                        )}
                        {!vLoadingVaccines && vVaccines.length === 0 && (
                          <p className="text-xs text-yellow-600 mt-1">No vaccines found for {pets.find(p => p.id === vPet)?.species || 'this species'}. Please enter custom vaccine type below.</p>
                        )}
                        {!vLoadingVaccines && vVaccines.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">Or enter custom vaccine type below</p>
                        )}
                      </div>
                      {vVaccineId && vSchedule.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dose Number *</label>
                          <select value={vDoseNumber} onChange={(e) => setVDoseNumber(parseInt(e.target.value))} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                            {vSchedule.map((s) => (
                              <option key={s.schedule_id} value={s.dose_number}>
                                Dose {s.dose_number} {s.is_booster ? "(Booster)" : ""} {s.notes ? `- ${s.notes}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {vVaccineId && vSchedule.length > 0 && vDoseNumber && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-900 mb-2">Upcoming Doses:</p>
                          <ul className="text-xs text-blue-800 space-y-1">
                            {vSchedule
                              .filter(s => s.dose_number > vDoseNumber)
                              .map((s) => {
                                const daysAfter = s.days_after_previous;
                                const nextDate = vDate ? new Date(new Date(vDate).getTime() + daysAfter * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 'Select date first';
                                return (
                                  <li key={s.schedule_id}>
                                    Dose {s.dose_number} {s.is_booster ? "(Booster)" : ""}: {daysAfter} days after ({nextDate})
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custom Vaccine Type (if not in list)</label>
                        <input type="text" placeholder="VD: Dại, FVRCP, ..." value={vaccinationType} onChange={(e) => setVaccinationType(e.target.value)} disabled={!!vVaccineId} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${vVaccineId ? "opacity-50 cursor-not-allowed" : ""}`} />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date *</label>
                    <input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} min={todayStr} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select value={vFreq} onChange={(e) => setVFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!vDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!vDate}>
                      <option value="none">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly" disabled={!isFrequencyValid(vDate, "weekly")}>Weekly</option>
                      <option value="monthly" disabled={!isFrequencyValid(vDate, "monthly")}>Monthly</option>
                      <option value="yearly" disabled={!isFrequencyValid(vDate, "yearly")}>Yearly</option>
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
                    Add Reminder
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Add periodic health checkup reminders</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet *</label>
                    <select value={cPet} onChange={(e) => setCPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="">Select pet</option>
                      {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date *</label>
                    <input type="date" value={cDate} min={todayStr} onChange={(e) => setCDate(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select value={cFreq} onChange={(e) => setCFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!cDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!cDate}>
                      <option value="none">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly" disabled={!isFrequencyValid(cDate, "weekly")}>Weekly</option>
                      <option value="monthly" disabled={!isFrequencyValid(cDate, "monthly")}>Monthly</option>
                      <option value="yearly" disabled={!isFrequencyValid(cDate, "yearly")}>Yearly</option>
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
                    Add Reminder
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Add daily feeding reminders</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet *</label>
                    <select value={fPet} onChange={(e) => setFPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="">Select pet</option>
                      {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feeding Time *</label>
                    <input type="time" value={feedingTime} onChange={(e) => setFeedingTime(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select value={fFreq} onChange={(e) => setFFreq(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="none">Today Only</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                  {fFreq !== "none" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
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
                    Add Reminder
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Add grooming and bathing reminders</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet *</label>
                    <select value={gPet} onChange={(e) => setGPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                      <option value="">Select pet</option>
                      {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date *</label>
                    <input type="date" value={gDate} min={todayStr} onChange={(e) => setGDate(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select value={gFreq} onChange={(e) => setGFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!gDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!gDate}>
                      <option value="none">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly" disabled={!isFrequencyValid(gDate, "weekly")}>Weekly</option>
                      <option value="monthly" disabled={!isFrequencyValid(gDate, "monthly")}>Monthly</option>
                      <option value="yearly" disabled={!isFrequencyValid(gDate, "yearly")}>Yearly</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Footer Actions */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> You can add individual reminders using the "Add Reminder" button in each section, or fill multiple sections and click "Save All" below.
                  </p>
                  <div className="flex space-x-3">
                    <button onClick={handleCancel} type="button" className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition">Cancel</button>
                    <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition">Save All</button>
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
