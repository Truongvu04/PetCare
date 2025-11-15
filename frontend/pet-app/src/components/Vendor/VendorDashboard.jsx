import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Settings, Plus, Calendar, Package } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import QuickAccessCards from "../DashBoard/QuickAccessCards.jsx";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, vendor } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendor) {
      fetchDashboardData();
    }
  }, [vendor]);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, appointmentsRes] = await Promise.all([
        api.get("/products/my-products"),
        api.get("/orders/vendor-orders"),
        api.get("/appointments/vendor-appointments"),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const appointments = appointmentsRes.data || [];

      const totalListings = products.length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

      setStats({
        totalListings,
        totalOrders,
        totalRevenue: totalRevenue / 1000,
      });

      const sortedOrders = orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentOrders(sortedOrders);

      setInquiries([]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "shipped":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

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
              <p className="text-sm text-gray-500">Vendor</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold">
              <Home size={18} /> Dashboard
            </button>
            <button
              onClick={() => navigate("/vendor/products")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100 w-full text-left">
              <ShoppingBag size={18} /> Products & Services
            </button>
            <button
              onClick={() => navigate("/vendor/orders")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name || "Vendor"}!</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-sm text-gray-600 mb-2">Total Listings</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalListings}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-sm text-gray-600 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          <QuickAccessCards />

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/vendor/products/add")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                Create New Listing
              </button>
              <button
                onClick={() => navigate("/vendor/services/add")}
                className="px-6 py-3 bg-white text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-50 font-semibold">
                Manage Services
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.order_id} className="border-b">
                        <td className="py-3 px-4">#{order.order_id}</td>
                        <td className="py-3 px-4">
                          {order.users?.full_name || "Unknown"}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-sm capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">${(Number(order.total) / 1000).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {inquiries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Customer Inquiries</h2>
              <div className="space-y-3">
                {inquiries.map((inquiry, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium">{inquiry.title}</p>
                      <p className="text-sm text-gray-500">{inquiry.date}</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

