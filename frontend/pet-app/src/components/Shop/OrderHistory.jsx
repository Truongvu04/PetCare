import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { Package, Calendar, DollarSign, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { showSuccess, showError, showConfirm } from "../../utils/notifications";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingReceived, setMarkingReceived] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReceived = async (orderId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    
    const confirmed = await showConfirm(
      "Xác nhận đã nhận hàng",
      "Bạn có chắc chắn đã nhận được đơn hàng này?",
      "Xác nhận",
      "Hủy"
    );

    if (!confirmed) return;

    try {
      setMarkingReceived(orderId);
      const response = await api.patch(`/orders/${orderId}/received`);
      showSuccess("Thành công", "Đã xác nhận nhận hàng thành công!");
      // Refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error("Error marking order as received:", error);
      const message = error.response?.data?.message || "Không thể xác nhận nhận hàng. Vui lòng thử lại.";
      showError("Lỗi", message);
    } finally {
      setMarkingReceived(null);
    }
  };

  if (loading) {
    return (
      <CustomerLayout currentPage="orders">
        <div className="max-w-6xl mx-auto p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="orders">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
            <Package size={32} className="text-green-600" />
            My Orders
          </h1>
          <p className="text-gray-600">View and manage all your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package size={64} className="text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">You have no orders yet</p>
            <p className="text-sm text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                onClick={() => navigate(`/orders/${order.order_id}`)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg cursor-pointer transition-all hover:border-green-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.order_id}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          order.status === "paid" || order.status === "shipped" || order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled" || order.status === "refunded"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {order.status === "delivered" ? "Đã nhận hàng" : order.status === "shipped" ? "Đã giao hàng" : order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span>{order.order_items?.length || 0} items</span>
                      </div>
                      {order.vendors && (
                        <span className="text-gray-500">from {order.vendors.store_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-6 flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign size={20} className="text-green-600" />
                      <p className="text-2xl font-bold text-green-600">
                        ${(Number(order.total) / 1000).toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Mark as Received Button - Only show for shipped orders */}
                    {order.status === "shipped" && (
                      <button
                        onClick={(e) => handleMarkAsReceived(order.order_id, e)}
                        disabled={markingReceived === order.order_id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 shadow-md shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {markingReceived === order.order_id ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Đang xử lý...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            <span>Đã nhận hàng</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Delivered status badge */}
                    {order.status === "delivered" && (
                      <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-green-700 font-medium text-sm">Đã nhận hàng</span>
                      </div>
                    )}
                    
                    <div 
                      className="flex items-center gap-1 text-green-600 text-sm font-medium cursor-pointer hover:text-green-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.order_id}`);
                      }}
                    >
                      <span>View Details</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default OrderHistory;

