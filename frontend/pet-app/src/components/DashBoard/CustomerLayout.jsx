import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { getAvatarUrl } from "../../utils/avatarHelper.js";

const CustomerLayout = ({ children, currentPage = "dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    if (path === "/ai-chat") return "ai-chat";
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
  // Use role field primarily - only show vendor button if role === 'vendor'
  // For admin with vendor data, check vendor table data as secondary consideration
  const isVendor = !isVendorRoute && user?.role === 'vendor';
  // Admin can have vendor data - check vendor table data for admin users
  const hasVendorData = !isVendorRoute && isAdmin && (user?.vendor || user?.vendor_id);
  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="h-screen bg-[#fafafa] overflow-hidden">
      <div className="flex h-full">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Fixed Sidebar */}
        <aside className={`w-64 h-screen fixed left-0 top-0 border-r border-gray-200 bg-white flex flex-col z-40 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
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
                <p className="text-gray-900 font-semibold">{user?.full_name || "Guest"}</p>
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
              {/* Show Vendor Management button if user has vendor role */}
              {isVendor && (
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
                <span>Back to Home</span>
              </button>
              {/* Chat button */}
              <button 
                onClick={() => navigate("/ai-chat")}
                className={`w-full flex items-center space-x-2 text-left px-3 py-2 rounded-lg transition ${
                  currentKey === "ai-chat"
                    ? "bg-green-100 text-green-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MessageCircle size={18} />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Container - Scrollable (except for ai-chat) */}
        <div className={`flex-1 lg:ml-64 h-full ${currentPage === "ai-chat" ? "overflow-hidden" : "overflow-y-auto"}`}>
          <div className={`${currentPage === "ai-chat" ? "h-full px-6 py-6" : "max-w-[calc(1280px-16rem)]"} mx-auto`}>
            <main className={`${currentPage === "ai-chat" ? "h-full overflow-hidden" : "p-4 sm:p-6 lg:p-10 min-h-full pt-16 lg:pt-10"}`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;

