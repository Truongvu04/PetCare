import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, vendor } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      const service = response.data;
      setFormData({
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
        duration: service.duration || "",
        category: service.category || "",
      });
    } catch (error) {
      console.error("Error fetching service:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendor) {
      alert("❌ Bạn phải đăng nhập với tài khoản Vendor!");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/services/${id}`, formData);

      alert("✅ Cập nhật dịch vụ thành công!");
      navigate("/vendor/products");
    } catch (error) {
      console.error("Error updating service:", error);
      alert("❌ Lỗi khi cập nhật dịch vụ: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-6">
      <div className="flex w-full max-w-[1280px]">
        <aside className="w-60 bg-white rounded-2xl shadow-sm p-6 mr-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-green-200 overflow-hidden">
              <img
                src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"}
                alt="profile"
                onClick={() => navigate("/")}
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.full_name || "Vendor"}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left">
              <Home size={18} /> Dashboard
            </button>
            <button
              onClick={() => navigate("/vendor/products")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold">
              <ShoppingBag size={18} /> Products & Services
            </button>
            <button
              onClick={() => navigate("/vendor/settings")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Settings size={18} /> Settings
            </button>
          </nav>
        </aside>

        <div className="flex-1 bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6">Edit Service</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? "Updating..." : "Update Service"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/vendor/products")}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditService;

