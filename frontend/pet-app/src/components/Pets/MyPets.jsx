  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { useAuth } from "../../hooks/useAuth.js"; 
  import api from "../../api/axiosConfig.js"; 
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
              <img
                src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"}
                alt="User"
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-400 transition"/>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.full_name || "Emily Carter"}</h3>
                {/* <span className="owner font-semibold text-gray-900">{user?.role || "Owner"}</span> */}
              </div>
            </div>

            {/* Navigation (Giữ nguyên) */}
            <nav className="flex flex-col gap-2 text-gray-700">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Home size={18} /> Dashboard
              </button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-800 font-semibold">
                <PawPrint size={18} /> My Pets
              </div>
              <button
                onClick={() => navigate("/reminder")}
                className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Bell size={18} /> Reminders
              </button>
              <button
                onClick={() => navigate("/health")}
                className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Heart size={18} /> Health & Activity
              </button>
              <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <DollarSign size={18} /> Expenses
              </button>
              <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Calendar size={18} /> Calendar
              </button>
              <button 
                onClick={() => navigate("/shops")}
                className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <ShoppingBag size={18} /> Shop
              </button>
              <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
                <Settings size={18} /> Settings
              </button>
            </nav>
          </aside>

          {/* Main Content (Cập nhật) */}
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">My Pets</h2>
              <button
                onClick={() => navigate("/addnewpets")}
                className="bg-[#29a980] hover:bg-[#1d926d] text-white px-4 py-2 rounded-md transition-all">
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
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md p-5 transition-all duration-300 hover:-translate-y-1">
                  {/* Bên trái: ảnh + thông tin */}
                  <div className="flex items-center gap-5">
                    {/* Ảnh thú cưng */}
                    <div className="relative">
                      <img
                        src={
                          pet.photo_url
                            ? pet.photo_url.startsWith("http")
                              ? pet.photo_url
                              : `http://localhost:5000${pet.photo_url}`
                            : "https://via.placeholder.com/120x120?text=No+Image"
                        }
                        alt={pet.name}
                        className="w-[140px] h-[140px] object-cover rounded-2xl border border-gray-200 shadow-sm"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/120x120?text=No+Image";
                        }}/>
                    </div>

                    {/* Thông tin text */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {pet.name}
                        <PawPrint className="text-[#29a980]" size={20} />
                      </h3>
                      <p className="text-green-600 mt-1">
                        <strong className="text-green-700">Species:</strong>{" "}
                        <span className="capitalize">{pet.species || "N/A"}</span>
                      </p>
                      <p className="text-green-600">
                        <strong className="text-green-700">Age:</strong>{" "}
                        {pet.age || "N/A"} years
                      </p>

                      {/* Nút hành động */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => navigate(`/viewprofile/${pet.id}`)}
                          className="px-4 py-1.5 bg-[#29a980]/10 text-[#29a980] rounded-lg font-medium hover:bg-[#29a980]/20 transition">
                          View Profile
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet.id)}
                          className="flex items-center gap-1 px-4 py-1.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition">
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </div>
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