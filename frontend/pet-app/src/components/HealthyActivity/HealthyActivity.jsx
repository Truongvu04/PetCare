import React, { useState } from "react";
import "./style.css";
import {
  LayoutDashboard,
  Dog,
  Bell,
  Heart,
  DollarSign,
  Calendar,
  ShoppingBag,
  Settings,
  MapPin,
  PawPrint,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", weight: 14 },
  { month: "Feb", weight: 13 },
  { month: "Mar", weight: 12 },
  { month: "Apr", weight: 13 },
  { month: "May", weight: 15 },
  { month: "Jun", weight: 14 },
];

const HealthActivity = () => {
  const navigate = useNavigate();

  const handleOpenMap = () => {
    navigate('/vet-map');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      <div className="w-full max-w-[1280px] bg-white flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="profile flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-semibold">
                <div className="avatar">
                  <img src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg" alt="profile" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Emily Carter</p>
                <p className="owner font-semibold text-gray-900">Owner</p>
              </div>
            </div>

            <nav className="flex flex-col space-y-2">
              {[
                { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
                { name: "Pets", icon: <PawPrint size={18} /> },
                { name: "Reminders", icon: <Bell size={18} /> },
                { name: "Health & Activity", icon: <Heart size={18} /> },
                { name: "Expenses", icon: <DollarSign size={18} /> },
                { name: "Calendar", icon: <Calendar size={18} /> },
                { name: "Shop", icon: <ShoppingBag size={18} /> },
                { name: "Settings", icon: <Settings size={18} /> },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-left ${
                    item.name === "Health & Activity"
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

          <button 
            onClick={handleOpenMap}
            className="flex items-center space-x-2 text-gray-900 hover:text-green-700 transition-colors"
          >
            <MapPin size={18} />
            <span>Veterinary clinic map</span>
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Health & Activity
          </h2>

          {/* Tabs */}
          <div className="flex space-x-8 border-b mb-6">
            {["Overview", "Weight", "Diet", "Medical History"].map(
              (tab, index) => (
                <button
                  key={index}
                  className={`pb-2 font-medium ${
                    tab === "Overview"
                      ? "text-green-700 border-b-2 border-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Weight Section */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Weight
            </h3>
            <div className="border rounded-lg p-5">
              <p className="text-3xl font-bold text-gray-900">15 lbs</p>
              <p className="text-sm text-green-600 mb-3">
                Last 6 Months +5%
              </p>

              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Diet Section */}
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Diet</h3>
            <div className="grid grid-cols-2 border rounded-lg divide-x">
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">Food Type</p>
                  <p className="font-medium text-gray-800">Dry Kibble</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Feeding Schedule</p>
                  <p className="font-medium text-green-700">8 AM, 6 PM</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">Daily Calories</p>
                  <p className="font-medium text-gray-800">350 kcal</p>
                </div>
              </div>
            </div>
          </section>

          {/* Medical History Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Medical History
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="p-3 border-b">Date</th>
                    <th className="p-3 border-b">Vaccination</th>
                    <th className="p-3 border-b">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {[
                    {
                      date: "2023-01-15",
                      vaccine: "Rabies",
                      notes: "Annual vaccination",
                    },
                    {
                      date: "2023-07-20",
                      vaccine: "Distemper",
                      notes: "Booster shot",
                    },
                    {
                      date: "2024-01-15",
                      vaccine: "Rabies",
                      notes: "Annual vaccination",
                    },
                  ].map((item, i) => (
                    <tr key={i} className="hover:bg-green-50">
                      <td className="p-3 border-b text-green-700">
                        {item.date}
                      </td>
                      <td className="p-3 border-b">{item.vaccine}</td>
                      <td className="p-3 border-b text-gray-600">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
      
    </div>
  );
};

export default HealthActivity;
