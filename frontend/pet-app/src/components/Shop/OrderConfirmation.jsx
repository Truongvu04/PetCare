import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../hooks/useAuth.js";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = location.state?.orderId || new URLSearchParams(location.search).get("orderId");
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setLoading(false);
    }
  }, [location]);

  const fetchOrder = async (orderId) => {
    try {
      const response = await api.get("/orders/my-orders");
      const foundOrder = response.data.find((o) => o.order_id === parseInt(orderId));
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryDate = () => {
    if (!order?.created_at) return "N/A";
    const orderDate = new Date(order.created_at);
    const minDate = new Date(orderDate);
    minDate.setDate(minDate.getDate() + 3);
    const maxDate = new Date(orderDate);
    maxDate.setDate(maxDate.getDate() + 5);
    return `${minDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${maxDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Order confirmed!</h1>
        <p className="text-gray-600">
          Your order has been placed successfully. You will receive an email confirmation shortly.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">🐕</div>
            <p className="text-gray-500 text-sm">Pet Illustration</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-semibold">#{order.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-semibold">${(Number(order.total) / 1000).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-semibold">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-semibold capitalize">
              {order.payment_method || "Credit Card"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Estimated Delivery</p>
            <p className="font-semibold">{calculateDeliveryDate()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Shipping Address</p>
            <p className="font-semibold">
              {order.shipping_address || "Address not provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate(`/orders/${order.order_id}`)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
          View Order Details
        </button>
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-3 bg-gray-100 text-green-700 rounded-lg hover:bg-gray-200 font-semibold">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;

