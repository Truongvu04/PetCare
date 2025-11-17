import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";

const RoleBasedNavigation = ({ className = "" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const navItems = [
    {
      label: "My Orders",
      icon: <ShoppingBag size={18} />,
      path: "/orders",
      description: "View order history",
    },
    {
      label: "My Cart",
      icon: <ShoppingCart size={18} />,
      path: "/cart",
      description: "Shopping cart",
    },
    {
      label: "My Pets",
      icon: <User size={18} />,
      path: "/mypets",
      description: "Manage pets",
    },
  ];

  return (
    <div className={`role-based-navigation ${className}`}>
      <div className="flex items-center gap-2">
        {navItems.map((item, index) => (
          <div key={index} className="relative group">
            <button
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
              title={item.description}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleBasedNavigation;

