import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './components/Home/HomePage';
import LoginForm from './components/Auth/LoginForm';
import VetMap from './components/Map/VetMap';
import PetList from './components/Pets/PetList';
import PetProfile from './components/Pets/PetProfile';
import ReminderList from './components/Reminders/ReminderList';

function App() {
  return React.createElement(Router, null,
    React.createElement(Layout, null,
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/', element: React.createElement(HomePage) }),
        React.createElement(Route, { path: '/login', element: React.createElement(LoginForm) }),
        React.createElement(Route, { path: '/vet-map', element: React.createElement(VetMap) }),
        React.createElement(Route, { path: '/pets', element: React.createElement(PetList) }),
        React.createElement(Route, { path: '/dashboard', element: React.createElement(PetProfile) }),
        React.createElement(Route, { path: '/reminders', element: React.createElement(ReminderList) })
      )
    )
  );
}

export default App;
