import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { CartProvider } from "./components/Shop/CartContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./hooks/useAuth.js";

import HomePage from "./components/Home/HomePage.jsx";
import IntroPage from "./components/Home/IntroPage.jsx";
import LoginPage from "./components/Auth/LoginPage.jsx";
import Shop from "./components/Shop/Shop.jsx";
import ProductDetail from "./components/Shop/ProductDetail.jsx";
import Cart from "./components/Shop/Cart.jsx";
import Checkout from "./components/Shop/Checkout.jsx";
import OrderHistory from "./components/Shop/OrderHistory.jsx";
import OrderDetail from "./components/Shop/OrderDetail.jsx";
import ReviewForm from "./components/Shop/ReviewForm.jsx";
import VetMap from "./components/Map/VetMap.jsx";
import CartIcon from "./components/Shop/CartIcon.jsx";
import CustomerLayout from "./components/DashBoard/CustomerLayout.jsx";

import PetOwnerDashboard from "./components/DashBoard/PetOwnerDashBoard.jsx";
import MyPets from "./components/Pets/MyPets.jsx";
import AddNewPet from "./components/Pets/AddNewPet.jsx";
import ViewProfile from "./components/Pets/ViewProfile.jsx";
import EditProfile from "./components/Pets/EditProfile.jsx";
import Reminders from "./components/Reminders/Reminder.jsx";
import ReminderList from "./components/Reminders/ReminderList.jsx";
import EditReminder from "./components/Reminders/EditReminder.jsx";
import HealthActivity from "./components/HealthyActivity/HealthyActivity.jsx";
import HealthTracking from "./components/HealthTracking/HealthTracking.jsx";
import Expenses from "./components/Expenses/Expenses.jsx";
import Calendar from "./components/Calendar/Calendar.jsx";
import AIChatbot from "./components/AIChatbot/AIChatbot.jsx";
import OrderConfirmation from "./components/Shop/OrderConfirmation.jsx";
import NotificationSettings from "./components/Settings/NotificationSettings.jsx";
import VendorListings from "./components/Marketplace/VendorListings.jsx";
import UserCouponWallet from "./components/Coupons/UserCouponWallet.jsx";

import VendorRegister from "./components/Vendor/VendorRegister.jsx";
import VendorLayout from "./components/Vendor/VendorLayout.jsx";
import VendorDashboard from "./components/Vendor/VendorDashboard.jsx";
import ProductManagement from "./components/Vendor/ProductManagement.jsx";
import CouponManagement from "./components/Vendor/CouponManagement.jsx";
import OrderManagement from "./components/Vendor/OrderManagement.jsx";
import ShopSettings from "./components/Vendor/ShopSettings.jsx";
import AccountSettings from "./components/Settings/AccountSettings.jsx";
import VendorAccountSettings from "./components/Vendor/AccountSettings.jsx";

import AdminLayout from "./components/Admin/AdminLayout.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import AdminCouponManagement from "./components/Admin/CouponManagement.jsx";
import UserManagement from "./components/Admin/UserManagement.jsx";
import ProductModeration from "./components/Admin/ProductModeration.jsx";
import VendorManagement from "./components/Admin/VendorManagement.jsx";
import VaccineManagement from "./components/Admin/VaccineManagement.jsx";

// AdminProtectedRoute - checks if user has admin role
const AdminProtectedRouteWrapper = ({ children }) => {
  const { user, loading, token } = useAuth();

  const tokenInStorage = localStorage.getItem('token');
  const userInfoInStorage = localStorage.getItem('userInfo');

  let parsedUserInfo = null;
  if (userInfoInStorage) {
    try {
      parsedUserInfo = JSON.parse(userInfoInStorage);
    } catch (e) {
      console.warn("⚠️ Invalid userInfo in localStorage");
    }
  }

  if (loading || (tokenInStorage && !user && parsedUserInfo)) {
    if (parsedUserInfo && parsedUserInfo.role === 'admin') {
      console.log("🔍 AdminProtectedRoute: UserInfo in storage is admin, waiting for AuthProvider sync.");
      return (
        <div className="min-h-screen flex justify-center items-center text-gray-600">
          Loading user information...
        </div>
      );
    }
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (!token && !tokenInStorage) {
    console.warn("⚠️ AdminProtectedRoute: No token found, redirecting to home");
    return <Navigate to="/" replace />;
  }

  const userRole = user?.role || parsedUserInfo?.role;

  if (user || parsedUserInfo) {
    if (userRole !== 'admin') {
      console.warn("⚠️ AdminProtectedRoute: User role is not admin:", userRole, "redirecting to home");
      return <Navigate to="/" replace />;
    }
    console.log("✅ AdminProtectedRoute: User is admin, allowing access. Role:", userRole);
    return children;
  }

  console.warn("⚠️ AdminProtectedRoute: Fallback - No token and no user, redirecting to home");
  return <Navigate to="/" replace />;
};

// VendorProtectedRoute - checks if user has vendor role
const VendorProtectedRouteWrapper = ({ children }) => {
  const { user, loading, token } = useAuth();

  // Check token and userInfo in localStorage as fallback (in case user state hasn't updated yet)
  const tokenInStorage = localStorage.getItem('token');
  const userInfoInStorage = localStorage.getItem('userInfo');
  
  // Parse userInfo from storage if available
  let parsedUserInfo = null;
  if (userInfoInStorage) {
    try {
      parsedUserInfo = JSON.parse(userInfoInStorage);
    } catch (e) {
      console.warn("⚠️ Invalid userInfo in localStorage");
    }
  }

  // Debug logging
  console.log("🔍 VendorProtectedRouteWrapper:", {
    loading,
    hasToken: !!token,
    hasTokenInStorage: !!tokenInStorage,
    hasUser: !!user,
    userRole: user?.role,
    hasUserInfoInStorage: !!parsedUserInfo,
    parsedUserRole: parsedUserInfo?.role,
    pathname: window.location.pathname
  });

  // Wait for auth to finish loading OR if we have token but user state hasn't synced yet
  if (loading) {
    console.log("⏳ VendorProtectedRoute: Auth is loading, waiting...");
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Checking access permissions...
      </div>
    );
  }

  // If we have token but no user state yet, check localStorage
  if (tokenInStorage && !user && parsedUserInfo) {
    console.log("⏳ VendorProtectedRoute: Token exists but user state not synced, checking localStorage...");
    console.log("🔍 Parsed userInfo:", parsedUserInfo);
    // If we have userInfo with vendor role, allow access (AuthProvider will sync soon)
    if (parsedUserInfo.role === 'vendor') {
      console.log("✅ VendorProtectedRoute: Found vendor role in localStorage, allowing access");
      return children; // Allow access immediately if role is vendor in localStorage
    } else {
      console.warn("⚠️ VendorProtectedRoute: UserInfo in localStorage but role is not vendor:", parsedUserInfo.role);
      console.warn("⚠️ Full parsedUserInfo:", JSON.stringify(parsedUserInfo, null, 2));
      // Only allow admin with vendor object, not owners
      if (parsedUserInfo.role === 'admin' && parsedUserInfo.vendor) {
        console.log("✅ VendorProtectedRoute: Admin with vendor object, allowing access");
        return children;
      }
      // Wait a bit more for AuthProvider to sync
      return (
        <div className="min-h-screen flex justify-center items-center text-gray-600">
          Loading user information...
        </div>
      );
    }
  }

  // If no token at all, redirect
  if (!token && !tokenInStorage) {
    console.warn("⚠️ VendorProtectedRoute: No token found, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // Check role from user state OR from localStorage (fallback)
  // Also check if user has vendor object (might be vendor even if role not explicitly set)
  const userRole = user?.role || parsedUserInfo?.role;
  const hasVendorObject = !!(user?.vendor || parsedUserInfo?.vendor);
  
  console.log("🔍 VendorProtectedRoute: Checking role - userRole:", userRole, "user?.role:", user?.role, "parsedUserInfo?.role:", parsedUserInfo?.role, "hasVendorObject:", hasVendorObject);
  
  // If we have user data (from state or storage), check role
  if (user || parsedUserInfo) {
    // User is vendor ONLY if role is 'vendor' OR if they are admin with vendor object
    // Do NOT allow owners even if they have vendor data
    const isVendor = userRole === 'vendor' || (userRole === 'admin' && hasVendorObject);
    
    if (!isVendor) {
      console.error("❌ VendorProtectedRoute: User is not vendor. User:", user, "ParsedUserInfo:", parsedUserInfo, "Role:", userRole, "HasVendor:", hasVendorObject);
      console.error("❌ Full userInfo from localStorage:", userInfoInStorage);
      return <Navigate to="/" replace />;
    }
    // User is vendor, allow access
    console.log("✅ VendorProtectedRoute: User is vendor, allowing access");
  return children;
  }

  // If we have token but no user data yet, wait a bit more
  if (token || tokenInStorage) {
    console.log("⏳ VendorProtectedRoute: Token exists but no user data, waiting...");
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  // No token and no user, redirect
  console.warn("⚠️ VendorProtectedRoute: No token and no user, redirecting to home");
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/intropage" element={<IntroPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shops" element={<Shop />} />
            <Route path="/vendors" element={<VendorListings />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/cart/checkout" element={<Checkout />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/review" element={<ReviewForm />} />
            <Route path="/vet-map" element={<VetMap />} />

            <Route
              path="/mypets"
              element={
                <ProtectedRoute>
                  <MyPets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addnewpets"
              element={
                <ProtectedRoute>
                  <AddNewPet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewprofile/:id"
              element={
                <ProtectedRoute>
                  <ViewProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editprofile/:id"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PetOwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health"
              element={
                <ProtectedRoute>
                  <HealthTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-chat"
              element={
                <ProtectedRoute>
                  <AIChatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reminder"
              element={
                <ProtectedRoute>
                  <Reminders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reminder/list"
              element={
                <ProtectedRoute>
                  <ReminderList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reminder/edit/:reminderId"
              element={
                <ProtectedRoute>
                  <EditReminder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute>
                  <NotificationSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coupons"
              element={
                <ProtectedRoute>
                  <UserCouponWallet />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRouteWrapper>
                  <AdminLayout />
                </AdminProtectedRouteWrapper>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="vendors" element={<VendorManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="approvals" element={<ProductModeration />} />
              <Route path="coupons" element={<AdminCouponManagement />} />
              <Route path="vaccines" element={<VaccineManagement />} />
            </Route>

            {/* Vendor login redirects to main login (unified auth) */}
            <Route path="/vendor/login" element={<Navigate to="/" replace />} />
            <Route path="/vendor/register" element={<VendorRegister />} />

            <Route
              path="/vendor"
              element={
                <VendorProtectedRouteWrapper>
                  <VendorLayout />
                </VendorProtectedRouteWrapper>
              }
            >
              <Route index element={<VendorDashboard />} />
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="coupons" element={<CouponManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="settings" element={<ShopSettings />} />
              <Route path="account" element={<Navigate to="/account" replace />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
