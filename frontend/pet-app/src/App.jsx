import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/Home/HomePage.jsx";
import PetOwnerDashboard from "./components/DashBoard/PetOwnerDashBoard.jsx";
import HealthActivity from "./components/HealthyActivity/HealthyActivity.jsx";
import LoginForm from "./components/Auth/LoginForm";
import VetMap from "./components/Map/VetMap";
import PetList from "./components/Pets/PetList";
import ViewProfile from "./components/Pets/ViewProfile.jsx";
import EditProfile from "./components/Pets/EditProfile.jsx";
import MyPets from "./components/Pets/MyPets.jsx";  
import AddNewPet from "./components/Pets/AddNewPet.jsx";
import Reminders from "./components/Reminders/Reminder.jsx";
import Shop from "./components/Shop/Shop.jsx";
import ProductDetail from "./components/Shop/ProductDetail.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/vet-map" element={<VetMap />} />
        <Route path="/pets" element={<PetList />} />
        <Route path="/dashboard" element={<PetOwnerDashboard />} />
        <Route path="/viewprofile/:id" element={<ViewProfile />} />
        <Route path="/editprofile/:id" element={<EditProfile />} />
        <Route path="/mypets" element={<MyPets />} />
        <Route path="/addnewpets" element={<AddNewPet />} />
        <Route path="/health" element={<HealthActivity />} />
        <Route path="/reminder" element={<Reminders />} />
        <Route path="/shops" element={<Shop />} />
        <Route path="/productdetails" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
