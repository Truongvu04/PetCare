import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";

const QuickAccessCards = ({ hasNewOrders = false, hasNewCartItems = false, hasNewPets = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const markAsRead = (type) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const key = `read_${type}_${user.user_id}_${today}`;
    localStorage.setItem(key, 'true');
  };

  if (!user) return null;

  const cards = [
    {
      title: "My Orders",
      description: "View order history",
      icon: <ShoppingBag className="text-green-600" size={24} />,
      path: "/orders",
      color: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      hasNew: hasNewOrders,
    },
    {
      title: "Shopping Cart",
      description: "View cart items",
      icon: <ShoppingCart className="text-green-600" size={24} />,
      path: "/cart",
      color: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
      hasNew: hasNewCartItems,
    },
    {
      title: "My Pets",
      description: "Manage your pets",
      icon: <User className="text-green-600" size={24} />,
      path: "/mypets",
      color: "bg-purple-50 hover:bg-purple-100",
      iconColor: "text-purple-600",
      hasNew: hasNewPets,
    },
  ];

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-lg p-4 sm:p-6 cursor-pointer transition-all border border-transparent hover:border-green-200 hover:shadow-md`}
            onClick={() => {
              if (card.hasNew) {
                const type = card.title === "My Orders" ? "orders" : 
                             card.title === "Shopping Cart" ? "cart" : "pets";
                markAsRead(type);
              }
              navigate(card.path);
            }}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className={`${card.iconColor} p-2 rounded-lg bg-white relative`}>
                {card.icon}
                {card.hasNew && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
                )}
              </div>
            </div>
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">{card.title}</h4>
            <p className="text-xs sm:text-sm text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessCards;

