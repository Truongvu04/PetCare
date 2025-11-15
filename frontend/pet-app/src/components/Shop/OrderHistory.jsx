import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">You have no orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_id}
              onClick={() => navigate(`/orders/${order.order_id}`)}
              className="border rounded-lg p-4 hover:shadow-md cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Order #{order.order_id}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.order_items?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${(Number(order.total) / 1000).toFixed(2)}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-sm capitalize ${
                      order.status === "paid" || order.status === "shipped"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled" || order.status === "refunded"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

