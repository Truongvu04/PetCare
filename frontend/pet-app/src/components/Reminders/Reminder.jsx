// PetCare/frontend/pet-app/src/components/Reminders/Reminder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, PawPrint, Bell, Heart, DollarSign, Calendar, ShoppingBag, Settings,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js"; // 👈 Thêm import useAuth
import api from "../../api/axiosConfig.js"; // 👈 Thêm import api

const RemindersAuto = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 Lấy user từ context
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [pets, setPets] = useState([]);

  // --- States cho từng loại reminder ---
  // (Giữ nguyên các state: vPet, vaccinationType, vDate, vFreq, cPet, cDate, ...)
  // Vaccination
  const [vPet, setVPet] = useState("");
  const [vaccinationType, setVaccinationType] = useState("");
  const [vDate, setVDate] = useState("");
  const [vFreq, setVFreq] = useState("none");
  // Check-Up
  const [cPet, setCPet] = useState("");
  const [cDate, setCDate] = useState("");
  const [cFreq, setCFreq] = useState("none");
  // Feeding
  const [fPet, setFPet] = useState("");
  const [feedingTime, setFeedingTime] = useState("");
  const [fFreq, setFFreq] = useState("none");
  const [fEndDate, setFEndDate] = useState("");
  // Grooming
  const [gPet, setGPet] = useState("");
  const [gDate, setGDate] = useState("");
  const [gFreq, setGFreq] = useState("none");
  // ------------------------------------

  // useEffect fetch pets (Cập nhật)
  useEffect(() => {
    async function loadPets() {
      if (!user) { // 👈 Nếu chưa login, không làm gì cả
        setPets([]);
        return;
      }
      try {
        // 👈 Dùng api.get('/pets'). Backend sẽ tự lọc pet dựa trên token
        const res = await api.get("/pets"); 
        
        if (Array.isArray(res.data)) {
          setPets(res.data);
        } else {
          console.error("Lỗi: Dữ liệu pets trả về không phải là một mảng!", res.data);
          setPets([]);
        }
      } catch (err) {
        console.error("Failed to load pets from backend", err);
        setPets([]);
      }
    }
    loadPets();
  }, [user]); // 👈 Thêm user vào dependency array

  // handleCancel (giữ nguyên)
  const handleCancel = (e) => {
      e.preventDefault();
      navigate("/dashboard");
   };

  // Hàm tính số ngày chênh lệch (giữ nguyên)
  const calculateDaysDiff = (dateStr1, dateStr2) => {
      if (!dateStr1 || !dateStr2) return Infinity;
      const date1 = new Date(dateStr1 + 'T00:00:00Z');
      const date2 = new Date(dateStr2 + 'T00:00:00Z');
      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return Infinity;
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Hàm kiểm tra tính hợp lệ của frequency (giữ nguyên)
  const isFrequencyValid = (startDateStr, freq) => {
      if (!startDateStr || freq === 'none' || freq === 'daily') return true;
      const daysDiff = calculateDaysDiff(todayStr, startDateStr);
      if (freq === 'weekly' && daysDiff < 7) return false;
      if (freq === 'monthly' && daysDiff < 28) return false;
      if (freq === 'yearly' && daysDiff < 365) return false;
      return true;
  };


  // handleSubmit (cập nhật để dùng api.post)
  async function handleSubmit(e) {
    e.preventDefault();
    const toCreate = [];
    const isRepeating = (freq) => freq !== 'none';

    // Hàm validation chung (giữ nguyên logic)
    const validateReminder = (pet, date, freq, endDate, typeName) => {
        if (!pet || (!date && typeName !== 'Feeding') || (!feedingTime && typeName === 'Feeding') ) return null;
        if (typeName !== 'Feeding' && !isFrequencyValid(date, freq)) {
            alert(`${typeName} Error: Frequency '${freq}' is too short for the selected start date (${date}). Please choose 'None', 'Daily', or a later start date.`);
            return false;
        }
        if (typeName === 'Feeding' && endDate) {
            if (!isRepeating(freq)) {
                 alert(`${typeName} Error: End date is only applicable for repeating reminders (Daily).`);
                 return false;
            }
            if (new Date(endDate + 'T00:00:00Z') < new Date(todayStr + 'T00:00:00Z')) {
                alert(`${typeName} Error: End date (${endDate}) must be on or after today (${todayStr}).`);
                return false;
            }
        }
        return true;
    };

    // Vaccination (Logic giữ nguyên)
    const isVValid = validateReminder(vPet, vDate, vFreq, null, 'Vaccination');
    if (isVValid === false) return;
    if (isVValid === true) {
        toCreate.push({
            pet_id: vPet, type: "vaccination", vaccination_type: vaccinationType || null,
            reminder_date: vDate, frequency: vFreq,
            end_date: null,
        });
    }

    // Check-Up (Logic giữ nguyên)
    const isCValid = validateReminder(cPet, cDate, cFreq, null, 'Check-Up');
    if (isCValid === false) return;
    if (isCValid === true) {
        toCreate.push({
            pet_id: cPet, type: "checkup", reminder_date: cDate, frequency: cFreq,
            end_date: null,
        });
    }

    // Feeding (Logic giữ nguyên)
    const isFValid = validateReminder(fPet, todayStr, fFreq, fEndDate, 'Feeding');
    if (isFValid === false) return;
    if (isFValid === true) {
        toCreate.push({
            pet_id: fPet, type: "feeding", feeding_time: feedingTime,
            reminder_date: todayStr,
            frequency: fFreq,
            end_date: isRepeating(fFreq) ? (fEndDate || null) : null,
        });
    }

    // Grooming (Logic giữ nguyên)
    const isGValid = validateReminder(gPet, gDate, gFreq, null, 'Grooming');
    if (isGValid === false) return;
    if (isGValid === true) {
        toCreate.push({
            pet_id: gPet, type: "grooming", reminder_date: gDate, frequency: gFreq,
            end_date: null,
        });
    }

    // Kiểm tra lại lần nữa xem có cái nào được thêm không (giữ nguyên)
    if (toCreate.length === 0) {
       alert("Please fill information for at least one reminder type (Pet and Date/Time are usually required).");
       return;
     }

    // Gửi API (👈 Cập nhật dùng api.post)
    try {
        console.log("Creating reminders:", toCreate);
        const results = await Promise.all(
          toCreate.map(async (payload) => {
            // 👈 Thay đổi fetch thành api.post
            const res = await api.post("/reminders", payload);
            const responseData = res.data; // 👈 axios trả về data trong .data
            
            // 👈 axios ném lỗi nếu res.ok là false, nên không cần check !res.ok
            return responseData;
          })
        );
        console.log("Reminders created successfully:", results);
        alert("Reminders saved successfully!");
        navigate("/dashboard");
     } catch (err) {
         console.error("Failed to save reminders:", err);
         // 👈 Lấy lỗi từ response của axios nếu có
         const errorMsg = err.response?.data?.error || err.message || `Failed to create reminder`;
         alert(`Failed to save reminders: ${errorMsg}`);
      }
  }

  // --- JSX Structure (Giữ nguyên) ---
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Sidebar (giữ nguyên) */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
           <div>
            <div className="profile flex items-center space-x-3 mb-8">
              <img src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"} alt="profile" className="w-10 h-10 rounded-full object-cover"/>
              <div>
                <p className="font-semibold text-gray-900">{user?.full_name || 'Emily Carter'}</p>
                <p className="owner font-semibold text-gray-500 text-sm">{user?.role || 'Owner'}</p>
              </div>
            </div>
             <nav className="space-y-2">
               <button onClick={() => navigate("/dashboard")} className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left"> <Home size={18} /> Dashboard </button>
               <button onClick={() => navigate("/mypets")} className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left"> <PawPrint size={18} /> My Pets </button>
               <button onClick={() => navigate("/reminder")} className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold w-full"> <Bell size={18} /> Reminders </button>
               <button onClick={() => navigate("/health")} className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left"> <Heart size={18} /> Health & Activity </button>
               <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 cursor-pointer"> <DollarSign size={18} /> <span>Expenses</span> </a>
               <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 cursor-pointer"> <Calendar size={18} /> <span>Calendar</span> </a>
               <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 cursor-pointer"> <ShoppingBag size={18} /> <span>Shop</span> </a>
               <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 cursor-pointer"> <Settings size={18} /> <span>Settings</span> </a>
             </nav>
           </div>
        </aside>

        {/* Main content (Giữ nguyên) */}
        <main className="flex-1 bg-gray-50 p-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1"> Set Up Reminders </h1>
            <p className="text-sm text-green-700 mb-10"> Set up reminders for vaccinations, check-ups, feeding, and grooming. </p>

            <form className="space-y-10" onSubmit={handleSubmit}>
              {/* --- Section: Vaccination --- */}
              <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2"> Vaccination Reminders </h2>
                <div className="space-y-4 mt-4">
                  <select value={vPet} onChange={(e) => setVPet(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300"> <option value="">Select pet (Required if filling this section)</option> {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))} </select>
                  <input type="text" placeholder="Vaccination Type (e.g., Rabies)" value={vaccinationType} onChange={(e) => setVaccinationType(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300" />
                  <input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} min={todayStr} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300" title="Start Date (Required if filling this section)"/>
                  <select value={vFreq} onChange={(e) => setVFreq(e.target.value)} className={`w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300 ${!vDate ? 'cursor-not-allowed opacity-50' : ''}`} disabled={!vDate} title="Frequency">
                      <option value="none">None (Single Reminder)</option>
                      <option value="daily">Daily</option>
                      <option value="weekly" disabled={!isFrequencyValid(vDate, 'weekly')}>Weekly { !isFrequencyValid(vDate, 'weekly') ? '(Date too soon)' : ''}</option>
                      <option value="monthly" disabled={!isFrequencyValid(vDate, 'monthly')}>Monthly { !isFrequencyValid(vDate, 'monthly') ? '(Date too soon)' : ''}</option>
                      <option value="yearly" disabled={!isFrequencyValid(vDate, 'yearly')}>Yearly { !isFrequencyValid(vDate, 'yearly') ? '(Date too soon)' : ''}</option>
                  </select>
                </div>
              </section>

              {/* --- Section: Check-Up --- */}
              <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                   <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2"> Check-Up Reminders </h2>
                   <div className="space-y-4 mt-4">
                     <select value={cPet} onChange={(e) => setCPet(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300"> <option value="">Select pet (Required if filling this section)</option> {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))} </select>
                     <input type="date" value={cDate} min={todayStr} onChange={(e) => setCDate(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300" title="Date (Required if filling this section)"/>
                     <select value={cFreq} onChange={(e) => setCFreq(e.target.value)} className={`w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300 ${!cDate ? 'cursor-not-allowed opacity-50' : ''}`} disabled={!cDate} title="Frequency">
                         <option value="none">None (Single Reminder)</option>
                         <option value="daily">Daily</option>
                         <option value="weekly" disabled={!isFrequencyValid(cDate, 'weekly')}>Weekly { !isFrequencyValid(cDate, 'weekly') ? '(Date too soon)' : ''}</option>
                         <option value="monthly" disabled={!isFrequencyValid(cDate, 'monthly')}>Monthly { !isFrequencyValid(cDate, 'monthly') ? '(Date too soon)' : ''}</option>
                         <option value="yearly" disabled={!isFrequencyValid(cDate, 'yearly')}>Yearly { !isFrequencyValid(cDate, 'yearly') ? '(Date too soon)' : ''}</option>
                     </select>
                   </div>
              </section>

              {/* --- Section: Feeding --- */}
              <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                 <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2"> Feeding Reminders </h2>
                 <div className="space-y-4 mt-4">
                   <select value={fPet} onChange={(e) => setFPet(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300"> <option value="">Select pet (Required if filling this section)</option> {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))} </select>
                   <input type="time" value={feedingTime} onChange={(e) => setFeedingTime(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300" title="Feeding Time (Required if filling this section)" />
                   <select value={fFreq} onChange={(e) => setFFreq(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300" title="Frequency">
                     <option value="none">Today Only</option>
                     <option value="daily">Daily</option>
                   </select>
                   {fFreq !== 'none' && ( <input type="date" value={fEndDate} onChange={(e) => setFEndDate(e.target.value)} min={todayStr} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300" title="Repeat Until (Optional)"/> )}
                 </div>
              </section>

              {/* --- Section: Grooming --- */}
              <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-900 mb-4 border-b pb-2"> Grooming Reminders </h2>
                   <div className="space-y-4 mt-4">
                     <select value={gPet} onChange={(e) => setGPet(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300"> <option value="">Select pet (Required if filling this section)</option> {pets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))} </select>
                     <input type="date" value={gDate} min={todayStr} onChange={(e) => setGDate(e.target.value)} className="w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300" title="Date (Required if filling this section)" />
                     <select value={gFreq} onChange={(e) => setGFreq(e.target.value)} className={`w-full bg-green-50 rounded-lg p-3 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 border border-gray-200 focus:outline-none focus:border-green-300 ${!gDate ? 'cursor-not-allowed opacity-50' : ''}`} disabled={!gDate} title="Frequency">
                         <option value="none">None (Single Reminder)</option>
                         <option value="daily">Daily</option>
                         <option value="weekly" disabled={!isFrequencyValid(gDate, 'weekly')}>Weekly { !isFrequencyValid(gDate, 'weekly') ? '(Date too soon)' : ''}</option>
                         <option value="monthly" disabled={!isFrequencyValid(gDate, 'monthly')}>Monthly { !isFrequencyValid(gDate, 'monthly') ? '(Date too soon)' : ''}</option>
                         <option value="yearly" disabled={!isFrequencyValid(gDate, 'yearly')}>Yearly { !isFrequencyValid(gDate, 'yearly') ? '(Date too soon)' : ''}</option>
                     </select>
                   </div>
              </section>

              {/* Save/Cancel buttons (giữ nguyên) */}
              <div className="flex justify-end pt-6">
                 <button onClick={handleCancel} type="button" className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition mr-4"> Cancel </button>
                 <button type="submit" className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"> Save Reminders </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RemindersAuto;