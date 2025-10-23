// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, FacebookAuthProvider } from "firebase/auth";

// 👉 Thay các giá trị này bằng cấu hình của bạn trong Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyD4ejMB0bTI7DSSJJJw-s72szdBZnHvH5E",
    authDomain: "petcare-fd4c8.firebaseapp.com",
    projectId: "petcare-fd4c8",
    storageBucket: "petcare-fd4c8.firebasestorage.app",
    messagingSenderId: "855895621751",
    appId: "1:855895621751:web:5aebc49929be1d6e874672",
    measurementId: "G-BPF4K7C92S"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const facebookProvider = new FacebookAuthProvider();
