import React, { useEffect, useState } from "react";
import {
  Home,
  PawPrint,
  Bell,
  Heart,
  DollarSign,
  Calendar,
  ShoppingBag,
  Settings,
  Edit3,
  Scissors,
  Stethoscope,
  Dumbbell,
  Utensils,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const ViewProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // lấy id từ URL
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu pet theo id
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pets/${id}`);
        if (!res.ok) throw new Error("Pet not found");
        const data = await res.json();
        setPetData(data);
      } catch (err) {
        console.error("❌ Error fetching pet:", err);
        setPetData({ notFound: true });
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading pet profile...
      </div>
    );
  }

  if (petData?.notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Pet not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
          <div>
            {/* User info */}
            <div className="flex items-center space-x-3 mb-8">
              <img
                src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
                onClick={() => navigate("/")}/>
              <div>
                <h3 className="font-semibold text-gray-900">Emily Carter</h3>
                <span className="owner font-semibold text-gray-900">Owner</span>
              </div>
            </div>

            {/* Menu */}
            <nav className="space-y-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left text-gray-700"
              >
                <Home size={18} /> Dashboard
              </button>

              <button
                onClick={() => navigate("/mypets")}
                className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold w-full"
              >
                <PawPrint size={18} /> My Pets
              </button>

              <button
                onClick={() => navigate("/reminder")}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left text-gray-700"
              >
                <Bell size={18} /> Reminders
              </button>

              <button
                onClick={() => navigate("/health")}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left text-gray-700"
              >
                <Heart size={18} /> Health & Activity
              </button>

              <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 text-gray-700 w-full">
                <DollarSign size={18} /> <span>Expenses</span>
              </a>

              <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 text-gray-700 w-full">
                <Calendar size={18} /> <span>Calendar</span>
              </a>

              <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 text-gray-700 w-full">
                <ShoppingBag size={18} /> <span>Shop</span>
              </a>

              <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 text-gray-700 w-full">
                <Settings size={18} /> <span>Settings</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {petData.name}’s Profile
                </h1>
                <p className="text-sm text-green-700 mt-1">
                  Manage your pet’s information and care
                </p>
              </div>
            </div>

            {/* Profile section */}
            <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center space-x-5">
                <img
                  src={
                    petData.photo_url
                      ? `http://localhost:5000${petData.photo_url}`
                      : "https://via.placeholder.com/150"
                  }
                  alt={petData.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">
                    {petData.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {petData.breed}, {petData.age} years old
                  </p>
                  <p className="text-sm text-gray-600">
                    Weight:{" "}
                    <span className="text-gray-900">{petData.weight} kg</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/editprofile/${petData.id}`)}
                // onClick={() => navigate("/editprofile")}
                className="bg-green-50 text-gray-800 px-6 py-2 rounded-md hover:bg-green-100 transition flex items-center gap-2"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            </div>

            {/* Health Information */}
            <section className="mb-8 text-[22px]">
              <h3 className="font-bold text-gray-900 mb-4">
                Health Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
                <div>
                  <p className="text-gray-500">Breed</p>
                  <p className="text-gray-800">{petData.breed}</p>
                </div>
                <div>
                  <p className="text-gray-500">Age</p>
                  <p className="text-gray-800">{petData.age} years</p>
                </div>
                <div>
                  <p className="text-gray-500">Weight</p>
                  <p className="text-gray-800">{petData.weight} kg</p>
                </div>
                <div>
                  <p className="text-gray-500">Vaccination Status</p>
                  <p className="text-gray-800">
                    {petData.vaccination || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Medical History</p>
                  <p className="text-gray-800">
                    {petData.medical_history || "No record"}
                  </p>
                </div>
              </div>
            </section>

            {/* Care Recommendations */}
            <section>
              <h3 className="text-[22px] font-bold text-gray-900 mb-4">
                Care Recommendations
              </h3>
              <p className="text-sm text-gray-800 mb-4">
                Based on {petData.name}’s breed and age, we recommend the
                following:
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: <Scissors size={18} />,
                    title: "Regular Grooming",
                    desc: "Schedule a grooming session",
                  },
                  {
                    icon: <Stethoscope size={18} />,
                    title: "Annual Vet Visit",
                    desc: "Book a vet checkup",
                  },
                  {
                    icon: <Dumbbell size={18} />,
                    title: "Daily Exercise",
                    desc: "Find a dog walker",
                  },
                  {
                    icon: <Utensils size={18} />,
                    title: "Nutritional Diet",
                    desc: "Purchase high-quality food",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 bg-white border border-gray-100 p-4 rounded-lg shadow-sm"
                  >
                    <div className="bg-green-50 p-2 rounded-md text-green-700">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewProfile;