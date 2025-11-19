import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
