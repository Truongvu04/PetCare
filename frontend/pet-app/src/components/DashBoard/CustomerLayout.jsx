import React from "react";
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
  Store,
  Shield,
} from "lucide-react";
import { getAvatarUrl } from "../../utils/avatarHelper.js";

const CustomerLayout = ({ children, currentPage = "dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard", key: "dashboard" },
    { name: "My Pets", icon: <PawPrint size={18} />, path: "/mypets", key: "mypets" },
    { name: "Reminders", icon: <Bell size={18} />, path: "/reminder", key: "reminder" },
    { name: "Health & Activity", icon: <Heart size={18} />, path: "/health", key: "health" },
    { name: "Expenses", icon: <DollarSign size={18} />, path: "/expenses", key: "expenses" },
    { name: "Calendar", icon: <Calendar size={18} />, path: "/calendar", key: "calendar" },
    { name: "My Orders", icon: <FileText size={18} />, path: "/orders", key: "orders" },
    { name: "Shop", icon: <ShoppingBag size={18} />, path: "/shops", key: "shop" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings/notifications", key: "settings" },
  ];

  const getCurrentKey = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/mypets" || path.startsWith("/viewprofile") || path.startsWith("/editprofile") || path === "/addnewpets") return "mypets";
    if (path === "/reminder" || path.startsWith("/reminder/")) return "reminder";
    if (path === "/health") return "health";
    if (path === "/expenses") return "expenses";
    if (path === "/calendar") return "calendar";
    if (path === "/orders" || path.startsWith("/orders/")) return "orders";
    if (path === "/shops" || path.startsWith("/shop/")) return "shop";
    if (path === "/settings" || path.startsWith("/settings/")) return "settings";
    return currentPage;
  };

  const currentKey = getCurrentKey();

  const handleMenuClick = (item) => {
    navigate(item.path);
  };

  // Check user roles for conditional navigation
  // Only show role-based buttons if user is logged in AND not on vendor routes
  const isVendorRoute = location.pathname.startsWith('/vendor');
  const isAdmin = !isVendorRoute && user?.role === 'admin';
  const isVendor = !isVendorRoute && (user?.role === 'vendor' || user?.vendor);
  // Admin can have vendor data - check both user.vendor object and vendor_id
  const hasVendorData = !isVendorRoute && (user?.vendor || (isAdmin && (user?.vendor || user?.vendor_id)));
  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="h-screen bg-[#fafafa] overflow-hidden">
      <div className="flex h-full">
        {/* Fixed Sidebar */}
        <aside className="w-64 h-screen fixed left-0 top-0 border-r border-gray-200 bg-white flex flex-col z-10">
          <div className="p-6 flex flex-col h-full overflow-y-auto">
            {/* Header Section */}
            <div className="flex items-center space-x-3 mb-8 shrink-0">
              <Link to="/">
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-400 transition border border-gray-200"
                />
              </Link>
              <div>
                <p className="text-gray-900 font-semibold">{user?.full_name || "Khách"}</p>
              </div>
            </div>

            {/* Navigation Menu - Scrollable if needed */}
            <nav className="flex flex-col space-y-2 flex-1 min-h-0">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item)}
                  className={`flex items-center space-x-2 text-left px-3 py-2 rounded-lg transition shrink-0 ${
                    currentKey === item.key
                      ? "bg-green-100 text-green-800 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Footer Section - Always visible at bottom */}
            <div className="pt-4 border-t border-gray-100 space-y-2 shrink-0 mt-auto">
              {/* Role-based navigation buttons */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="w-full flex items-center space-x-2 text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Shield size={18} />
                    <span>Admin Management</span>
                  </button>
                  {hasVendorData && (
                    <button
                      onClick={() => navigate("/vendor/dashboard")}
                      className="w-full flex items-center space-x-2 text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                      <Store size={18} />
                      <span>Vendor Management</span>
                    </button>
                  )}
                </>
              )}
              {isVendor && !isAdmin && (
                <button
                  onClick={() => navigate("/vendor/dashboard")}
                  className="w-full flex items-center space-x-2 text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  <Store size={18} />
                  <span>Vendor Management</span>
                </button>
              )}
              {/* Back to Home button */}
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center space-x-2 text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                <Home size={18} />
                <span>Về trang chủ</span>
              </button>
              {/* Chat button */}
              <button className="w-full flex items-center space-x-2 text-left px-3 py-2 rounded-lg text-gray-900 hover:text-green-700 transition">
                <MessageCircle size={18} />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Container - Scrollable */}
        <div className="flex-1 ml-64 h-full overflow-y-auto">
          <div className="max-w-[calc(1280px-16rem)] mx-auto">
            <main className="p-10 min-h-full">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;

