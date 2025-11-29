import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext.jsx";

const CartIcon = ({ className = "", showFloating = false }) => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  if (showFloating) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate("/cart")}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 group"
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          <ShoppingCart size={28} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
          {isHovered && itemCount > 0 && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-3 min-w-[200px] border border-gray-200">
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
              </div>
              <div className="text-sm text-green-600 font-bold">
                Total: {totalPrice.toLocaleString("vi-VN")} VND
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Click to view cart
              </div>
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate("/cart")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-2 rounded-lg transition-all hover:bg-green-50 group ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart 
        size={24} 
        className="text-gray-700 group-hover:text-green-600 transition-colors" 
      />
      {itemCount > 0 && (
        <>
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
          {isHovered && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-3 min-w-[180px] border border-gray-200 z-50">
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </div>
              <div className="text-sm text-green-600 font-bold">
                {totalPrice.toLocaleString("vi-VN")} VND
              </div>
            </div>
          )}
        </>
      )}
    </button>
  );
};

export default CartIcon;

