import React, { useState, useEffect, useRef } from "react";
import {
  Home, PawPrint, Bell, Heart, DollarSign, Calendar, ShoppingBag, Settings,
  MessageCircle, Scissors, Syringe, MapPin, Stethoscope, Utensils, Activity, FileText,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import { healthApi } from "../../api/healthApi.js";
import { expenseApi } from "../../api/expenseApi.js";
import QuickAccessCards from "./QuickAccessCards.jsx";
import CustomerLayout from "./CustomerLayout.jsx";

// getReminderIcon function (Giữ nguyên)
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
    default:
      return <Activity className="text-gray-600" size={18} />;
  }
};

const formatMonthsAgo = (dateString) => {
  const recordDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - recordDate);
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  if (diffMonths === 0) {
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }
  if (diffMonths === 1) return "1 month ago";
  return `${diffMonths} months ago`;
};

const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const categoryLabels = {
  food: "Food",
  medicine: "Medicine",
  accessories: "Accessories",
  vet_visit: "Vet Visit",
  grooming: "Grooming",
  other: "Other",
};


const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const hasNewRemindersRef = useRef(false);

  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const [healthRecords, setHealthRecords] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [hasNewCartItems, setHasNewCartItems] = useState(false);
  const [hasNewPets, setHasNewPets] = useState(false);
  const [hasNewRemindersToday, setHasNewRemindersToday] = useState(false);
  const [hasNewHealthToday, setHasNewHealthToday] = useState(false);
  const [hasNewExpensesToday, setHasNewExpensesToday] = useState(false);

  const getReadStatusKey = (type) => {
    const today = new Date().toISOString().split('T')[0];
    return `read_${type}_${user?.user_id || 'guest'}_${today}`;
  };

  const isRead = (type) => {
    if (!user) return true;
    const key = getReadStatusKey(type);
    return localStorage.getItem(key) === 'true';
  };

  const markAsRead = (type) => {
    if (!user) return;
    const key = getReadStatusKey(type);
    localStorage.setItem(key, 'true');
    
    window.dispatchEvent(new CustomEvent('dataRead', { detail: { type } }));
    
    if (type === 'reminders') setHasNewRemindersToday(false);
    if (type === 'health') setHasNewHealthToday(false);
    if (type === 'expenses') setHasNewExpensesToday(false);
    if (type === 'orders') setHasNewOrders(false);
    if (type === 'cart') setHasNewCartItems(false);
    if (type === 'pets') setHasNewPets(false);
  };

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

    return () => {
      isMounted = false;
      if (hasNewRemindersRef.current) {
        console.log("Dashboard unmounting, calling mark-read API...");
        markRemindersAsReadAPI();
      } else {
        console.log("Dashboard unmounting, no new reminders to mark as read.");
      }
    };
  }, [user]);

  useEffect(() => {
    const fetchHealthRecords = async () => {
      if (!user || pets.length === 0) {
        setLoadingHealth(false);
        setHealthRecords([]);
        return;
      }

      try {
        setLoadingHealth(true);
        const allRecords = [];

        const fetchPromises = pets.map(async (pet) => {
          try {
            const response = await healthApi.getHealthRecords(pet.id);
            if (response && response.success && response.records && Array.isArray(response.records) && response.records.length > 0) {
              const healthNoteRecords = response.records
                .filter(r => r.record_type === "health_note")
                .sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
              
              if (healthNoteRecords.length > 0) {
                const latestRecord = healthNoteRecords[0];
                return {
                  pet_id: pet.id,
                  pet_name: pet.name,
                  record_date: latestRecord.record_date,
                  health_note: latestRecord.health_note,
                };
              }
            }
            return null;
          } catch (err) {
            console.error(`Error fetching health records for pet ${pet.id} (${pet.name}):`, err);
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        const validRecords = results.filter(record => record !== null);

        setHealthRecords(validRecords.sort((a, b) => new Date(b.record_date) - new Date(a.record_date)));
      } catch (err) {
        console.error("Error fetching health records:", err);
        setHealthRecords([]);
      } finally {
        setLoadingHealth(false);
      }
    };

    if (pets.length > 0) {
      fetchHealthRecords();
    }
  }, [user, pets, location.pathname]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) {
        setLoadingExpenses(false);
        setExpenses([]);
        return;
      }

      try {
        setLoadingExpenses(true);
        const response = await expenseApi.getExpenses();
        
        if (response.success && response.expenses) {
          const expenseMap = new Map();
          
          response.expenses.forEach((expense) => {
            const petId = expense.pet_id;
            if (!expenseMap.has(petId) || new Date(expense.expense_date) > new Date(expenseMap.get(petId).expense_date)) {
              expenseMap.set(petId, expense);
            }
          });

          const latestExpenses = Array.from(expenseMap.values())
            .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
            .slice(0, 5);

          setExpenses(latestExpenses);
        } else {
          setExpenses([]);
        }
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setExpenses([]);
      } finally {
        setLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, [user]);

  useEffect(() => {
    const checkNewData = async () => {
      if (!user) {
        setHasNewOrders(false);
        setHasNewCartItems(false);
        setHasNewPets(false);
        setHasNewRemindersToday(false);
        setHasNewHealthToday(false);
        setHasNewExpensesToday(false);
        return;
      }

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        try {
          const ordersRes = await api.get("/orders");
          if (ordersRes.data && Array.isArray(ordersRes.data)) {
            const hasNewOrder = ordersRes.data.some(order => {
              const orderDate = new Date(order.created_at || order.order_date);
              return orderDate >= today && orderDate < tomorrow;
            });
            setHasNewOrders(hasNewOrder && !isRead('orders'));
          }
        } catch (err) {
          console.error("Error checking orders:", err);
        }

        try {
          const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
          setHasNewCartItems(cartItems.length > 0 && !isRead('cart'));
        } catch (err) {
          console.error("Error checking cart:", err);
        }

        if (pets.length > 0) {
          const hasNewPet = pets.some(pet => {
            if (pet.created_at) {
              const petDate = new Date(pet.created_at);
              return petDate >= today && petDate < tomorrow;
            }
            return false;
          });
          setHasNewPets(hasNewPet && !isRead('pets'));
        }

        if (reminders.length > 0) {
          const hasNewReminder = reminders.some(r => r.is_new_today === true);
          setHasNewRemindersToday(hasNewReminder && !isRead('reminders'));
        }

        if (healthRecords.length > 0) {
          const hasNewHealth = healthRecords.some(r => {
            const recordDate = new Date(r.record_date);
            return recordDate >= today && recordDate < tomorrow;
          });
          setHasNewHealthToday(hasNewHealth && !isRead('health'));
        }

        if (expenses.length > 0) {
          const hasNewExpense = expenses.some(e => {
            const expenseDate = new Date(e.expense_date);
            return expenseDate >= today && expenseDate < tomorrow;
          });
          setHasNewExpensesToday(hasNewExpense && !isRead('expenses'));
        }
      } catch (err) {
        console.error("Error checking new data:", err);
      }
    };

    checkNewData();
  }, [user, pets, reminders, healthRecords, expenses, location.pathname]);

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

  return (
    <CustomerLayout currentPage="dashboard">
          <QuickAccessCards 
            hasNewOrders={hasNewOrders}
            hasNewCartItems={hasNewCartItems}
            hasNewPets={hasNewPets}
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-5">
            Dashboard
          </h2>
          
          {/* 👈 Thêm chào mừng user */}
          {!user && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              Welcome! Please <a href="/login" className="font-bold underline">login</a> to view your pets and reminders.
            </div>
          )}

          {/* --- My Pets Section --- */}
          <section className="mb-8 sm:mb-10">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <PawPrint size={18} className="text-green-700" />
              <span>My Pets</span>
            </h3>

            {loadingPets ? (
              <p className="text-gray-500 px-3 py-2 text-sm">Loading pets...</p>
            ) : !user ? (
              <p className="text-gray-500 px-3 py-2 text-sm">Login to see your pets.</p>
            ) : pets.length === 0 ? (
              <p className="text-gray-500 px-3 py-2 text-sm">No pets found.</p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:space-x-6 lg:space-x-10 space-y-4 sm:space-y-0">
                {pets.slice(0, 2).map((pet, i) => (
                  <div key={i} className="flex sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0">
                    <img
                      src={
                        pet.photo_url
                          ? pet.photo_url.startsWith("http")
                            ? pet.photo_url
                            : `http://localhost:5000${pet.photo_url}`
                          : "https://via.placeholder.com/100?text=No+Image"
                      }
                      alt={pet.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-0 sm:mb-2 shadow-sm border border-gray-100"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/100?text=No+Image")
                      }/>
                    <div>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">{pet.name}</p>
                      <p className="text-green-600 text-xs sm:text-sm">{pet.species}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate("/mypets")}
                  className="self-start sm:self-center sm:ml-auto text-xs sm:text-sm text-green-600 hover:text-green-800 mt-2 sm:mt-0">
                  View All
                </button>
              </div>
            )}
          </section>

          <section className="mb-10">
             <h3 
               className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2 relative cursor-pointer"
               onClick={() => markAsRead('reminders')}
             >
               <Bell size={18} className="text-green-700" />
               <span>Reminders</span>
               {hasNewRemindersToday && (
                 <span className="absolute left-0 top-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
               )}
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
                 <button 
                   onClick={() => {
                     markAsRead('reminders');
                     navigate('/reminder');
                   }} 
                   className="text-sm text-green-600 hover:text-green-800 font-medium"
                 >
                   View All & Add New
                 </button>
              </div>
          </section>

           <section className="mb-10">
              <h3 
                className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2 relative cursor-pointer"
                onClick={() => markAsRead('health')}
              >
                  <Heart size={18} className="text-green-700"/>
                  <span>Health</span>
                  {hasNewHealthToday && (
                    <span className="absolute left-0 top-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
             </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border border-gray-100 rounded-lg p-3 bg-white shadow-sm">
                 {loadingHealth ? (
                   <p className="text-gray-500 px-3 py-2">Loading health records...</p>
                 ) : !user ? (
                   <p className="text-gray-500 px-3 py-2">Login to see health records.</p>
                 ) : healthRecords.length === 0 ? (
                   <p className="text-gray-500 px-3 py-2">No health checkups found.</p>
                 ) : (
                   healthRecords.map((record, i) => (
                     <div key={`${record.pet_id}-${record.record_date}-${i}`} className="flex items-center space-x-3 bg-green-50 hover:bg-green-100 p-3 rounded-lg transition-colors duration-150">
                       <Heart className="text-green-700" size={18} />
                       <div className="flex-grow min-w-0">
                         <p className="font-medium text-gray-800 truncate">{record.pet_name}'s checkup</p>
                         <p className="text-gray-500 text-sm">Last visit: {formatMonthsAgo(record.record_date)}</p>
                       </div>
                     </div>
                   ))
                 )}
              </div>
               <div className="text-right mt-2">
                 <button 
                   onClick={() => {
                     markAsRead('health');
                     navigate('/health');
                   }} 
                   className="text-sm text-green-600 hover:text-green-800 font-medium"
                 >
                   View Health Details
                 </button>
              </div>
           </section>

           <section className="mb-10">
             <h3 
               className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2 relative cursor-pointer"
               onClick={() => markAsRead('expenses')}
             >
                 <DollarSign size={18} className="text-green-700"/>
                 <span>Expenses</span>
                 {hasNewExpensesToday && (
                   <span className="absolute left-0 top-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                 )}
             </h3>
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border border-gray-100 rounded-lg p-3 bg-white shadow-sm">
                 {loadingExpenses ? (
                   <p className="text-gray-500 px-3 py-2">Loading expenses...</p>
                 ) : !user ? (
                   <p className="text-gray-500 px-3 py-2">Login to see expenses.</p>
                 ) : expenses.length === 0 ? (
                   <p className="text-gray-500 px-3 py-2">No expenses found.</p>
                 ) : (
                   expenses.map((expense, i) => (
                     <div key={i} className="flex items-center space-x-3 bg-green-50 hover:bg-green-100 p-3 rounded-lg transition-colors duration-150">
                       <DollarSign className="text-green-700" size={18} />
                       <div className="flex-grow min-w-0">
                         <p className="font-medium text-gray-800 truncate">
                           {expense.pet?.name || "Unknown"}'s {categoryLabels[expense.category] || expense.category}
                         </p>
                         <p className="text-gray-500 text-sm">Last expense: {formatCurrency(expense.amount)}</p>
                       </div>
                     </div>
                   ))
                 )}
              </div>
               <div className="text-right mt-2">
                 <button 
                   onClick={() => {
                     markAsRead('expenses');
                     navigate('/expenses');
                   }} 
                   className="text-sm text-green-600 hover:text-green-800 font-medium"
                 >
                   View All Expenses
                 </button>
              </div>
           </section>

           {/* --- Shop Section (Giữ nguyên) --- */}
           <section className="mb-8 sm:mb-10">
             <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                 <ShoppingBag size={18} className="text-green-700"/>
                 <span>Shop Recommendations</span>
             </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
                  <button 
                    onClick={() => navigate('/vet-map')}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    View Map
                  </button>
               </div>
           </section>
    </CustomerLayout>
  );
};

export default PetOwnerDashboard;