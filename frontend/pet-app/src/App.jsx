// // src/App.jsx
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthProvider.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";

// // Public components
// // import LoginForm from "./components/Auth/LoginForm.jsx";
// import HomePage from "./components/Home/HomePage.jsx";
// import IntroPage from "./components/Home/IntroPage.jsx";
// import Shop from "./components/Shop/Shop.jsx";
// import ProductDetail from "./components/Shop/ProductDetail.jsx";
// import VetMap from "./components/Map/VetMap.jsx";
// import VeterinaryAutoLocateMapPage from "./components/Map/VeterinaryAutoLocateMapPage.jsx";

// // Protected components
// import PetOwnerDashboard from "./components/DashBoard/PetOwnerDashBoard.jsx";
// import MyPets from "./components/Pets/MyPets.jsx";
// import AddNewPet from "./components/Pets/AddNewPet.jsx";
// import ViewProfile from "./components/Pets/ViewProfile.jsx";
// import EditProfile from "./components/Pets/EditProfile.jsx";
// import Reminders from "./components/Reminders/Reminder.jsx";
// import HealthActivity from "./components/HealthyActivity/HealthyActivity.jsx";

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           {/* ---------- Public Routes ---------- */}
//           {/* <Route path="/login" element={<LoginForm />} /> */}
//           <Route path="/intropage" element={<IntroPage />} />
//           <Route path="/" element={<HomePage />} />
//           <Route path="/shops" element={<Shop />} />
//           <Route path="/productdetails" element={<ProductDetail />} />
//           <Route path="/vet-map" element={<VetMap />} />
//           <Route path="/vet-map-auto" element={<VeterinaryAutoLocateMapPage />} />
//           <Route path="/vet-map/:clinicId" element={<VeterinaryAutoLocateMapPage />} />

//           {/* ---------- Protected Routes ---------- */}
//           <Route
//             path="/mypets" element={
//               <ProtectedRoute>
//                 <MyPets />
//               </ProtectedRoute>
//             }/>
//           <Route
//             path="/addnewpets" element={
//               <ProtectedRoute>
//                 <AddNewPet />
//               </ProtectedRoute>
//             }/>
//           <Route
//             path="/viewprofile/:id" element={
//               <ProtectedRoute>
//                 <ViewProfile />
//               </ProtectedRoute>
//             }/>
//           <Route
//             path="/editprofile/:id" element={
//               <ProtectedRoute>
//                 <EditProfile />
//               </ProtectedRoute>
//             }/>
//           <Route
//             path="/dashboard" element={
//               <ProtectedRoute>
//                 <PetOwnerDashboard />
//               </ProtectedRoute>
//             }/>
//           <Route
//             path="/health" element={
//               <ProtectedRoute>
//                 <HealthActivity />
//               </ProtectedRoute>
//             }/>
//           <Route
//             path="/reminder" element={
//               <ProtectedRoute>
//                 <Reminders />
//               </ProtectedRoute>
//             }/>
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Public components
import HomePage from "./components/Home/HomePage.jsx";
import IntroPage from "./components/Home/IntroPage.jsx";
import Shop from "./components/Shop/Shop.jsx";
import ProductDetail from "./components/Shop/ProductDetail.jsx";
import VetMap from "./components/Map/VetMap.jsx";
import VeterinaryAutoLocateMapPage from "./components/Map/VeterinaryAutoLocateMapPage.jsx";

// Protected components (Pet Owner)
import PetOwnerDashboard from "./components/DashBoard/PetOwnerDashBoard.jsx";
import MyPets from "./components/Pets/MyPets.jsx";
import AddNewPet from "./components/Pets/AddNewPet.jsx";
import ViewProfile from "./components/Pets/ViewProfile.jsx";
import EditProfile from "./components/Pets/EditProfile.jsx";
import Reminders from "./components/Reminders/Reminder.jsx";
import HealthActivity from "./components/HealthyActivity/HealthyActivity.jsx";

// ---------- Vendor Components ----------
import VendorLogin from "./components/Vendor/VendorLogin.jsx";
import VendorRegister from "./components/Vendor/VendorRegister.jsx"; // Đã import ở đây
import VendorLayout from "./components/Vendor/VendorLayout.jsx";
import VendorDashboard from "./components/Vendor/VendorDashboard.jsx";
import ProductManagement from "./components/Vendor/ProductManagement.jsx";
import CouponManagement from "./components/Vendor/CouponManagement.jsx";
import OrderManagement from "./components/Vendor/OrderManagement.jsx";
import ShopSettings from "./components/Vendor/ShopSettings.jsx";
import AccountSettings from "./components/Vendor/AccountSettings.jsx";

// ---------- Vendor Protected Route ----------
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
      <Router>
        <Routes>
          {/* ---------- Public Routes (Chung) ---------- */}
          <Route path="/intropage" element={<IntroPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/shops" element={<Shop />} />
          <Route path="/productdetails" element={<ProductDetail />} />
          <Route path="/vet-map" element={<VetMap />} />
          <Route path="/vet-map-auto" element={<VeterinaryAutoLocateMapPage />} />
          <Route path="/vet-map/:clinicId" element={<VeterinaryAutoLocateMapPage />} />

          {/* ---------- Protected Routes (Pet Owner) ---------- */}
          <Route
            path="/mypets" element={
              <ProtectedRoute> <MyPets /> </ProtectedRoute>
            } />
          <Route
            path="/addnewpets" element={
              <ProtectedRoute> <AddNewPet /> </ProtectedRoute>
            } />
          <Route
            path="/viewprofile/:id" element={
              <ProtectedRoute> <ViewProfile /> </ProtectedRoute>
            } />
          <Route
            path="/editprofile/:id" element={
              <ProtectedRoute> <EditProfile /> </ProtectedRoute>
            } />
          <Route
            path="/dashboard" element={
              <ProtectedRoute> <PetOwnerDashboard /> </ProtectedRoute>
            } />
          <Route
            path="/health" element={
              <ProtectedRoute> <HealthActivity /> </ProtectedRoute>
            } />
          <Route
            path="/reminder" element={
              <ProtectedRoute> <Reminders /> </ProtectedRoute>
            } />

          {/* ==================================================
          ----------         VENDOR ROUTES        ---------- 
          ==================================================
          */}

          {/* ---------- Public Vendor Route ---------- */}
          <Route path="/vendor/login" element={<VendorLogin />} />

          {/* 👇 BẠN ĐANG THIẾU DÒNG NÀY 👇 */}
          <Route path="/vendor/register" element={<VendorRegister />} />
          {/* 👆 THÊM DÒNG NÀY VÀO 👆 */}

          {/* ---------- Protected Vendor Routes ---------- */}
          <Route
            path="/vendor"
            element={
              <VendorLayout />
            }
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
    </AuthProvider>
  );
}

export default App;