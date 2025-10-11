import React from "react";
import {
  LayoutDashboard,
  Dog,
  Bell,
  Heart,
  DollarSign,
  Calendar,
  ShoppingBag,
  MessageCircle,
  Scissors,
  Syringe,
  MapPin,
  User,
  PawPrint,
  Settings,
} from "lucide-react";
import "./PetOwnerDashboard.css";
import { useNavigate } from "react-router-dom";

const PetOwnerDashboard = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      <div className="w-full max-w-[1280px] bg-white flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r border-gray-200 p-6 flex flex-col justify-between">
          <div>
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

            <nav className="flex flex-col space-y-2">
              {[
                { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
                { name: "My Pets", icon: <PawPrint size={18} /> },
                { name: "Reminders", icon: <Bell size={18} /> },
                { name: "Health & Activity", icon: <Heart size={18} />, path: "/health" },
                { name: "Expenses", icon: <DollarSign size={18} /> },
                { name: "Calendar", icon: <Calendar size={18} /> },
                { name: "Shop", icon: <ShoppingBag size={18} /> },
                { name: "Settings", icon: <Settings size={18} /> },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.path) navigate(item.path); // 👈 chuyển trang nếu có path
                  }}
                  className={`flex items-center space-x-2 text-left px-3 py-2 rounded-lg ${
                    item.name === "Dashboard"
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

          <button className="flex items-center space-x-2 text-gray-900 hover:text-green-700">
            <MessageCircle size={18} />
            <span>Chat</span>
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-10 overflow-y-auto">
          <h2 className="dashboard text-2xl font-bold text-gray-900 mb-8">Dashboard</h2>

          {/* My Pets */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>My Pets</span>
            </h3>
            <div className="flex space-x-10">
              <div className="flex flex-col items-center">
                <img
                  src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg"
                  alt="Buddy"
                  className="w-24 h-24 rounded-full object-cover mb-2"
                />
                <p className="font-medium text-gray-800">Buddy</p>
                <p className="text-gray-500 text-sm">Dog</p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg"
                  alt="Whiskers"
                  className="w-24 h-24 rounded-full object-cover mb-2"
                />
                <p className="font-medium text-gray-800">Whiskers</p>
                <p className="text-gray-500 text-sm">Cat</p>
              </div>
            </div>
          </section>

          {/* Reminders */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>Reminders</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                <Syringe className="text-green-700" size={18} />
                <div>
                  <p className="font-medium text-gray-800">
                    Buddy’s vaccination
                  </p>
                  <p className="text-gray-500 text-sm">Due in 2 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                <Scissors className="text-green-700" size={18} />
                <div>
                  <p className="font-medium text-gray-800">
                    Whiskers’s grooming
                  </p>
                  <p className="text-gray-500 text-sm">Due in 1 week</p>
                </div>
              </div>
            </div>
          </section>

          {/* Health */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>Health</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                <Heart className="text-green-700" size={18} />
                <div>
                  <p className="font-medium text-gray-800">Buddy’s checkup</p>
                  <p className="text-gray-500 text-sm">
                    Last visit: 2 months ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                <Heart className="text-green-700" size={18} />
                <div>
                  <p className="font-medium text-gray-800">
                    Whiskers’s checkup
                  </p>
                  <p className="text-gray-500 text-sm">
                    Last visit: 1 month ago
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Expenses */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>Expenses</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                <DollarSign className="text-green-700" size={18} />
                <div>
                  <p className="font-medium text-gray-800">Buddy’s food</p>
                  <p className="text-gray-500 text-sm">Last expense: $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                <DollarSign className="text-green-700" size={18} />
                <div>
                  <p className="font-medium text-gray-800">Whiskers’s toys</p>
                  <p className="text-gray-500 text-sm">Last expense: $30</p>
                </div>
              </div>
            </div>
          </section>

          {/* Shop */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>Shop</span>
            </h3>
            <div className="flex flex-wrap gap-6">
              {[
                {
                  name: "Dog Food",
                  desc: "Premium dog food",
                  img: "https://images.pexels.com/photos/220938/pexels-photo-220938.jpeg",
                },
                {
                  name: "Cat Toys",
                  desc: "Interactive cat toys",
                  img: "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg",
                },
                {
                  name: "Caio",
                  desc: "Interactive Caio",
                  img: "https://images.pexels.com/photos/56733/pexels-photo-56733.jpeg",
                },
                {
                  name: "Tour Pets",
                  desc: "Interactive Tour Pets",
                  img: "https://images.pexels.com/photos/4012470/pexels-photo-4012470.jpeg",
                },
              ].map((item, idx) => (
                <div key={idx} className="w-40">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="rounded-lg mb-2"
                  />  
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Clinics */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span>Nearby Clinics</span>
            </h3>
            <div className="space-y-3">
              {[
                { name: "Pet Wellness Clinic", distance: "2 miles away" },
                { name: "Animal Care Center", distance: "3 miles away" },
              ].map((clinic, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg"
                >
                  <MapPin className="text-green-700" size={18} />
                  <div>
                    <p className="font-medium text-gray-800">{clinic.name}</p>
                    <p className="text-gray-500 text-sm">{clinic.distance}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
