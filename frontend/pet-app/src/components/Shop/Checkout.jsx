import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../hooks/useAuth.js";
import CartIcon from "./CartIcon.jsx";
import { Tag, X, CheckCircle } from "lucide-react";
import { showSuccess, showError, showWarning, showConfirm } from "../../utils/notifications";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Calculate totals - getTotal() returns price in smallest unit (already multiplied by 1000)
  const subtotalRaw = getTotal(); // This is already in smallest unit
  let discountAmount = 0;
  
  // Apply coupon discount
  if (appliedCoupon) {
    if (appliedCoupon.discount_percent) {
      discountAmount = (subtotalRaw * appliedCoupon.discount_percent) / 100;
    } else if (appliedCoupon.discount_amount) {
      discountAmount = appliedCoupon.discount_amount * 1000; // Convert to smallest unit
    }
  }
  
  const subtotalAfterDiscount = Math.max(0, subtotalRaw - discountAmount);
  const subtotal = subtotalRaw; // Price is already in VND (smallest unit)
  const tax = subtotalAfterDiscount * 0.1; // Tax in VND
  const shipping = subtotalAfterDiscount > 100000 ? 0 : 30000; // Shipping in VND (free if > 100,000 VND)
  const total = subtotalAfterDiscount + tax + shipping; // Total in VND

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã coupon");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      // Get vendor_id from cart items - try multiple paths
      const firstItem = cartItems[0];
      const vendorId = 
        firstItem?.product?.vendors?.vendor_id || 
        firstItem?.product?.vendor_id ||
        null;
      
      console.log("🔍 Checkout - Applying coupon:", {
        couponCode: couponCode.toUpperCase(),
        vendorId,
        product: firstItem?.product,
        vendors: firstItem?.product?.vendors
      });
      
      const res = await api.post("/coupons/validate", {
        code: couponCode.trim().toUpperCase(),
        vendor_id: vendorId !== null && vendorId !== undefined ? parseInt(vendorId) : null,
      });

      if (res.data.valid && res.data.coupon) {
        setAppliedCoupon(res.data.coupon);
        setCouponError("");
        showSuccess("Thành công", `Đã áp dụng coupon "${res.data.coupon.code}" thành công!`);
      } else {
        setCouponError("Coupon không hợp lệ");
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error("Error applying coupon:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Mã coupon không hợp lệ";
      setCouponError(errorMsg);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleCheckout = async () => {
    if (!user) {
      showWarning("Yêu cầu đăng nhập", "Vui lòng đăng nhập để đặt hàng");
      navigate("/login");
      return;
    }

    if (!shippingAddress.trim()) {
      showWarning("Thiếu thông tin", "Vui lòng nhập địa chỉ giao hàng");
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
        showError("Lỗi", "Giỏ hàng không hợp lệ. Vui lòng thử lại.");
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

      const orderData = {
        cartItems: cartItemsForAPI,
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod, // Include payment method
      };

      if (appliedCoupon) {
        orderData.couponCode = appliedCoupon.code;
      }

      console.log("📦 Creating order with data:", orderData);
      const response = await api.post("/orders", orderData);

      console.log("Order created successfully:", response.data);
      const orderId = response.data.order_id;

      // Handle payment based on selected method
      if (paymentMethod === "vnpay") {
        setProcessingPayment(true);
        try {
          const paymentResponse = await api.post("/payments/vnpay/create", {
            orderId: orderId,
          });

          if (paymentResponse.data.paymentUrl) {
            // Redirect to VNPAY
            window.location.href = paymentResponse.data.paymentUrl;
          } else {
            throw new Error("Không thể tạo URL thanh toán");
          }
        } catch (error) {
          console.error("Error creating payment:", error);
          showError("Lỗi", "Lỗi khi tạo thanh toán. Vui lòng thử lại.");
          setProcessingPayment(false);
        }
      } else if (paymentMethod === "cod") {
        // Cash on Delivery - no payment processing needed
        clearCart();
        showSuccess("Đặt hàng thành công", "Đơn hàng của bạn đã được tạo. Bạn sẽ thanh toán khi nhận hàng.");
        navigate(`/order-confirmation`, { state: { orderId, paymentMethod: "cod" } });
      } else {
        // For other payment methods (can be extended later)
        clearCart();
        navigate(`/order-confirmation`, { state: { orderId } });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi đặt hàng";
      showError("Lỗi đặt hàng", errorMessage);
      
      // If stock issue, suggest refreshing
      if (error.response?.status === 400 && errorMessage.includes("stock")) {
        const result = await showConfirm(
          "Sản phẩm hết hàng",
          "Sản phẩm có thể đã hết hàng. Bạn có muốn làm mới trang để cập nhật?",
          "Làm mới",
          "Hủy"
        );
        if (result.isConfirmed) {
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
                  {(((item.product?.price || 0) * item.quantity)).toLocaleString("vi-VN")} VND
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {/* Coupon Section */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã giảm giá
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={18} />
                    <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                    {appliedCoupon.discount_percent && (
                      <span className="text-sm text-gray-600">
                        -{appliedCoupon.discount_percent}%
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã coupon"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {validatingCoupon ? "..." : "Áp dụng"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-red-600 text-sm mt-2">{couponError}</p>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")} VND</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")} VND</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>{shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString("vi-VN")} VND`}</span>
              </div>
              <div className="flex justify-between">
                <span>Thuế ước tính</span>
                <span>{tax.toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng cộng</span>
                <span>{total.toLocaleString("vi-VN")} VND</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">VNPAY</span>
                    <p className="text-xs text-gray-500">Thanh toán trực tuyến qua VNPay</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</span>
                    <p className="text-xs text-gray-500">Thanh toán bằng tiền mặt khi nhận được hàng</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0 || processingPayment}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {processingPayment
                ? "Đang chuyển đến cổng thanh toán..."
                : loading
                ? "Đang xử lý..."
                : "Thanh toán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

