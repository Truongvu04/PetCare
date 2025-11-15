import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  ShoppingBag,
  Package,
  FileText,
  Plus,
  ShoppingCart,
  Calendar,
  User,
} from "lucide-react";

const QuickAccessCards = () => {
  const navigate = useNavigate();
  const { user, vendor } = useAuth();

  if (!user) return null;

  // Customer Quick Access Cards
  const customerCards = [
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

  // Vendor Quick Access Cards
  const vendorCards = [
    {
      title: "Manage Products",
      description: "View and edit products",
      icon: <Package className="text-green-600" size={24} />,
      path: "/vendor/products",
      color: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      action: {
        label: "Add Product",
        path: "/vendor/products/add",
        icon: <Plus size={16} />,
      },
    },
    {
      title: "Manage Orders",
      description: "View and process orders",
      icon: <FileText className="text-green-600" size={24} />,
      path: "/vendor/orders",
      color: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Manage Services",
      description: "Add and edit services",
      icon: <Calendar className="text-green-600" size={24} />,
      path: "/vendor/services/add",
      color: "bg-purple-50 hover:bg-purple-100",
      iconColor: "text-purple-600",
      action: {
        label: "Add Service",
        path: "/vendor/services/add",
        icon: <Plus size={16} />,
      },
    },
  ];

  const cards = vendor ? vendorCards : customerCards;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {vendor ? "Quick Access" : "Quick Actions"}
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
              {card.action && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(card.action.path);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-white rounded-md hover:bg-green-50 transition"
                >
                  {card.action.icon}
                  {card.action.label}
                </button>
              )}
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

