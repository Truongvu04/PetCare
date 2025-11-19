import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  Home,
  PawPrint,
  Bell,
  Heart,
  DollarSign,
  Calendar,
  ShoppingBag,
  Settings,
  MessageCircle,
  FileText,
} from "lucide-react";
import OrderHistory from "../Shop/OrderHistory.jsx";

const CustomerLayout = ({ children, currentPage = "dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showOrders, setShowOrders] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard", key: "dashboard" },
    { name: "My Pets", icon: <PawPrint size={18} />, path: "/mypets", key: "mypets" },
    { name: "Reminders", icon: <Bell size={18} />, path: "/reminder", key: "reminder" },
    { name: "Health & Activity", icon: <Heart size={18} />, path: "/health", key: "health" },
    { name: "Expenses", icon: <DollarSign size={18} />, path: "/expenses", key: "expenses" },
    { name: "Calendar", icon: <Calendar size={18} />, path: "/calendar", key: "calendar" },
    { name: "My Orders", icon: <FileText size={18} />, path: "/orders", key: "orders", isOrders: true },
    { name: "Shop", icon: <ShoppingBag size={18} />, path: "/shops", key: "shop" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings", key: "settings" },
  ];

  const isOrdersRoute = location.pathname === "/orders" || location.pathname.startsWith("/orders/");
  
  useEffect(() => {
    if (isOrdersRoute) {
      setShowOrders(true);
    } else {
      setShowOrders(false);
    }
  }, [isOrdersRoute]);

  const getCurrentKey = () => {
    if (showOrders) return "orders";
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/mypets" || path.startsWith("/viewprofile") || path.startsWith("/editprofile") || path === "/addnewpets") return "mypets";
    if (path === "/reminder") return "reminder";
    if (path === "/health") return "health";
    if (path === "/expenses") return "expenses";
    if (path === "/calendar") return "calendar";
    if (path === "/orders" || path.startsWith("/orders/")) return "orders";
    if (path === "/shops" || path.startsWith("/shop/")) return "shop";
    if (path === "/settings") return "settings";
    return currentPage;
  };

  const currentKey = getCurrentKey();

  const handleMenuClick = (item) => {
    if (item.isOrders) {
      setShowOrders(true);
    } else {
      setShowOrders(false);
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      <div className="w-full max-w-[1280px] bg-white flex">
        <aside className="w-64 min-h-screen border-r border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <Link to="/">
                <img
                  src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-400 transition"
                />
              </Link>
              <div>
                <p className="text-gray-900 font-semibold">{user?.full_name || "Khách"}</p>
              </div>
            </div>

            <nav className="flex flex-col space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item)}
                  className={`flex items-center space-x-2 text-left px-3 py-2 rounded-lg transition ${
                    currentKey === item.key
                      ? "bg-green-100 text-green-800 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <button className="flex items-center space-x-2 text-gray-900 hover:text-green-700 mt-auto pt-4 border-t border-gray-100">
            <MessageCircle size={18} />
            <span>Chat</span>
          </button>
        </aside>

        <main className="flex-1 p-10 overflow-y-auto">
          {showOrders ? <OrderHistory /> : children}
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;

