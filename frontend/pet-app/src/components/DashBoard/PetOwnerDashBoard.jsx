import React, { useState, useEffect, useRef } from "react";
import {
  Home, PawPrint, Bell, Heart, DollarSign, Calendar, ShoppingBag, Settings,
  MessageCircle, Scissors, Syringe, MapPin, Stethoscope, Utensils, Activity, FileText,
} from "lucide-react";
// --- THAY ĐỔI 1: Import 'Link' ---
import { useNavigate, Link } from "react-router-dom"; 
// ----------------------------------
import { useAuth } from "../../hooks/useAuth.js"; // 👈 Thêm
import api from "../../api/axiosConfig.js"; // 👈 Thêm
import QuickAccessCards from "./QuickAccessCards.jsx";

// getReminderIcon function (Giữ nguyên)
const getReminderIcon = (type) => {
  switch (type) {
    case "vaccination":
      return <Syringe className="text-green-700" size={18} />;
    case "grooming":
      return <Scissors className="text-green-700" size={18} />;
    case "vet_visit":
    case "checkup": // 👈 Thêm checkup
      return <Stethoscope className="text-green-700" size={18} />;
    case "feeding":
      return <Utensils className="text-green-700" size={18} />;
    default:
      return <Activity className="text-gray-600" size={18} />;
  }
};


const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 Lấy user
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const hasNewRemindersRef = useRef(false);

  // 🟢 ADD: Fetch pets same as MyPets
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  // Hàm gọi API mark-read (Cập nhật dùng api.put)
  const markRemindersAsReadAPI = async () => {
      try {
          // 👈 Dùng api.put
          const res = await api.put("/reminders/mark-read/today");
          console.log("Marked reminders as read on dashboard unmount:", res.data.message);
      } catch (error) {
          console.error("❌ Error calling mark-read API on unmount:", error.response?.data?.message || error.message);
      }
  };

  useEffect(() => {
    const fetchPets = async () => {
      if (!user) {
        setLoadingPets(false);
        setPets([]);
        return;
      }
      try {
        setLoadingPets(true);
        const res = await api.get("/pets");
        const data = res.data;
        if (Array.isArray(data)) setPets(data);
        else setPets([]);
      } catch (err) {
        console.error("❌ Error fetching pets in Dashboard:", err);
        setPets([]);
      } finally {
        setLoadingPets(false);
      }
    };
    fetchPets();
  }, [user]);

// Fetch reminders khi component mount (Cập nhật dùng api.get)
  useEffect(() => {
    let isMounted = true; 

    const fetchRemindersData = async () => {
      // 👈 Chỉ fetch nếu đã login
      if (!user) {
        setLoadingReminders(false);
        setReminders([]);
        return;
      }
      
      try {
        setLoadingReminders(true);
        const res = await api.get("/reminders"); // 👈 Dùng api.get
        const data = res.data; // 👈 axios trả về trong .data
        
        const reminderList = Array.isArray(data) ? data : [];

        if (isMounted) {
            setReminders(reminderList);
            hasNewRemindersRef.current = reminderList.some(r => r.is_new_today === true);
            console.log("Fetched reminders, has new:", hasNewRemindersRef.current);
        }

      } catch (err) {
        console.error("❌ Error fetching reminders:", err);
        if (isMounted) {
            setReminders([]);
        }
      } finally {
        if (isMounted) {
            setLoadingReminders(false);
        }
      }
    };

    fetchRemindersData();

    // ✅ Cleanup function (Giữ nguyên)
    return () => {
      isMounted = false;
      if (hasNewRemindersRef.current) {
        console.log("Dashboard unmounting, calling mark-read API...");
        markRemindersAsReadAPI();
      } else {
        console.log("Dashboard unmounting, no new reminders to mark as read.");
      }
    };
  }, [user]); // 👈 Phụ thuộc vào user

  // menuItems (giữ nguyên)
  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard" },
    { name: "My Pets", icon: <PawPrint size={18} />, path: "/mypets" },
    { name: "Reminders", icon: <Bell size={18} />, path: "/reminder" },
    { name: "Health & Activity", icon: <Heart size={18} />, path: "/health" },
    { name: "My Orders", icon: <FileText size={18} />, path: "/orders" },
    { name: "Shop", icon: <ShoppingBag size={18} />, path: "/shops" },
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

  // JSX return (Cập nhật user info)
  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      <div className="w-full max-w-[1280px] bg-white flex">
        {/* --- Sidebar --- */}
        <aside className="w-64 min-h-screen border-r border-gray-200 p-6 flex flex-col justify-between">
           <div>
             {/* User Info (Cập nhật) */}
             <div className="flex items-center space-x-3 mb-8">
               {/* --- THAY ĐỔI 2: Bọc <img> bằng <Link> --- */}
               <Link to="/">
                 <img
                   src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"}
                   alt="avatar"
                   className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-400 transition"
                 />
               </Link>
               {/* ------------------------------------------- */}
               <div>
                 <p className="text-gray-900 font-semibold">{user?.full_name || "Khách"}</p>
                 {/* <p className="text-gray-500 text-sm">{user?.role || "Owner"}</p> */}
               </div>
             </div>
             {/* Navigation (Giữ nguyên) */}
             <nav className="flex flex-col space-y-2">
               {menuItems.map((item, index) => (
                 <button
                   key={index}
                   onClick={() => item.path && navigate(item.path)}
                   className={`flex items-center space-x-2 text-left px-3 py-2 rounded-lg transition ${
                     item.name === "Dashboard"
                       ? "bg-green-100 text-green-800 font-medium"
                       : "text-gray-700 hover:bg-gray-100"
                   }`}>
                   {item.icon}
                   <span>{item.name}</span>
                 </button>
               ))}
             </nav>
           </div>
           {/* Chat Button (Giữ nguyên) */}
           <button className="flex items-center space-x-2 text-gray-900 hover:text-green-700 mt-auto pt-4 border-t border-gray-100">
             <MessageCircle size={18} />
             <span>Chat</span>
           </button>
        </aside>

        {/* --- Main content --- */}
        <main className="flex-1 p-10 overflow-y-auto">
          <QuickAccessCards />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-5">
            Dashboard
          </h2>
          
          {/* 👈 Thêm chào mừng user */}
          {!user && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              Chào mừng! Vui lòng <a href="/login" className="font-bold underline">đăng nhập</a> để xem thú cưng và nhắc nhở của bạn.
            </div>
          )}

          {/* --- My Pets Section --- */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <PawPrint size={18} className="text-green-700" />
              <span>My Pets</span>
            </h3>

            {loadingPets ? (
              <p className="text-gray-500 px-3 py-2">Loading pets...</p>
            ) : !user ? (
              <p className="text-gray-500 px-3 py-2">Login to see your pets.</p>
            ) : pets.length === 0 ? (
              <p className="text-gray-500 px-3 py-2">No pets found.</p>
            ) : (
              <div className="flex space-x-10">
                {pets.slice(0, 2).map((pet, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <img
                      src={
                        pet.photo_url
                          ? pet.photo_url.startsWith("http")
                            ? pet.photo_url
                            : `http://localhost:5000${pet.photo_url}`
                          : "https://via.placeholder.com/100?text=No+Image"
                      }
                      alt={pet.name}
                      className="w-24 h-24 rounded-full object-cover mb-2 shadow-sm border border-gray-100"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/100?text=No+Image")
                      }/>
                    <p className="font-medium text-gray-800">{pet.name}</p>
                    <p className="text-green-600 text-sm">{pet.species}</p>
                  </div>
                ))}
                <button
                  onClick={() => navigate("/mypets")}
                  className="self-center ml-auto text-sm text-green-600 hover:text-green-800">
                  View All
                </button>
              </div>
            )}
          </section>

          {/* --- Reminders Section --- */}
          <section className="mb-10">
             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
               <Bell size={18} className="text-green-700" />
               <span>Reminders</span>
             </h3>
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border border-gray-100 rounded-lg p-3 bg-white shadow-sm">
               {/* 👈 Cập nhật logic loading/user */}
               {loadingReminders ? (
                 <p className="text-gray-500 px-3 py-2">Loading reminders...</p>
               ) : !user ? (
                 <p className="text-gray-500 px-3 py-2">Login to see reminders.</p>
               ) : reminders.length === 0 ? (
                 <p className="text-gray-500 px-3 py-2">No upcoming reminders found.</p>
               ) : (
                 reminders.map((r) => (
                   <div
                     key={r.reminder_id}
                     className="relative flex items-center space-x-3 bg-green-50 hover:bg-green-100 p-3 rounded-lg transition-colors duration-150 mr-1 cursor-pointer"
                   >
                     {r.is_new_today && (
                       <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" title="New today"></span>
                     )}
                     <div className="flex-shrink-0">
                         {getReminderIcon(r.type)}
                     </div>
                     <div className="flex-grow min-w-0">
                       <p className="font-medium text-gray-800 truncate">{r.display_title}</p>
                       <p className="text-gray-500 text-sm">{r.subtitle}</p>
                     </div>
                   </div>
                 ))
               )}
             </div>
              <div className="text-right mt-2">
                 <button onClick={() => navigate('/reminder')} className="text-sm text-green-600 hover:text-green-800 font-medium">View All & Add New</button>
              </div>
          </section>

           {/* --- Health Section (Giữ nguyên) --- */}
           <section className="mb-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Heart size={18} className="text-green-700"/>
                  <span>Health</span>
             </h3>
              <div className="space-y-3">
                  {[ { pet: "Buddy", lastVisit: "2 months ago" }, { pet: "Whiskers", lastVisit: "1 month ago" }, ].map((h, i) => ( <div key={i} className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg"> <Heart className="text-green-7Com" size={18} /> <div> <p className="font-medium text-gray-800">{h.pet}’s checkup</p> <p className="text-gray-500 text-sm">Last visit: {h.lastVisit}</p> </div> </div> ))}
              </div>
               <div className="text-right mt-2">
                 <button onClick={() => navigate('/health')} className="text-sm text-green-600 hover:text-green-800 font-medium">View Health Details</button>
              </div>
           </section>

           {/* --- Expenses Section (Giữ nguyên) --- */}
           <section className="mb-10">
             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                 <DollarSign size={18} className="text-green-700"/>
                 <span>Expenses</span>
             </h3>
             <div className="space-y-3">
                  {[ { pet: "Buddy", item: "food", amount: "$50" }, { pet: "Whiskers", item: "toys", amount: "$30" }, ].map((ex, i) => ( <div key={i} className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg"> <DollarSign className="text-green-700" size={18} /> <div> <p className="font-medium text-gray-800">{ex.pet}’s {ex.item}</p> <p className="text-gray-500 text-sm">Last expense: {ex.amount}</p> </div> </div> ))}
              </div>
               <div className="text-right mt-2">
                 <button className="text-sm text-green-600 hover:text-green-800 font-medium">View All Expenses</button>
              </div>
           </section>

           {/* --- Shop Section (Giữ nguyên) --- */}
           <section className="mb-10">
             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                 <ShoppingBag size={18} className="text-green-700"/>
                 <span>Shop Recommendations</span>
             </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {shops.map((item, idx) => ( <div key={idx} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"> <img src={item.img} alt={item.name} className="h-32 w-full object-cover"/> <div className="p-3"> <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p> <p className="text-gray-500 text-xs">{item.desc}</p> </div> </div> ))}
              </div>
               <div className="text-right mt-2">
                  <button className="text-sm text-green-600 hover:text-green-800 font-medium">Go to Shop</button>
               </div>
           </section>

           {/* --- Nearby Clinics Section (Giữ nguyên) --- */}
           <section>
             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                 <MapPin size={18} className="text-green-700"/>
                 <span>Nearby Clinics</span>
             </h3>
              <div className="space-y-3">
                {clinics.map((clinic, i) => ( <div key={i} className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg"> <MapPin className="text-green-700" size={18} /> <div> <p className="font-medium text-gray-800">{clinic.name}</p> <p className="text-gray-500 text-sm">{clinic.distance}</p> </div> </div> ))}
              </div>
               <div className="text-right mt-2">
                  <button className="text-sm text-green-600 hover:text-green-800 font-medium">View Map</button>
               </div>
           </section>
        </main>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;