  import React from "react";
  import { useNavigate } from "react-router-dom";
  import {
    Home,
    PawPrint,
    Bell,
    Heart,
    DollarSign,
    Calendar,
    ShoppingBag,
    Settings,
  } from "lucide-react";

  const RemindersAuto= () => {
    const navigate = useNavigate();

    const handleCancel = (e) => {
      e.preventDefault();
      navigate("/reminder"); //  quay lại trang Reminder (Reminders)
    };
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <div className="flex w-full max-w-[1280px]">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
            <div>
              {/* Logo */}
              <div className="profile flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-semibold">
                  <div className="avatar">
                    <img src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg" alt="profile"/>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Emily Carter</p>
                  <p className="owner font-semibold text-gray-900">Owner</p>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left">
                  <Home size={18} /> Dashboard
                </button>
                <button
                  onClick={() => navigate("/mypets")}
                  className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left">
                  <PawPrint size={18} /> My Pets
                </button>
                <button
                  onClick={() => navigate("/reminder")}
                  className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold w-full">
                  <Bell size={18} /> Reminders
                </button>
                <button
                  onClick={() => navigate("/health")}
                  className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left">
                  <Heart size={18} /> Health & Activity
                </button>
                <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
                  <DollarSign size={18} />
                  <span>Expenses</span>
                </a>
                <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
                  <Calendar size={18} />
                  <span>Calendar</span>
                </a>
                <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
                  <ShoppingBag size={18} />
                  <span>Shop</span>
                </a>
                <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
                  <Settings size={18} />
                  <span>Settings</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 bg-gray-50 p-10">
            <div className="max-w-3xl">
              {/* Header */}
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Set Up Automatic Reminders
              </h1>
              <p className="text-sm text-green-700 mb-10">
                Never miss an important date for your pet’s health and well-being.
                Set up reminders for vaccinations, check-ups, feeding, and
                grooming.
              </p>

              {/* Form */}
              <form className="space-y-10">
                {/* Section: Vaccination */}
                <section>
                  <h2 className="font-semibold text-gray-900 mb-4">
                    Vaccination Reminders
                  </h2>
                  <div className="space-y-4">
                    <select className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                      border border-green-100 transition duration-150 
                                      focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500">
                      <option>Select</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Vaccination Name"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      type="date"
                      placeholder="Date of Last Vaccination"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Reminder Frequency (e.g., every 12 months)"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </section>

                {/* Section: Check-Up */}
                <section>
                  <h2 className="font-semibold text-gray-900 mb-4">
                    Check-Up Reminders
                  </h2>
                  <div className="space-y-4">
                    <select className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                      border border-green-100 transition duration-150 
                                      focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500">
                      <option>Select</option>
                    </select>
                    <input
                      type="date"
                      placeholder="Date of Last Check-Up"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Reminder Frequency (e.g., every 6 months)"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </section>

                {/* Section: Feeding */}
                <section>
                  <h2 className="font-semibold text-gray-900 mb-4">
                    Feeding Reminders
                  </h2>
                  <div className="space-y-4">
                    <select className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                      border border-green-100 transition duration-150 
                                      focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500">
                      <option>Select</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Feeding Time"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500 
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Reminder Frequency (e.g., daily)"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </section>

                {/* Section: Grooming */}
                <section>
                  <h2 className="font-semibold text-gray-900 mb-4">
                    Grooming Reminders
                  </h2>
                  <div className="space-y-4">
                    <select className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                      border border-green-100 transition duration-150 
                                      focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500">
                      <option>Select</option>
                    </select>
                    <input
                      type="date"
                      placeholder="Date of Last Grooming"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Reminder Frequency (e.g., every 3 months)"
                      className="w-full bg-green-100 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-green-500
                                border border-green-100 transition duration-150 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </section>

                {/* Save button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-[12px] border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition mr-[16px]">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-[12px] bg-green-600 text-white font-semibold hover:bg-green-700 transition">
                    Save Reminders
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    );
  };

  export default RemindersAuto;
