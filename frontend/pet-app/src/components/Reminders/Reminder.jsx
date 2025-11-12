// PetCare/frontend/pet-app/src/components/Reminders/Reminder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, PawPrint, Bell, Heart, DollarSign, Calendar, ShoppingBag, Settings,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";

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

  async function handleSubmit(e) {
    e.preventDefault();
    const toCreate = [];
    const isRepeating = (freq) => freq !== "none";

    const validateReminder = (pet, date, freq, endDate, typeName) => {
      if (!pet || (!date && typeName !== "Feeding") || (!feedingTime && typeName === "Feeding")) return null;
      if (typeName !== "Feeding" && !isFrequencyValid(date, freq)) {
        alert(`${typeName} Error: Frequency '${freq}' too short for ${date}.`);
        return false;
      }
      if (typeName === "Feeding" && endDate) {
        if (!isRepeating(freq)) {
          alert(`${typeName} Error: End date only for repeating reminders.`);
          return false;
        }
        if (new Date(endDate + "T00:00:00Z") < new Date(todayStr + "T00:00:00Z")) {
          alert(`${typeName} Error: End date must be today or later.`);
          return false;
        }
      }
      return true;
    };

    // Vaccination
    const isVValid = validateReminder(vPet, vDate, vFreq, null, "Vaccination");
    if (isVValid === false) return;
    if (isVValid) toCreate.push({ pet_id: vPet, type: "vaccination", vaccination_type: vaccinationType || null, reminder_date: vDate, frequency: vFreq, end_date: null });

    // Check-Up
    const isCValid = validateReminder(cPet, cDate, cFreq, null, "Check-Up");
    if (isCValid === false) return;
    if (isCValid) toCreate.push({ pet_id: cPet, type: "checkup", reminder_date: cDate, frequency: cFreq, end_date: null });

    // Feeding
    const isFValid = validateReminder(fPet, todayStr, fFreq, fEndDate, "Feeding");
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
    const isGValid = validateReminder(gPet, gDate, gFreq, null, "Grooming");
    if (isGValid === false) return;
    if (isGValid) toCreate.push({ pet_id: gPet, type: "grooming", reminder_date: gDate, frequency: gFreq, end_date: null });

    if (toCreate.length === 0) {
      alert("Please fill at least one reminder section.");
      return;
    }

    try {
      await Promise.all(toCreate.map((payload) => api.post("/reminders", payload)));
      alert("Reminders saved successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to save reminders:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to create reminder";
      alert(`Failed: ${errorMsg}`);
    }
  }

  // --- JSX with improved UI ---
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between rounded-xl shadow-sm">
          <div>
            <div className="profile flex items-center space-x-3 mb-8">
              <img
                src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"}
                alt="profile"
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-400 transition"
              />
              <div>
                <p className="font-semibold text-gray-900">{user?.full_name || "Emily Carter"}</p>
              </div>
            </div>
            <nav className="space-y-2">
              <button onClick={() => navigate("/dashboard")} className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Home size={18} /> Dashboard
              </button>
              <button onClick={() => navigate("/mypets")} className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <PawPrint size={18} /> My Pets
              </button>
              <button onClick={() => navigate("/reminder")} className="text-green-800 font-semibold flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 w-full text-left transition">
                <Bell size={18} /> Reminders
              </button>
              <button onClick={() => navigate("/health")} className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Heart size={18} /> Health & Activity
              </button>
              <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
              <DollarSign size={18} /> Expenses
              </button>
              <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Calendar size={18} /> Calendar
              </button>
              <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <ShoppingBag size={18} /> Shop
              </button>
              <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Settings size={18} /> Settings
              </button>             
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Set Up Reminders</h1>
            <p className="text-md text-green-700 mb-12">Schedule reminders for vaccinations, check-ups, feeding, and grooming.</p>

            <form className="space-y-12" onSubmit={handleSubmit}>
              {/* Vaccination */}
              <section className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <h2 className="font-semibold text-gray-900 mb-5 border-b border-gray-200 pb-2 text-lg">Vaccination Reminders</h2>
                <div className="space-y-5">
                  <select value={vPet} onChange={(e) => setVPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                    <option value="">Select pet</option>
                    {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                  <input type="text" placeholder="Vaccination Type" value={vaccinationType} onChange={(e) => setVaccinationType(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  <input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} min={todayStr} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  <select value={vFreq} onChange={(e) => setVFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!vDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!vDate}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly" disabled={!isFrequencyValid(vDate, "weekly")}>Weekly</option>
                    <option value="monthly" disabled={!isFrequencyValid(vDate, "monthly")}>Monthly</option>
                    <option value="yearly" disabled={!isFrequencyValid(vDate, "yearly")}>Yearly</option>
                  </select>
                </div>
              </section>

              {/* Check-Up */}
              <section className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <h2 className="font-semibold text-gray-900 mb-5 border-b border-gray-200 pb-2 text-lg">Check-Up Reminders</h2>
                <div className="space-y-5">
                  <select value={cPet} onChange={(e) => setCPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                    <option value="">Select pet</option>
                    {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                  <input type="date" value={cDate} min={todayStr} onChange={(e) => setCDate(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  <select value={cFreq} onChange={(e) => setCFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!cDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!cDate}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly" disabled={!isFrequencyValid(cDate, "weekly")}>Weekly</option>
                    <option value="monthly" disabled={!isFrequencyValid(cDate, "monthly")}>Monthly</option>
                    <option value="yearly" disabled={!isFrequencyValid(cDate, "yearly")}>Yearly</option>
                  </select>
                </div>
              </section>

              {/* Feeding */}
              <section className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <h2 className="font-semibold text-gray-900 mb-5 border-b border-gray-200 pb-2 text-lg">Feeding Reminders</h2>
                <div className="space-y-5">
                  <select value={fPet} onChange={(e) => setFPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                    <option value="">Select pet</option>
                    {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                  <input type="time" value={feedingTime} onChange={(e) => setFeedingTime(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  <select value={fFreq} onChange={(e) => setFFreq(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                    <option value="none">Today Only</option>
                    <option value="daily">Daily</option>
                  </select>
                  {fFreq !== "none" && (
                    <input type="date" value={fEndDate} onChange={(e) => setFEndDate(e.target.value)} min={todayStr} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  )}
                </div>
              </section>

              {/* Grooming */}
              <section className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <h2 className="font-semibold text-gray-900 mb-5 border-b border-gray-200 pb-2 text-lg">Grooming Reminders</h2>
                <div className="space-y-5">
                  <select value={gPet} onChange={(e) => setGPet(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300">
                    <option value="">Select pet</option>
                    {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                  <input type="date" value={gDate} min={todayStr} onChange={(e) => setGDate(e.target.value)} className="w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300" />
                  <select value={gFreq} onChange={(e) => setGFreq(e.target.value)} className={`w-full bg-green-50 rounded-xl p-3 text-sm text-gray-800 focus:ring-2 focus:ring-green-400 border border-gray-200 focus:outline-none focus:border-green-300 ${!gDate ? "cursor-not-allowed opacity-50" : ""}`} disabled={!gDate}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly" disabled={!isFrequencyValid(gDate, "weekly")}>Weekly</option>
                    <option value="monthly" disabled={!isFrequencyValid(gDate, "monthly")}>Monthly</option>
                    <option value="yearly" disabled={!isFrequencyValid(gDate, "yearly")}>Yearly</option>
                  </select>
                </div>
              </section>

              <div className="flex justify-end pt-8 space-x-4">
                <button onClick={handleCancel} type="button" className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition">Save Reminders</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RemindersAuto;
