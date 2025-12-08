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
    const status = new URLSearchParams(location.search).get("status");
    
    if (orderId) {
      fetchOrder(orderId);
    } else if (status === "missing") {
      setLoading(false);
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

  const status = new URLSearchParams(location.search).get("status");

  if (!order && status !== "missing") {
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

  if (status === "fail") {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">✕</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h1>
          <p className="text-gray-600 mb-6">
            Giao dịch của bạn không thành công. Vui lòng thử lại.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/cart/checkout")}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Thử lại thanh toán
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Xem đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "missing") {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Không tìm thấy thông tin thanh toán</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Xem đơn hàng
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        {status === "success" ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-600">
              Đơn hàng của bạn đã được xác nhận và thanh toán thành công.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-green-700 mb-2">Đơn hàng đã được đặt!</h1>
            <p className="text-gray-600">
              Đơn hàng của bạn đã được tạo thành công. Vui lòng thanh toán để hoàn tất.
            </p>
          </>
        )}
      </div>

      <div className="flex justify-center mb-12">
        <div className="relative w-full max-w-2xl aspect-[4/3] bg-[#fdf6f0] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          {/* Display the first image as the main large image, or a grid if multiple */}
          {order.order_items?.length === 1 ? (
            (() => {
              const item = order.order_items[0];
              const thumbnail = item.products?.product_images?.find(img => img.is_thumbnail);
              return (
                <img
                  src={thumbnail
                    ? (thumbnail.image_url?.startsWith('http') ? thumbnail.image_url : `http://localhost:5000${thumbnail.image_url}`)
                    : "https://via.placeholder.com/400"
                  }
                  alt={item.products?.name}
                  className="h-full object-contain p-8"
                  onError={(e) => e.target.src = "https://via.placeholder.com/400"}
                />
              );
            })()
          ) : (
            <div className="grid grid-cols-2 gap-4 p-8 w-full h-full place-items-center overflow-y-auto">
              {order.order_items?.map((item) => {
                const thumbnail = item.products?.product_images?.find(img => img.is_thumbnail);
                return (
                  <div key={item.id} className="relative w-full h-48 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                    <img
                      src={thumbnail
                        ? (thumbnail.image_url?.startsWith('http') ? thumbnail.image_url : `http://localhost:5000${thumbnail.image_url}`)
                        : "https://via.placeholder.com/150"
                      }
                      alt={item.products?.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                      x{item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="font-semibold">{Number(order.total).toLocaleString("vi-VN")} VND</p>
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
    </div >
  );
};

export default OrderConfirmation;

