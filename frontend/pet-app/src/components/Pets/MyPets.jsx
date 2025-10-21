import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PawPrint,
  Home,
  Heart,
  Bell,
  DollarSign,
  Calendar,
  ShoppingBag,
  Settings,
  Trash2,
} from "lucide-react";

const MyPets = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy danh sách thú cưng
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/pets");
        if (!res.ok) throw new Error("Failed to fetch pets");
        const data = await res.json();
        setPets(data);
      } catch (err) {
        console.error("❌ Error fetching pets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // ✅ Xóa thú cưng
  const handleDeletePet = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/pets/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Failed to delete pet (status ${res.status})`);

      // Xóa khỏi danh sách UI
      setPets((prev) => prev.filter((pet) => pet.id !== id));
      alert("✅ Pet deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting pet:", err);
      alert("❌ Failed to delete pet. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading pets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r p-6 flex flex-col">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
                alt="profile"
                className="w-full h-full object-cover"
                onClick={() => navigate("/")}/>
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">
                Emily Carter
              </p>
              <p className="text-gray-500 text-sm">Owner</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 text-gray-700">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Home size={18} /> Dashboard
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold">
              <PawPrint size={18} /> My Pets
            </div>
            <button
              onClick={() => navigate("/reminder")}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Bell size={18} /> Reminders
            </button>
            <button
              onClick={() => navigate("/health")}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Heart size={18} /> Health & Activity
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <DollarSign size={18} /> Expenses
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Calendar size={18} /> Calendar
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <ShoppingBag size={18} /> Shop
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Settings size={18} /> Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
            <button
              onClick={() => navigate("/addnewpets")}
              className="bg-[#29a980] hover:bg-[#1d926d] text-white px-4 py-2 rounded-md transition-all">
              Add a Pet
            </button>
          </div>

          {/* Pet List */}
          <div className="space-y-6">
            {pets.length === 0 ? (
              <p className="text-gray-500 text-center">Danh sách trống.</p>
            ) : (
              pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex justify-between items-start bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md p-4 transition-all">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xl">
                      {pet.name}
                    </h3>
                    <p className="text-[#4F946B] text-sm">
                      <strong>Species:</strong> {pet.species || "N/A"}
                    </p>
                    <p className="text-[#4F946B] text-sm">
                      <strong>Age:</strong> {pet.age || "N/A"} years
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/viewprofile/${pet.id}`)}
                        className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                        View Profile
                      </button>
                      <button
                        onClick={() => handleDeletePet(pet.id)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Ảnh thú cưng */}
                  <div>
                    <img
                      src={
                        pet.photo_url
                          ? pet.photo_url.startsWith("http")
                            ? pet.photo_url
                            : `http://localhost:5000${pet.photo_url}`
                          : "https://via.placeholder.com/292x155?text=No+Image"
                      }
                      alt={pet.name}
                      className="w-[292px] h-[155px] object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/292x155?text=No+Image";
                      }}/>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyPets;
