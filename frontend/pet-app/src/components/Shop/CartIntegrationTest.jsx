/**
 * Cart Integration Test Component
 * This component helps test the cart API integration
 * Can be temporarily added to test cart functionality
 */

import React, { useEffect, useState } from "react";
import { useCart } from "./CartContext.jsx";
import api from "../../api/axiosConfig.js";
import { useAuth } from "../../hooks/useAuth.js";

const CartIntegrationTest = () => {
  const { cartItems, getTotal } = useCart();
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCheckout = async () => {
    if (!user) {
      setTestResult({ success: false, message: "User not logged in" });
      return;
    }

    if (cartItems.length === 0) {
      setTestResult({ success: false, message: "Cart is empty" });
      return;
    }

    setLoading(true);
    try {
      const cartItemsForAPI = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await api.post("/orders", {
        cartItems: cartItemsForAPI,
        shippingAddress: "Test Address",
      });

      setTestResult({
        success: true,
        message: `Order created successfully! Order ID: ${response.data.order_id}`,
        data: response.data,
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Cart Integration Test</h3>
      <div className="text-sm mb-2">
        <p>Cart Items: {cartItems.length}</p>
        <p>Total: {getTotal().toLocaleString("vi-VN")} VND</p>
        <p>User: {user ? user.full_name : "Not logged in"}</p>
      </div>
      <button
        onClick={testCheckout}
        disabled={loading || !user || cartItems.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Testing..." : "Test Checkout API"}
      </button>
      {testResult && (
        <div className={`mt-2 p-2 rounded ${testResult.success ? "bg-green-100" : "bg-red-100"}`}>
          <p className="font-semibold">{testResult.success ? "✓ Success" : "✗ Error"}</p>
          <p className="text-sm">{testResult.message}</p>
          {testResult.data && (
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default CartIntegrationTest;

