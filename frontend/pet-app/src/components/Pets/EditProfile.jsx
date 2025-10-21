import React, { useState, useEffect } from "react";
import {
  Home,
  PawPrint,
  Bell,
  Heart,
  DollarSign,
  Calendar,
  ShoppingBag,
  Settings,
  Camera,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ Lấy pet ID từ URL
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    vaccination: "",
    age: "",
    weight: "",
    breed: "",
    medical_history: "",
    description: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy dữ liệu pet hiện tại
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pets/${id}`);
        if (!res.ok) throw new Error("Failed to fetch pet");
        const data = await res.json();
        setFormData({
          name: data.name || "",
          species: data.species || "",
          vaccination: data.vaccination || "",
          age: data.age || "",
          weight: data.weight || "",
          breed: data.breed || "",
          medical_history: data.medical_history || "",
          description: data.description || "",
        });
        setPreviewImage(`http://localhost:5000${data.photo_url}`);
      } catch (err) {
        console.error("❌ Error fetching pet:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  // ✅ Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Xử lý chọn ảnh mới
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // ✅ Gửi form cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      for (let key in formData) form.append(key, formData[key]);
      if (selectedFile) form.append("photo_url", selectedFile);

      const res = await fetch(`http://localhost:5000/api/pets/${id}`, {
        method: "PUT",
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Pet updated successfully!");
        setTimeout(() => navigate(`/viewprofile/${id}`), 500);
      } else {
        alert(data.message || "❌ Failed to update pet");
      }
    } catch (err) {
      console.error("❌ Error updating pet:", err);
      alert("❌ Error updating pet");
    }
  };

  const handleCancel = () => {
    navigate(`/viewprofile/${id}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600">
        Loading pet profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <img
                src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
                onClick={() => navigate("/")}/>
              <div>
                <h3 className="font-semibold text-gray-900">Emily Carter</h3>
                <span className="text-sm text-green-600 block">Owner</span>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 w-full text-left text-gray-700">
                <Home size={18} /> Dashboard
              </button>
              <button
                onClick={() => navigate("/mypets")}
                className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 text-green-800 font-semibold w-full">
                <PawPrint size={18} /> My Pets
              </button>
              <button
                onClick={() => navigate("/reminder")}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 w-full text-left text-gray-700">
                <Bell size={18} /> Reminders
              </button>
              <button
                onClick={() => navigate("/health")}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 w-full text-left text-gray-700">
                <Heart size={18} /> Health & Activity
              </button>
              <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 w-full text-left text-gray-700">
                <DollarSign size={18} /> Expenses
              </a>
              <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 w-full text-left text-gray-700">
                <Calendar size={18} /> Calendar
              </a>
              <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 w-full text-left text-gray-700">
                <ShoppingBag size={18} /> Shop
              </a>
              <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 w-full text-left text-gray-700">
                <Settings size={18} /> Settings
              </a>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-12">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Edit {formData.name}’s Profile
            </h1>
            <p className="text-sm text-green-700 mb-8">
              Update your pet’s information
            </p>

            {/* Ảnh */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Pet"
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-sm"
                />
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pet Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                />
              </div>

              {/* Species + Vaccination */}
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[280px] max-w-[596px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Species
                  </label>
                  <select
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    className="w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 border border-green-300 
                              focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Chọn</option>
                    <option value="Chó">Chó</option>
                    <option value="Mèo">Mèo</option>
                    <option value="Chim">Chim</option>
                    <option value="Thỏ">Thỏ</option>
                    <option value="Cá">Cá</option>
                    <option value="Bò sát">Bò sát</option>
                    <option value="Khác">Khác...</option>
                  </select>

                  {/* Nếu chọn Other thì cho nhập thêm */}
                  {formData.species === "Other" && (
                    <input
                      type="text"
                      name="species"
                      placeholder="Enter custom species"
                      value={formData.customSpecies || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, species: e.target.value })
                      }
                      className="mt-3 w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 border border-green-300 
                                focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-[280px] max-w-[596px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vaccination Status
                  </label>
                  <input
                    type="text"
                    name="vaccination"
                    value={formData.vaccination}
                    onChange={handleChange}
                    className="w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 border border-green-300 
                               focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Age + Weight */}
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[280px] max-w-[596px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 border border-green-300 
                               focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div className="flex-1 min-w-[280px] max-w-[596px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 border border-green-300 
                               focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Breed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                />
              </div>

              {/* Medical History */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical History
                </label>
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 resize-none border border-green-300 
                             focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"/>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[rgba(240,253,244,1)] rounded-xl p-3 text-gray-800 resize-none border border-green-300 
                            focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-[12px] border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                >
                  Thoát
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-[12px] bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditProfile;
