import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js"; // 👈 Thêm
import api from "../../api/axiosConfig.js"; // 👈 Thêm

const AddNewPet = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 Lấy user
  const [formData, setFormData] = useState({
    // 👈 Bỏ user_id khỏi state, ta sẽ lấy từ context
    name: "",
    species: "",
    customSpecies: "",
    vaccination: "",
    age: "",
    weight: "",
    breed: "",
    medical_history: "",
    description: "",
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate("/mypets");
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("❌ Bạn phải đăng nhập để thêm thú cưng!");
      navigate("/login");
      return;
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();

      const speciesValue =
        formData.species === "Other"
          ? formData.customSpecies.trim()
          : formData.species; 
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("species", speciesValue);
      formDataToSend.append("vaccination", formData.vaccination);
      formDataToSend.append("age", formData.age);
      formDataToSend.append("weight", formData.weight);
      formDataToSend.append("breed", formData.breed);
      formDataToSend.append("medical_history", formData.medical_history);
      formDataToSend.append("description", formData.description);

      if (photo) formDataToSend.append("photo_url", photo);

      // 👈 Thay đổi fetch thành api.post
      const response = await api.post("/pets", formDataToSend, {
         headers: {
           // 👈 Quan trọng: Báo cho axios đây là form data
           'Content-Type': 'multipart/form-data', 
         },
      });

      const data = response.data; // 👈 axios trả về trong .data

      // 👈 axios không cần .ok, nó sẽ ném lỗi nếu status >= 400
      alert(`✅ Thêm thú cưng thành công! ID: ${data.pet_id}`);
      navigate("/mypets");

    } catch (error) {
      console.error("Error adding pet:", error);
      const errorMsg = error.response?.data?.message || "Không thể thêm thú cưng.";
      alert(`❌ Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-6">
      <div className="flex w-full max-w-[1280px]">
        {/* Sidebar (Cập nhật để hiển thị user thật) */}
        <aside className="w-60 bg-white rounded-2xl shadow-sm p-6 mr-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-green-200 overflow-hidden">
              <img
                src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"}
                alt="profile"
                onClick={() => navigate("/")}
                className="w-full h-full object-cover"/>
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">
                {user?.full_name || "Emily Carter"}
              </p>
              {/* <span className="owner font-semibold text-gray-900">{user?.role || "Owner"}</span> */}
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left">
              <Home size={18} /> Dashboard
            </button>
            <button
              onClick={() => navigate("/mypets")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold">
              <PawPrint size={18} /> My Pets
            </button>
            <button
              onClick={() => navigate("/reminder")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Bell size={18} /> Reminders
            </button>
            <button
              onClick={() => navigate("/health")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Heart size={18} /> Health & Activity
            </button>
            <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <DollarSign size={18} /> Expenses
            </a>
            <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Calendar size={18} /> Calendar
            </a>
            <a 
              onClick={() => navigate("/shops")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <ShoppingBag size={18} /> Shop
            </a>
            <a className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Settings size={18} /> Settings
            </a>
          </nav>
        </aside>

        {/* Main content (Giữ nguyên) */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm p-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Add New Pet</h2>

          <div className="flex justify-between items-start gap-10">
            <form className="flex-1 flex flex-col gap-5" onSubmit={handleAddPet}>
              {/* Pet name */}
              <div>
                <label className="block text-sm font-medium mb-1">Pet Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-[596px] rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                  placeholder="Enter pet’s name"/>
              </div>

              {/* Species + Vaccination */}
              <div className="grid grid-cols-2 gap-5 max-w-[596px]">
                <div>
                  <label className="block text-sm font-medium mb-1">Species</label>
                  <select
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500">
                    <option value="">Chọn</option>
                    <option value="Chó">Chó</option>
                    <option value="Mèo">Mèo</option>
                    <option value="Chim">Chim</option>
                    <option value="Thỏ">Thỏ</option>
                    <option value="Cá">Cá</option>
                    <option value="Bò sát">Bò sát</option>
                    <option value="Khác">Khác...</option>
                  </select>

                  {/* Nếu chọn Khác thì hiện ô nhập */}
                  {formData.species === "Khác" && (
                    <input
                      type="text"
                      name="customSpecies"
                      value={formData.customSpecies}
                      onChange={handleChange}
                      placeholder="Nhập loài khác..."
                      className="w-full rounded-lg bg-green-50 mt-2 px-4 py-2 text-sm border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"/>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vaccination
                  </label>
                  <input
                    type="text"
                    name="vaccination"
                    value={formData.vaccination}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    placeholder="e.g. Rabies, DHPP"/>
                </div>
              </div>

              {/* Age + Weight */}
              <div className="grid grid-cols-2 gap-5 max-w-[596px]">
                <div>
                  <label className="block text-sm font-medium mb-1">Age (years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"/>
                </div>
              </div>

              {/* Breed */}
              <div>
                <label className="block text-sm font-medium mb-1">Breed</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-[596px] rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"/>
              </div>

              {/* Medical History */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Medical History
                </label>
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  rows="3"
                  className="w-[596px] rounded-lg bg-green-50 px-4 py-2 text-sm resize-none border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                ></textarea>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-[596px] rounded-lg bg-green-50 px-4 py-2 text-sm resize-none border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-8 w-[596px]">
                <button
                  onClick={handleCancel}
                  type="button"
                  className="px-6 py-2 rounded-[12px] border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition mr-[16px]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 rounded-[12px] hover:bg-green-700 text-white text-sm px-5 py-2 transition disabled:opacity-50">
                  {loading ? "Adding..." : "Add Pet"}
                </button>
              </div>
            </form>

            {/* Upload ảnh (Giữ nguyên) */}
            <div className="flex flex-col items-center justify-center w-[200px] mt-[25px] mr-[50px]">
              <div className="w-[200px] h-[200px] rounded-2xl bg-gray-100 flex items-center justify-center mb-3 overflow-hidden border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500">
                {preview ? (
                  <img
                    src={preview}
                    alt="Pet preview"
                    className="w-full h-full object-cover"/>
                ) : (
                  <PawPrint className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <label className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}/>
                Upload photo
              </label>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddNewPet;