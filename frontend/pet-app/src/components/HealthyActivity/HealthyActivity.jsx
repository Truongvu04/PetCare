// import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import "./style.css";
import {
  MapPin,
} from "lucide-react";
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
const navigate = useNavigate()
const { user } = useAuth();
const handleOpenMap = () => {
  navigate('/vet-map');
  };
  return (
    <CustomerLayout currentPage="health">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Health & Activity
          </h2>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b mb-6 pb-2">
            <div className="flex flex-wrap gap-4 sm:gap-8">
              {["Overview", "Weight", "Diet", "Medical History"].map(
                (tab, index) => (
                  <button
                    key={index}
                    className={`pb-2 font-medium ${
                      tab === "Overview"
                        ? "text-green-700 border-b-2 border-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {tab}
                  </button>
                )
              )}
            </div>

            <button
              onClick={handleOpenMap}
              className="flex items-center text-green-600 hover:text-green-700 space-x-1 pb-2 font-medium border-b-2 border-transparent transition-colors whitespace-nowrap">
              <MapPin className="w-5 h-5"/>
              <span>Clinic Map</span>
            </button>
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
                    <YAxis hide/>
                    <Tooltip/>
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}/>
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
    </CustomerLayout>
  );
};

export default HealthActivity;
