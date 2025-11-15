import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  ShoppingBag,
  Package,
  ShoppingCart,
  FileText,
  Plus,
  Edit,
  List,
  Calendar,
  User,
  Home,
} from "lucide-react";

const RoleBasedNavigation = ({ className = "" }) => {
  const navigate = useNavigate();
  const { user, vendor } = useAuth();

  if (!user) {
    return null;
  }

  // Customer Navigation Items
  const customerNavItems = [
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

  // Vendor Navigation Items
  const vendorNavItems = [
    {
      label: "Products",
      icon: <Package size={18} />,
      path: "/vendor/products",
      description: "Manage products",
      subItems: [
        {
          label: "All Products",
          path: "/vendor/products",
          icon: <List size={16} />,
        },
        {
          label: "Add Product",
          path: "/vendor/products/add",
          icon: <Plus size={16} />,
        },
      ],
    },
    {
      label: "Services",
      icon: <Calendar size={18} />,
      path: "/vendor/services/add",
      description: "Manage services",
      subItems: [
        {
          label: "Add Service",
          path: "/vendor/services/add",
          icon: <Plus size={16} />,
        },
      ],
    },
    {
      label: "Orders",
      icon: <FileText size={18} />,
      path: "/vendor/orders",
      description: "Manage orders",
    },
    {
      label: "Dashboard",
      icon: <Home size={18} />,
      path: "/vendor/dashboard",
      description: "Vendor dashboard",
    },
  ];

  const navItems = vendor ? vendorNavItems : customerNavItems;

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

            {/* Dropdown menu for items with subItems */}
            {item.subItems && item.subItems.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[55]">
                <div className="py-2">
                  {item.subItems.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => navigate(subItem.path)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                    >
                      {subItem.icon}
                      {subItem.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleBasedNavigation;

