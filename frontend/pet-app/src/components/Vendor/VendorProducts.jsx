import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Settings, Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";

const VendorProducts = () => {
  const navigate = useNavigate();
  const { user, vendor } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (vendor) {
      fetchProducts();
      fetchServices();
    }
  }, [vendor]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/my-products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get("/services/my-services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Lỗi khi xóa sản phẩm");
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
            <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold">
              <ShoppingBag size={18} /> Products & Services
            </button>
            <button
              onClick={() => navigate("/vendor/orders")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left">
              <Package size={18} /> Orders
            </button>
            <button
              onClick={() => navigate("/vendor/settings")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <Settings size={18} /> Settings
            </button>
          </nav>
        </aside>

        <div className="flex-1 bg-white rounded-2xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Products & Services</h1>
              <p className="text-gray-600">Manage your product and service listings</p>
            </div>
            {activeTab === "products" ? (
              <button
                onClick={() => navigate("/vendor/products/add")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus size={18} /> Add Product
              </button>
            ) : (
              <button
                onClick={() => navigate("/vendor/services/add")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus size={18} /> Add Service
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 bg-green-50 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <div className="border-b mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("products")}
                className={`pb-2 px-4 ${
                  activeTab === "products"
                    ? "border-b-2 border-green-600 text-green-600 font-semibold"
                    : "text-gray-600"
                }`}>
                Products
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`pb-2 px-4 ${
                  activeTab === "services"
                    ? "border-b-2 border-green-600 text-green-600 font-semibold"
                    : "text-gray-600"
                }`}>
                Services
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : activeTab === "products" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Stock</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter((p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((product) => (
                    <tr key={product.product_id} className="border-b">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">{product.category || "N/A"}</td>
                      <td className="py-3 px-4">${(product.price / 1000).toFixed(2)}</td>
                      <td className="py-3 px-4">{product.stock}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          (product.stock || 0) > 0 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {(product.stock || 0) > 0 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/vendor/products/edit/${product.product_id}`)}
                            className="text-blue-600 hover:text-blue-800">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id)}
                            className="text-red-600 hover:text-red-800">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services
                    .filter((s) =>
                      s.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((service) => (
                    <tr key={service.service_id} className="border-b">
                      <td className="py-3 px-4">{service.name}</td>
                      <td className="py-3 px-4">${(service.price / 1000).toFixed(2)}</td>
                      <td className="py-3 px-4">{service.duration || "N/A"} min</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/vendor/services/edit/${service.service_id}`)}
                          className="text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;

