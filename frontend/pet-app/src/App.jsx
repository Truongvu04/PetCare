import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/Home/HomePage.jsx';
import PetOwnerDashboard from './components/DashBoard/PetOwnerDashBoard.jsx';
import HealthActivity from "./components/HealthyActivity/HealthyActivity.jsx";
import LoginForm from './components/Auth/LoginForm';
import VetMap from './components/Map/VetMap';
import PetList from './components/Pets/PetList';
import ViewProfile from './components/Pets/ViewProfile.jsx';
import EditProfile  from './components/Pets/EditProfile.jsx';
import MyPets from "./components/Pets/MyPets.jsx";
import AddNewPet from "./components/Pets/AddNewPet.jsx";
import Reminders from './components/Reminders/Reminder.jsx';

function App() {
  return React.createElement(
    Router, 
    null,
      React.createElement(
        Routes, 
        null,
        React.createElement(Route, { path: '/', element: React.createElement(HomePage) }),
        React.createElement(Route, { path: '/login', element: React.createElement(LoginForm) }),
        React.createElement(Route, { path: '/vet-map', element: React.createElement(VetMap) }),
        React.createElement(Route, { path: '/pets', element: React.createElement(PetList) }),
        React.createElement(Route, { path: '/dashboard', element: React.createElement(PetOwnerDashboard) }),
        React.createElement(Route, { path: '/viewprofile/:id', element: React.createElement(ViewProfile) }),
        React.createElement(Route, { path: '/editprofile/:id', element: React.createElement(EditProfile) }),
        React.createElement(Route, { path: '/mypets', element: React.createElement(MyPets) }),
        React.createElement(Route, { path: '/addnewpets', element: React.createElement(AddNewPet) }),
        React.createElement(Route, { path: '/health', element: React.createElement(HealthActivity) }),
        React.createElement(Route, { path: '/reminder', element: React.createElement(Reminders) })
      )
    );
}

export default App;
