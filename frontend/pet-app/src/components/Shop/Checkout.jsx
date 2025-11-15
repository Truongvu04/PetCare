import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../hooks/useAuth.js";
import CartIcon from "./CartIcon.jsx";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate totals - getTotal() returns price in smallest unit (already multiplied by 1000)
  const subtotalRaw = getTotal(); // This is already in smallest unit
  const subtotal = subtotalRaw / 1000; // Convert to dollars for display
  const tax = subtotalRaw * 0.1; // Tax in smallest unit
  const shipping = subtotalRaw > 100000 ? 0 : 30000; // Shipping in smallest unit (free if > $100)
  const total = subtotalRaw + tax + shipping; // Total in smallest unit

  const handleCheckout = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt hàng");
      navigate("/login");
      return;
    }

    if (!shippingAddress.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    setLoading(true);
    try {
      // Validate cart items have product data
      const validCartItems = cartItems.filter(item => {
        if (!item.productId) {
          console.warn("Cart item missing productId:", item);
          return false;
        }
        if (!item.product) {
          console.warn("Cart item missing product data:", item);
          return false;
        }
        return true;
      });

      if (validCartItems.length === 0) {
        alert("Giỏ hàng không hợp lệ. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      // Prepare cart items for API (ensure productId and quantity are numbers)
      const cartItemsForAPI = validCartItems.map((item) => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
      }));

      console.log("Sending order request:", {
        cartItems: cartItemsForAPI,
        shippingAddress,
        itemCount: cartItemsForAPI.length,
      });

      const response = await api.post("/orders", {
        cartItems: cartItemsForAPI,
        shippingAddress: shippingAddress.trim(),
      });

      console.log("Order created successfully:", response.data);

      clearCart();
      navigate(`/order-confirmation`, { state: { orderId: response.data.order_id } });
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi đặt hàng";
      alert(`Lỗi khi đặt hàng: ${errorMessage}`);
      
      // If stock issue, suggest refreshing
      if (error.response?.status === 400 && errorMessage.includes("stock")) {
        if (confirm("Sản phẩm có thể đã hết hàng. Bạn có muốn làm mới trang để cập nhật?")) {
          window.location.reload();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 relative">
      {/* Floating Cart Button - hidden on checkout page */}
      <div className="hidden">
        <CartIcon showFloating={true} />
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your shipping address"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
          />

          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{item.product?.name || "Product"}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  ${(((item.product?.price || 0) / 1000) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${(shipping / 1000).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span>${(tax / 1000).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${(total / 1000).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

