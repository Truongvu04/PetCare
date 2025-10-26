import React, { useState, useEffect, useRef } from "react"; // 👈 Thêm useRef
import {
  Home, PawPrint, Bell, Heart, DollarSign, Calendar, ShoppingBag, Settings,
  MessageCircle, Scissors, Syringe, MapPin, Stethoscope, Utensils, Activity,
} from "lucide-react";
import "./PetOwnerDashboard.css";
import { useNavigate } from "react-router-dom";

// getReminderIcon function
const getReminderIcon = (type) => {
  switch (type) {
    case "vaccination":
      return <Syringe className="text-green-700" size={18} />;
    case "grooming":
      return <Scissors className="text-green-700" size={18} />;
    case "vet_visit":
    case "checkup":
      return <Stethoscope className="text-green-700" size={18} />;
    case "feeding":
      return <Utensils className="text-green-700" size={18} />;
    // Add case for medication if needed
    // case "medication":
    //   return <Pill className="text-blue-700" size={18} />; // Example
    default: // For 'other' or unknown types
      return <Activity className="text-gray-600" size={18} />; // Use Activity or Bell
  }
};


const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const hasNewRemindersRef = useRef(false); // 👈 Dùng ref để lưu trạng thái có reminder mới hay không

  // Hàm gọi API mark-read (không thay đổi)
  const markRemindersAsReadAPI = async () => {
      try {
          const res = await fetch("http://localhost:5000/api/reminders/mark-read/today", {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' }
          });
          if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              console.warn('Could not mark reminders as read on unmount:', errorData.message || res.status);
          } else {
              const result = await res.json();
              console.log("Marked reminders as read on dashboard unmount:", result.message);
          }
      } catch (error) {
          console.error("❌ Error calling mark-read API on unmount:", error);
      }
  };


// Fetch reminders khi component mount
  useEffect(() => {
    let isMounted = true; // Cờ để kiểm tra component còn mount không

    const fetchRemindersData = async () => {
      try {
        setLoadingReminders(true);
        const res = await fetch("http://localhost:5000/api/reminders");
        if (!res.ok) {
          throw new Error(`Failed to fetch reminders: ${res.status}`);
        }
        const data = await res.json();
        const reminderList = Array.isArray(data) ? data : [];

        if (isMounted) {
            setReminders(reminderList);
            // ✅ Kiểm tra và lưu vào ref xem có reminder mới không
            hasNewRemindersRef.current = reminderList.some(r => r.is_new_today === true);
            console.log("Fetched reminders, has new:", hasNewRemindersRef.current);
        }

      } catch (err) {
        console.error("❌ Error fetching reminders:", err);
        if (isMounted) {
            setReminders([]); // Reset về mảng rỗng nếu lỗi
        }
      } finally {
        if (isMounted) {
            setLoadingReminders(false);
        }
      }
    };

    fetchRemindersData();

    // ✅ Cleanup function: Chạy khi component unmount
    return () => {
      isMounted = false; // Đánh dấu component đã unmount
      // Chỉ gọi API nếu có reminder mới đã được ghi nhận trong ref
      if (hasNewRemindersRef.current) {
        console.log("Dashboard unmounting, calling mark-read API...");
        markRemindersAsReadAPI();
      } else {
        console.log("Dashboard unmounting, no new reminders to mark as read.");
      }
    };
  }, []); // Chỉ chạy 1 lần khi mount

  // menuItems (giữ nguyên)
  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard" },
    { name: "My Pets", icon: <PawPrint size={18} />, path: "/mypets" },
    { name: "Reminders", icon: <Bell size={18} />, path: "/reminder" },
    { name: "Health & Activity", icon: <Heart size={18} />, path: "/health" },
    { name: "Expenses", icon: <DollarSign size={18} /> },
    { name: "Calendar", icon: <Calendar size={18} /> },
    { name: "Shop", icon: <ShoppingBag size={18} /> },
    { name: "Settings", icon: <Settings size={18} /> },
  ];

  // Dữ liệu mẫu (giữ nguyên)
  const shops = [
    { name: "Dog Food", desc: "Premium dog food", img: "https://images.pexels.com/photos/220938/pexels-photo-220938.jpeg" },
    { name: "Cat Toys", desc: "Interactive cat toys", img: "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg" },
    { name: "Caio", desc: "Interactive Caio", img: "https://images.pexels.com/photos/56733/pexels-photo-56733.jpeg" },
    { name: "Tour Pets", desc: "Interactive Tour Pets", img: "https://images.pexels.com/photos/4012470/pexels-photo-4012470.jpeg" },
  ];
  const clinics = [
    { name: "Pet Wellness Clinic", distance: "2 miles away" },
    { name: "Animal Care Center", distance: "3 miles away" },
  ];

  // JSX return (giữ nguyên cấu trúc, logic hiển thị dấu chấm đỏ đã đúng)
  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      <div className="w-full max-w-[1280px] bg-white flex">
        {/* --- Sidebar --- */}
        <aside className="w-64 min-h-screen border-r border-gray-200 p-6 flex flex-col justify-between">
          {/* ... (Sidebar JSX giữ nguyên) ... */}
           <div>
             {/* User Info */}
             <div className="flex items-center space-x-3 mb-8">
               <img
                 src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
                 alt="avatar"
                 className="w-10 h-10 rounded-full object-cover"
               />
               <div>
                 <p className="text-gray-900 font-semibold">Emily Carter</p>
                 <p className="text-gray-500 text-sm">Owner</p>
               </div>
             </div>
             {/* Navigation */}
             <nav className="flex flex-col space-y-2">
               {menuItems.map((item, index) => (
                 <button
                   key={index}
                   onClick={() => item.path && navigate(item.path)}
                   className={`flex items-center space-x-2 text-left px-3 py-2 rounded-lg transition ${
                     item.name === "Dashboard" // Highlight mục hiện tại
                       ? "bg-green-100 text-green-800 font-medium"
                       : "text-gray-700 hover:bg-gray-100"
                   }`}
                 >
                   {item.icon}
                   <span>{item.name}</span>
                 </button>
               ))}
             </nav>
           </div>
           {/* Chat Button */}
           <button className="flex items-center space-x-2 text-gray-900 hover:text-green-700 mt-auto pt-4 border-t border-gray-100">
             <MessageCircle size={18} />
             <span>Chat</span>
           </button>
        </aside>

        {/* --- Main content --- */}
        <main className="flex-1 p-10 overflow-y-auto">
          <h2 className="dashboard text-2xl font-bold text-gray-900 mb-8">
            Dashboard
          </h2>

          {/* --- My Pets Section --- */}
          <section className="mb-10">
            {/* ... (My Pets JSX giữ nguyên) ... */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                 <PawPrint size={18} className="text-green-700" />
                 <span>My Pets</span>
             </h3>
             {/* Nên fetch động danh sách pet ở đây thay vì hardcode */}
             <div className="flex space-x-10">
               {[
                 { name: "Buddy", type: "Dog", img: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg" },
                 { name: "Whiskers", type: "Cat", img: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg" },
               ].map((pet, i) => (
                 <div key={i} className="flex flex-col items-center text-center">
                   <img src={pet.img} alt={pet.name} className="w-24 h-24 rounded-full object-cover mb-2 shadow-sm border border-gray-100" />
                   <p className="font-medium text-gray-800">{pet.name}</p>
                   <p className="text-gray-500 text-sm">{pet.type}</p>
                 </div>
               ))}
                {/* Nút để xem tất cả pet */}
                <button onClick={() => navigate('/mypets')} className="self-center ml-auto text-sm text-green-600 hover:text-green-800 font-medium">View All</button>
             </div>
          </section>

          {/* --- Reminders Section --- */}
          <section className="mb-10">
            {/* ... (Reminders JSX giữ nguyên - dấu chấm đỏ sẽ tự ẩn đi do state update) ... */}
             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
               <Bell size={18} className="text-green-700" />
               <span>Reminders</span>
             </h3>
             {/* Div chứa danh sách reminder với scrollbar */}
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border border-gray-100 rounded-lg p-3 bg-white shadow-sm">
               {loadingReminders ? (
                 <p className="text-gray-500 px-3 py-2">Loading reminders...</p>
               ) : reminders.length === 0 ? (
                 <p className="text-gray-500 px-3 py-2">No upcoming reminders found.</p>
               ) : (
                 reminders.map((r) => (
                   <div
                     key={r.reminder_id}
                     className="relative flex items-center space-x-3 bg-green-50 hover:bg-green-100 p-3 rounded-lg transition-colors duration-150 mr-1 cursor-pointer" // Thêm cursor-pointer nếu muốn click vào được
                     // onClick={() => navigate(`/view-reminder/${r.reminder_id}`)} // Ví dụ: chuyển đến trang chi tiết reminder
                   >
                     {/* Dấu chấm đỏ cho reminder mới tạo trong ngày VÀ chưa đọc */}
                     {r.is_new_today && (
                       <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" title="New today"></span>
                     )}
                     {/* Icon */}
                     <div className="flex-shrink-0">
                         {getReminderIcon(r.type)}
                     </div>
                     {/* Nội dung */}
                     <div className="flex-grow min-w-0"> {/* Giúp text không bị tràn */}
                       <p className="font-medium text-gray-800 truncate">{r.display_title}</p> {/* truncate nếu quá dài */}
                       <p className="text-gray-500 text-sm">{r.subtitle}</p>
                     </div>
                   </div>
                 ))
               )}
             </div>
              {/* Nút để xem tất cả reminders */}
              <div className="text-right mt-2">
                 <button onClick={() => navigate('/reminder')} className="text-sm text-green-600 hover:text-green-800 font-medium">View All & Add New</button>
              </div>
          </section>

          {/* --- Health, Expenses, Shop, Nearby Clinics Sections (giữ nguyên) --- */}
           {/* --- Health Section (Dữ liệu mẫu) --- */}
           <section className="mb-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Heart size={18} className="text-green-700"/>
                  <span>Health</span>
             </h3>
              <div className="space-y-3">
                  {/* Nên fetch động */}
                  {[ { pet: "Buddy", lastVisit: "2 months ago" }, { pet: "Whiskers", lastVisit: "1 month ago" }, ].map((h, i) => ( <div key={i} className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg"> <Heart className="text-green-700" size={18} /> <div> <p className="font-medium text-gray-800">{h.pet}’s checkup</p> <p className="text-gray-500 text-sm">Last visit: {h.lastVisit}</p> </div> </div> ))}
              </div>
               <div className="text-right mt-2">
                 <button onClick={() => navigate('/health')} className="text-sm text-green-600 hover:text-green-800 font-medium">View Health Details</button>
              </div>
           </section>

           {/* --- Expenses Section (Dữ liệu mẫu) --- */}
           <section className="mb-10">
             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                 <DollarSign size={18} className="text-green-700"/>
                 <span>Expenses</span>
             </h3>
             <div className="space-y-3">
                  {/* Nên fetch động */}
                  {[ { pet: "Buddy", item: "food", amount: "$50" }, { pet: "Whiskers", item: "toys", amount: "$30" }, ].map((ex, i) => ( <div key={i} className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg"> <DollarSign className="text-green-700" size={18} /> <div> <p className="font-medium text-gray-800">{ex.pet}’s {ex.item}</p> <p className="text-gray-500 text-sm">Last expense: {ex.amount}</p> </div> </div> ))}
              </div>
               <div className="text-right mt-2">
                 <button /* onClick={() => navigate('/expenses')} */ className="text-sm text-green-600 hover:text-green-800 font-medium">View All Expenses</button>
              </div>
           </section>

           {/* --- Shop Section (Dữ liệu mẫu) --- */}
           <section className="mb-10">
             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                 <ShoppingBag size={18} className="text-green-700"/>
                 <span>Shop Recommendations</span>
             </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {shops.map((item, idx) => ( <div key={idx} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"> <img src={item.img} alt={item.name} className="h-32 w-full object-cover"/> <div className="p-3"> <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p> <p className="text-gray-500 text-xs">{item.desc}</p> </div> </div> ))}
              </div>
               <div className="text-right mt-2">
                  <button /* onClick={() => navigate('/shop')} */ className="text-sm text-green-600 hover:text-green-800 font-medium">Go to Shop</button>
               </div>
           </section>

           {/* --- Nearby Clinics Section (Dữ liệu mẫu) --- */}
           <section>
             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                 <MapPin size={18} className="text-green-700"/>
                 <span>Nearby Clinics</span>
             </h3>
              <div className="space-y-3">
                {clinics.map((clinic, i) => ( <div key={i} className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg"> <MapPin className="text-green-700" size={18} /> <div> <p className="font-medium text-gray-800">{clinic.name}</p> <p className="text-gray-500 text-sm">{clinic.distance}</p> </div> </div> ))}
              </div>
               <div className="text-right mt-2">
                  <button /* onClick={() => navigate('/vet-map')} */ className="text-sm text-green-600 hover:text-green-800 font-medium">View Map</button>
               </div>
           </section>
        </main>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;