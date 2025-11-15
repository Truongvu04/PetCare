import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Settings, Package } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";

const VendorOrders = () => {
  const navigate = useNavigate();
  const { user, vendor } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendor) {
      fetchOrders();
      fetchAppointments();
    }
  }, [vendor]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/vendor-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments/vendor-appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Lỗi khi cập nhật trạng thái đơn hàng");
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
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-100">
              <ShoppingBag size={18} /> Products & Services
            </button>
            <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 font-semibold w-full text-left">
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
            <h1 className="text-2xl font-bold">Orders & Services</h1>
            <p className="text-gray-600">Manage your orders and service appointments</p>
          </div>

          <div className="border-b mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("orders")}
                className={`pb-2 px-4 ${
                  activeTab === "orders"
                    ? "border-b-2 border-green-600 text-green-600 font-semibold"
                    : "text-gray-600"
                }`}>
                Orders
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`pb-2 px-4 ${
                  activeTab === "appointments"
                    ? "border-b-2 border-green-600 text-green-600 font-semibold"
                    : "text-gray-600"
                }`}>
                Service Appointments
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : activeTab === "orders" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Ongoing</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Total</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter((o) => {
                          const status = o.status?.toLowerCase();
                          return status === "pending" || status === "paid" || status === "shipped";
                        })
                        .map((order) => (
                          <tr key={order.order_id} className="border-b">
                            <td className="py-3 px-4">#{order.order_id}</td>
                            <td className="py-3 px-4">
                              {order.users?.full_name || "Unknown"}
                            </td>
                            <td className="py-3 px-4">
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                order.status === "paid" || order.status === "shipped"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">${(Number(order.total) / 1000).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusUpdate(order.order_id, e.target.value)
                                }
                                className="px-2 py-1 border rounded text-sm">
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Completed</h2>
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
                      {orders
                        .filter((o) => {
                          const status = o.status?.toLowerCase();
                          return status === "paid" || status === "cancelled" || status === "refunded";
                        })
                        .map((order) => (
                          <tr key={order.order_id} className="border-b">
                            <td className="py-3 px-4">#{order.order_id}</td>
                            <td className="py-3 px-4">
                              {order.users?.full_name || "Unknown"}
                            </td>
                            <td className="py-3 px-4">
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-sm capitalize ${
                                order.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">${(Number(order.total) / 1000).toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Service</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.appointment_id} className="border-b">
                      <td className="py-3 px-4">{appointment.services?.name || "N/A"}</td>
                      <td className="py-3 px-4">
                        {appointment.users?.full_name || "Unknown"}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">
                          {appointment.status || "pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={appointment.status || "pending"}
                          onChange={(e) =>
                            api
                              .patch(`/appointments/${appointment.appointment_id}/status`, {
                                status: e.target.value,
                              })
                              .then(() => fetchAppointments())
                          }
                          className="px-2 py-1 border rounded text-sm">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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

export default VendorOrders;

