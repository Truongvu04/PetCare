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
import { useAuth } from "../../hooks/useAuth.js"; // 👈 Thêm
import api from "../../api/axiosConfig.js"; // 👈 Thêm

const MyPets = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 Lấy user
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy danh sách thú cưng
  useEffect(() => {
    const fetchPets = async () => {
      // 👈 Chỉ fetch nếu đã login
      if (!user) {
        setLoading(false);
        setPets([]); // Đảm bảo pets là mảng rỗng nếu chưa login
        // Tùy chọn: chuyển hướng về login
        // navigate("/login");
        return;
      }
      
      try {
        setLoading(true); // 👈 Đặt loading true ở đây
        const res = await api.get("/pets"); // 👈 Dùng api.get
        
        // axios trả về trong .data
        const data = res.data; 
        
        if (Array.isArray(data)) {
          setPets(data);
        } else {
           console.warn("API /pets did not return an array:", data);
           setPets([]);
        }
      } catch (err) {
        console.error("❌ Error fetching pets:", err);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [user]); // 👈 Phụ thuộc vào user

  // ✅ Xóa thú cưng
  const handleDeletePet = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;

    try {
      // 👈 Dùng api.delete
      await api.delete(`/pets/${id}`);

      // Xóa khỏi danh sách UI
      setPets((prev) => prev.filter((pet) => pet.id !== id));
      alert("✅ Pet deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting pet:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete pet. Please try again.";
      alert(`❌ ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Sidebar (Cập nhật user info) */}
        <aside className="w-64 bg-white border-r p-6 flex flex-col">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">
                {user?.full_name || "Emily Carter"}
              </p>
              <p className="text-gray-500 text-sm">{user?.role || "Owner"}</p>
            </div>
          </div>

          {/* Navigation (Giữ nguyên) */}
          <nav className="flex flex-col gap-2 text-gray-700">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100"
            >
              <Home size={18} /> Dashboard
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold">
              <PawPrint size={18} /> My Pets
            </div>
            <button
              onClick={() => navigate("/reminder")}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100"
            >
              <Bell size={18} /> Reminders
            </button>
            <button
              onClick={() => navigate("/health")}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100"
            >
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

        {/* Main Content (Cập nhật) */}
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
            <button
              onClick={() => navigate("/addnewpets")}
              className="bg-[#29a980] hover:bg-[#1d926d] text-white px-4 py-2 rounded-md transition-all"
            >
              Add a Pet
            </button>
          </div>

          {/* Pet List */}
          <div className="space-y-6">
            {/* 👈 Cập nhật logic loading và user */}
            {loading ? (
              <p className="text-gray-500 text-center">Loading pets...</p>
            ) : !user ? (
               <p className="text-gray-500 text-center">
                 Please <a href="/login" className="text-green-600 underline">login</a> to see your pets.
               </p>
            ) : pets.length === 0 ? (
              <p className="text-gray-500 text-center">No pets found. Click "Add a Pet" to get started!</p>
            ) : (
              pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex justify-between items-start bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md p-4 transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xl">
                      {pet.name}
                    </h3>
                    <p className="text-[#4F946L] text-sm">
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