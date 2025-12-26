import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { Camera } from "lucide-react";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { showSuccess, showError, showWarning } from "../../utils/notifications";

const EditProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // pet ID
  const { user } = useAuth();
  const [formData, setFormData] = useState({
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
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch pet");
        const data = await res.json();
        setFormData({
          name: data.name || "",
          species: ["Chó","Mèo","Chim","Thỏ","Cá","Bò sát"].includes(data.species) ? data.species : "Khác",
          customSpecies: ["Chó","Mèo","Chim","Thỏ","Cá","Bò sát"].includes(data.species) ? "" : data.species,
          vaccination: data.vaccination || "",
          age: data.age || "",
          weight: data.weight || "",
          breed: data.breed || "",
          medical_history: data.medical_history || "",
          description: data.description || "",
        });
        setPreviewImage(data.photo_url ? `http://localhost:5000${data.photo_url}` : null);
      } catch (err) {
        console.error("❌ Error fetching pet:", err);
        showError("Lỗi", "Không thể lấy thông tin thú cưng");
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => navigate(`/viewprofile/${id}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        showWarning("Yêu cầu đăng nhập", "Bạn cần đăng nhập!");
        navigate("/login");
        return;
      }

      const form = new FormData();
      const speciesValue = formData.species === "Khác" ? formData.customSpecies.trim() : formData.species;

      form.append("name", formData.name.trim());
      form.append("species", speciesValue);
      form.append("vaccination", formData.vaccination);
      form.append("age", formData.age);
      form.append("weight", formData.weight);
      form.append("breed", formData.breed);
      form.append("medical_history", formData.medical_history);
      form.append("description", formData.description);
      if (selectedFile) form.append("photo_url", selectedFile);

      const res = await fetch(`http://localhost:5000/api/pets/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess("Thành công", "Cập nhật thú cưng thành công!");
        navigate(`/viewprofile/${id}`);
      } else {
        showError("Lỗi", data.message || "Không thể cập nhật thú cưng");
      }
    } catch (err) {
      console.error("❌ Error updating pet:", err);
      showError("Lỗi", "Lỗi server, vui lòng thử lại");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600">
        Loading pet profile...
      </div>
    );
  }

  return (
    <CustomerLayout currentPage="mypets">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Edit {formData.name}’s Profile
            </h1>
            <p className="text-sm text-green-700 mb-8">
              Update your pet’s information
            </p>

            {/* Photo */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Pet"
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-sm"
                />
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition">
                  <Camera size={16} />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pet Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>

              {/* Species + Vaccination */}
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[280px] max-w-[596px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
                  <select name="species" value={formData.species} onChange={handleChange} className="w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500">
                    <option value="">Chọn</option>
                    <option value="Chó">Chó</option>
                    <option value="Mèo">Mèo</option>
                    <option value="Chim">Chim</option>
                    <option value="Thỏ">Thỏ</option>
                    <option value="Cá">Cá</option>
                    <option value="Bò sát">Bò sát</option>
                    <option value="Khác">Khác...</option>
                  </select>
                  {formData.species === "Khác" && (
                    <input type="text" name="customSpecies" placeholder="Enter custom species" value={formData.customSpecies} onChange={handleChange} className="mt-3 w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500" />
                  )}
                </div>

                <div className="flex-1 min-w-[280px] max-w-[596px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination Status</label>
                  <input type="text" name="vaccination" value={formData.vaccination} onChange={handleChange} className="w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
              </div>

              {/* Age + Weight */}
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[280px] max-w-[596px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input type="text" name="age" value={formData.age} onChange={handleChange} className="w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div className="flex-1 min-w-[280px] max-w-[596px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input type="text" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
              </div>

              {/* Breed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>

              {/* Medical History */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                <textarea name="medical_history" value={formData.medical_history} onChange={handleChange} rows="3" className="w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-green-50 rounded-xl p-3 border border-green-300 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={handleCancel} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">Update</button>
              </div>
            </form>
          </div>
    </CustomerLayout>
  );
};

export default EditProfile;
