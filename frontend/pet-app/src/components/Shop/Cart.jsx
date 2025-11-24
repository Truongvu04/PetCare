import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, CreditCard, CheckCircle } from "lucide-react";
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

  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const handleCheckout = () => {
    setShowConfirmation(true);
  };

  const confirmCheckout = () => {
    setShowConfirmation(false);
    navigate("/cart/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added anything yet.</p>
        <button
          onClick={() => navigate("/shop")}
          className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-xl font-medium text-lg">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 relative">
      {/* Floating Cart Button - hidden on cart page */}
      <div className="hidden">
        <CartIcon showFloating={true} />
      </div>

      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-center w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mb-2 ring-4 ring-white">1</div>
            <span className="text-sm font-semibold text-green-700">Cart</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 -mx-4 relative top-[-14px] z-0"></div>
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2 ring-4 ring-white">2</div>
            <span className="text-sm font-medium text-gray-500">Shipping</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 -mx-4 relative top-[-14px] z-0"></div>
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2 ring-4 ring-white">3</div>
            <span className="text-sm font-medium text-gray-500">Payment</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 mb-6 hover:text-green-700 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Continue Shopping
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart ({cartItems.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => {
            const thumbnail = item.product?.product_images?.find(
              (img) => img.is_thumbnail === true
            );
            return (
              <div key={item.productId} className="flex gap-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={
                      thumbnail
                        ? (thumbnail.image_url?.startsWith('http')
                          ? thumbnail.image_url
                          : `http://localhost:5000${thumbnail.image_url}`)
                        : "https://via.placeholder.com/150"
                    }
                    alt={item.product?.name || "Product"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{item.product?.name || "Product"}</h3>
                      <p className="text-sm text-gray-500">Unit Price: ${((item.product?.price || 0) / 1000).toFixed(2)}</p>
                    </div>
                    <p className="font-bold text-lg text-green-700">
                      ${(((item.product?.price || 0) * item.quantity) / 1000).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-green-600 shadow-sm"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-700">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-green-600 shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">${(subtotal / 1000).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-green-600">{shipping === 0 ? "Free" : `$${(shipping / 1000).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax</span>
                <span className="font-medium">${(tax / 1000).toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-100 my-4"></div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-700">${(total / 1000).toFixed(2)}</span>
                  <p className="text-xs text-gray-400 mt-1">Including VAT</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <button className="absolute right-2 top-2 px-4 py-1 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 hover:-translate-y-0.5 font-bold text-lg flex items-center justify-center gap-2">
              Proceed to Checkout
              <ArrowLeft size={20} className="rotate-180" />
            </button>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <ShieldCheck size={18} className="text-green-600" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <CheckCircle size={18} className="text-green-600" />
                <span>30-Day Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Checkout?</h3>
              <p className="text-gray-500 mb-8">
                Are you sure you want to proceed to checkout with these items?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckout}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-200"
                >
                  Yes, Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

