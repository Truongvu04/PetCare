import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../hooks/useAuth.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { Mail, Phone, User, MessageCircle } from "lucide-react";
import { showSuccess, showError } from "../../utils/notifications";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelOrder = async () => {
    try {
      await api.patch(`/orders/${order.order_id}/cancel`);
      // Refresh order details
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
      setShowCancelModal(false);
      showSuccess("Thành công", "Đơn hàng đã được hủy thành công!");
    } catch (error) {
      console.error("Error cancelling order:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || "Không thể hủy đơn hàng";
      showError("Lỗi", `Lỗi ${status || 'Unknown'}: ${message}`);
      setShowCancelModal(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order:", error);
        if (error.response?.status === 404) {
          // Order not found - will be handled in render
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <CustomerLayout currentPage="orders">
        <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout currentPage="orders">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Order not found</p>
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Back to Orders
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout currentPage="orders">
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
                    {Number(item.price).toLocaleString("en-US")} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Breakdown Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Price Breakdown</h2>
        <div className="space-y-3">
          {(() => {
            const itemsSubtotal = order.order_items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
            const subtotalAfterDiscount = order.subtotal || itemsSubtotal;
            const discountAmount = itemsSubtotal - subtotalAfterDiscount;
            const shippingFee = order.shipping || 0;
            // Tax removed - no tax applied to orders
            const total = order.total || (subtotalAfterDiscount + shippingFee);
            
            return (
              <>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">{Number(itemsSubtotal).toLocaleString("en-US")} VND</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-green-600 font-medium">Discount:</span>
                    <span className="text-green-600 font-semibold">-{Number(discountAmount).toLocaleString("en-US")} VND</span>
                  </div>
                )}
                {shippingFee > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">Shipping Fee:</span>
                    <span className="text-gray-900 font-semibold">{Number(shippingFee).toLocaleString("en-US")} VND</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-gray-300 mt-2">
                  <span className="text-lg font-bold text-gray-900">Total Payment:</span>
                  <span className="text-2xl font-bold text-green-600">{Number(total).toLocaleString("en-US")} VND</span>
                </div>
              </>
            );
          })()}
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

      {/* Contact Information Section */}
      {user && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="text-green-600" size={18} />
                <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Name</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {user.full_name || user.name || "Not provided"}
              </p>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="text-green-600" size={18} />
                <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Email</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {user.email || "Not provided"}
              </p>
            </div>
            {user.phone && (
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="text-green-600" size={18} />
                  <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Phone</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {user.phone}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="justify-end mt-6 flex gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium">
          Back to Orders
        </button>

        {order.status === 'pending' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-6 py-2 bg-red-600 text-white border border-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium">
            Cancel Order
          </button>
        )}

        <button
          onClick={() => {
            // Contact Support functionality - can be implemented later
            const subject = encodeURIComponent(`Order #${order.order_id} - Support Request`);
            const body = encodeURIComponent(`I need help with order #${order.order_id}`);
            window.location.href = `mailto:support@petcare.com?subject=${subject}&body=${body}`;
          }}
          className="px-6 py-2 bg-green-600 text-white border border-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
          <MessageCircle size={18} />
          Contact Support
        </button>
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
      </div>
    </CustomerLayout>
  );
};

export default OrderDetail;

