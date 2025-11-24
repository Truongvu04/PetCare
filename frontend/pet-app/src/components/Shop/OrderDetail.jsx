import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig.js";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelOrder = async () => {
    try {
      await api.patch(`/orders/${order.order_id}/cancel`);
      // Refresh order details
      const response = await api.get("/orders/my-orders");
      const foundOrder = response.data.find((o) => o.order_id === parseInt(id));
      if (foundOrder) setOrder(foundOrder);
      setShowCancelModal(false);
      // Optional: Show a success toast here if you have a toast system
    } catch (error) {
      console.error("Error cancelling order:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || "Failed to cancel order";
      alert(`Error ${status || 'Unknown'}: ${message}`);
      setShowCancelModal(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/my-orders`);
        const foundOrder = response.data.find((o) => o.order_id === parseInt(id));
        if (foundOrder) {
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  if (!order) {
    return <div className="max-w-4xl mx-auto p-8">Order not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>

      {/* Order Summary Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide">Order Number</p>
            <p className="text-lg font-semibold text-gray-900">#{order.order_id}</p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide">Order Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide">Total Amount</p>
            <p className="text-lg font-semibold text-gray-900">${(Number(order.total) / 1000).toFixed(2)}</p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide">Payment Method</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {order.payment_method || "Credit Card"}
            </p>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Items</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Item</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Quantity</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.order_items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                        <img
                          src={item.products?.product_images?.[0]?.image_url
                            ? (item.products.product_images[0].image_url.startsWith('http')
                              ? item.products.product_images[0].image_url
                              : `http://localhost:5000${item.products.product_images[0].image_url}`)
                            : "https://via.placeholder.com/64"
                          }
                          alt={item.products?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-900">{item.products?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-green-600 font-medium">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">
                    ${(Number(item.price) / 1000).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Delivery Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide">Estimated Delivery</p>
            <p className="text-lg font-semibold text-gray-900">
              {(() => {
                if (!order?.created_at) return "N/A";
                const orderDate = new Date(order.created_at);
                const minDate = new Date(orderDate);
                minDate.setDate(minDate.getDate() + 3);
                const maxDate = new Date(orderDate);
                maxDate.setDate(maxDate.getDate() + 5);
                return `${minDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${maxDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
              })()}
            </p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm font-medium text-green-700 mb-1 uppercase tracking-wide">Shipping Address</p>
            <p className="text-lg font-semibold text-gray-900">
              {order.shipping_address || "Address not provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="justify-end mt-6 flex gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-2 bg-green-200 text-green-600 border border-green-400 rounded-lg hover:bg-green-100">
          Back to Orders
        </button>

        {order.status === 'pending' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-6 py-2 bg-red-200 text-red-600 border border-red-400 rounded-lg hover:bg-red-100">
            Cancel Order
          </button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {
        showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Order?</h3>
                <p className="text-gray-500 mb-8">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    No, Keep Order
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-200"
                  >
                    Yes, Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default OrderDetail;

