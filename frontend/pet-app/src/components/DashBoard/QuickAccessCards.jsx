import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";

const QuickAccessCards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const cards = [
    {
      title: "My Orders",
      description: "View order history",
      icon: <ShoppingBag className="text-green-600" size={24} />,
      path: "/orders",
      color: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Shopping Cart",
      description: "View cart items",
      icon: <ShoppingCart className="text-green-600" size={24} />,
      path: "/cart",
      color: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "My Pets",
      description: "Manage your pets",
      icon: <User className="text-green-600" size={24} />,
      path: "/mypets",
      color: "bg-purple-50 hover:bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-lg p-6 cursor-pointer transition-all border border-transparent hover:border-green-200 hover:shadow-md`}
            onClick={() => navigate(card.path)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${card.iconColor} p-2 rounded-lg bg-white`}>
                {card.icon}
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{card.title}</h4>
            <p className="text-sm text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessCards;

