import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { Trash2, Plus, Minus } from "lucide-react";
import CartIcon from "./CartIcon.jsx";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();

  // getTotal() already returns price in smallest unit
  const subtotalRaw = getTotal();
  const subtotal = subtotalRaw / 1000; // Convert to dollars for display
  const tax = subtotalRaw * 0.1; // Tax in smallest unit
  const shipping = subtotalRaw > 100000 ? 0 : 30000; // Shipping in smallest unit
  const total = subtotalRaw + tax + shipping; // Total in smallest unit

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 relative">
      {/* Floating Cart Button - hidden on cart page */}
      <div className="hidden">
        <CartIcon showFloating={true} />
      </div>
      
      <div className="text-sm text-green-700 mb-4">
        Marketplace / Cart
      </div>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          {cartItems.map((item) => {
            const thumbnail = item.product?.product_images?.find(
              (img) => img.is_thumbnail === true
            );
            return (
              <div key={item.productId} className="flex gap-4 border rounded-lg p-4">
                <img
                  src={
                    thumbnail
                      ? (thumbnail.image_url?.startsWith('http') 
                          ? thumbnail.image_url 
                          : `http://localhost:5000${thumbnail.image_url}`)
                      : "https://via.placeholder.com/150"
                  }
                  alt={item.product?.name || "Product"}
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product?.name || "Product"}</h3>
                  <p className="text-gray-600">${((item.product?.price || 0) / 1000).toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 border rounded">
                      <Minus size={16} />
                    </button>
                    <span className="px-3">Quantity: {item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 border rounded">
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="ml-auto text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(subtotal / 1000).toFixed(2)}</span>
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

          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter coupon code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={() => navigate("/cart/checkout")}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

