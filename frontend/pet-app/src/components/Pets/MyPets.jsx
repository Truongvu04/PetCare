  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { useAuth } from "../../hooks/useAuth.js"; 
  import api from "../../api/axiosConfig.js"; 
  import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
  import {
    PawPrint,
    Trash2,
  } from "lucide-react";
  import { showSuccess, showError, showConfirm } from "../../utils/notifications";

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
      const result = await showConfirm("Xóa thú cưng", "Bạn có chắc chắn muốn xóa thú cưng này?");
      if (!result.isConfirmed) return;

      try {
        // 👈 Dùng api.delete
        await api.delete(`/pets/${id}`);

        // Xóa khỏi danh sách UI
        setPets((prev) => prev.filter((pet) => pet.id !== id));
        showSuccess("Thành công", "Đã xóa thú cưng thành công!");
      } catch (err) {
        console.error("❌ Error deleting pet:", err);
        const errorMsg = err.response?.data?.message || "Không thể xóa thú cưng. Vui lòng thử lại.";
        showError("Lỗi", errorMsg);
      }
    };

    return (
      <CustomerLayout currentPage="mypets">
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
      </CustomerLayout>
    );
  };

  export default MyPets;