import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user, vendor } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
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
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("category", formData.category);

      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await api.post("/products", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Thêm sản phẩm thành công!");
      navigate("/vendor/products");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("❌ Lỗi khi thêm sản phẩm: " + (error.response?.data?.message || error.message));
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

        <main className="flex-1 bg-white rounded-2xl shadow-sm p-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Add New Product</h2>

          <form className="flex-1 flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-[596px] rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-[596px] rounded-lg bg-green-50 px-4 py-2 text-sm resize-none border border-green-300 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-5 max-w-[596px]">
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-[596px] rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300 focus:outline-none focus:border-green-300 focus:ring-1 focus:ring-green-500"
                placeholder="e.g. Food, Supplies, Toys"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product Images *</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-[596px] rounded-lg bg-green-50 px-4 py-2 text-sm border border-green-300"
              />
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4 max-w-[596px]">
                  {previews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold">
                {loading ? "Adding..." : "Add Product"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/vendor/products")}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddProduct;

