import React, { useEffect, useState } from "react";
import {
  Edit3,
  Scissors,
  Stethoscope,
  Dumbbell,
  Utensils,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";

const ViewProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth(); // 👈 Lấy user
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu pet theo id
  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return; // 👈 Không fetch nếu không có id
      try {
        const res = await api.get(`/pets/${id}`); // 👈 Dùng api.get
        setPetData(res.data); // 👈 axios trả về trong .data
      } catch (err) {
        console.error("❌ Error fetching pet:", err);
        // 👈 Xử lý lỗi (ví dụ: pet không thuộc về user này)
         if (err.response?.status === 403 || err.response?.status === 404) {
           alert("Pet not found or you don't have permission to view this pet.");
           navigate("/mypets");
         } else {
           setPetData({ notFound: true });
         }
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id, navigate]); // 👈 Thêm navigate

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
  
  // 👈 Thêm kiểm tra petData null
  if (!petData) {
     return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
         No pet data.
        </div>
     );
  }

  return (
    <CustomerLayout currentPage="mypets">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
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
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
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
    </CustomerLayout>
  );
};

export default ViewProfile;