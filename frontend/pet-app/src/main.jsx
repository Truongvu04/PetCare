import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthProvider.jsx'; // 👈 Thêm import

createRoot(document.getElementById('root')).render(
  React.createElement(StrictMode, null,
    React.createElement(AuthProvider, null, // 👈 Bọc AuthProvider
      React.createElement(App)
    )
  )
);