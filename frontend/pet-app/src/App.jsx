import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { CartProvider } from "./components/Shop/CartContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import HomePage from "./components/Home/HomePage.jsx";
import IntroPage from "./components/Home/IntroPage.jsx";
import Shop from "./components/Shop/Shop.jsx";
import ProductDetail from "./components/Shop/ProductDetail.jsx";
import Cart from "./components/Shop/Cart.jsx";
import Checkout from "./components/Shop/Checkout.jsx";
import OrderHistory from "./components/Shop/OrderHistory.jsx";
import OrderDetail from "./components/Shop/OrderDetail.jsx";
import ReviewForm from "./components/Shop/ReviewForm.jsx";
import VetMap from "./components/Map/VetMap.jsx";
import VeterinaryAutoLocateMapPage from "./components/Map/VeterinaryAutoLocateMapPage.jsx";
import CartIcon from "./components/Shop/CartIcon.jsx";
import CustomerLayout from "./components/DashBoard/CustomerLayout.jsx";

import PetOwnerDashboard from "./components/DashBoard/PetOwnerDashBoard.jsx";
import MyPets from "./components/Pets/MyPets.jsx";
import AddNewPet from "./components/Pets/AddNewPet.jsx";
import ViewProfile from "./components/Pets/ViewProfile.jsx";
import EditProfile from "./components/Pets/EditProfile.jsx";
import Reminders from "./components/Reminders/Reminder.jsx";
import HealthActivity from "./components/HealthyActivity/HealthyActivity.jsx";
import OrderConfirmation from "./components/Shop/OrderConfirmation.jsx";

import VendorLogin from "./components/Vendor/VendorLogin.jsx";
import VendorRegister from "./components/Vendor/VendorRegister.jsx";
import VendorLayout from "./components/Vendor/VendorLayout.jsx";
import VendorDashboard from "./components/Vendor/VendorDashboard.jsx";
import ProductManagement from "./components/Vendor/ProductManagement.jsx";
import CouponManagement from "./components/Vendor/CouponManagement.jsx";
import OrderManagement from "./components/Vendor/OrderManagement.jsx";
import ShopSettings from "./components/Vendor/ShopSettings.jsx";
import AccountSettings from "./components/Vendor/AccountSettings.jsx";

const VendorProtectedRoute = ({ children }) => {
  const isVendorAuthenticated = !!localStorage.getItem('vendorToken');

  if (!isVendorAuthenticated) {
    return <Navigate to="/vendor/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/intropage" element={<IntroPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shops" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/cart/checkout" element={<Checkout />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <CustomerLayout currentPage="orders">
                    <OrderHistory />
                  </CustomerLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/review" element={<ReviewForm />} />
            <Route path="/vet-map" element={<VetMap />} />
            <Route path="/vet-map-auto" element={<VeterinaryAutoLocateMapPage />} />
            <Route path="/vet-map/:clinicId" element={<VeterinaryAutoLocateMapPage />} />

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
                  <HealthActivity />
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

            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/register" element={<VendorRegister />} />

            <Route
              path="/vendor"
              element={<VendorLayout />}
            >
              <Route index element={<VendorDashboard />} />
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="coupons" element={<CouponManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="settings" element={<ShopSettings />} />
              <Route path="account" element={<AccountSettings />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
