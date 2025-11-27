import React, { useState, useEffect, useCallback, useRef } from "react";
import { AuthContext } from "./AuthContext.js";
import { showSuccess } from "../utils/notifications";
import { performCompleteLogout } from "../utils/logoutHelper.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const isLoggingInRef = useRef(false); // Flag to prevent useEffect race condition

  // --- fetch user info từ backend ---
  const fetchUser = useCallback(async (authToken) => {
    try {
      console.log("🔄 fetchUser: Calling /auth/me with token:", authToken.substring(0, 20) + "...");
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ fetchUser: API returned error:", res.status, errorData);
        throw new Error(`Unauthorized: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("✅ fetchUser: Received user data:", data.email, "role:", data.role);
      
      if (!data?.user_id) {
        console.error("❌ fetchUser: Invalid user data - no user_id");
        throw new Error("Invalid user data");
      }
      
      // Also save userInfo to localStorage for consistency
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("❌ fetchUser error:", err.message);
      
      // Only remove token if we're not on a vendor route (might be a temporary network issue)
      const isVendorRoute = window.location.pathname.startsWith('/vendor');
      if (!isVendorRoute) {
        console.warn("⚠️ Removing token due to fetchUser error (not on vendor route)");
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } else {
        console.warn("⚠️ On vendor route, keeping token - might be temporary error");
      }
      
      setLoading(false);
      return null;
    }
  }, []);

  // --- kiểm tra token từ URL (Google/Facebook) hoặc từ localStorage ---
  useEffect(() => {
    // Skip if we're in the middle of a login (prevent race condition)
    if (isLoggingInRef.current) {
      console.log("⏸️ AuthProvider: Login in progress, skipping useEffect");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if we have userInfo in localStorage (from recent login)
    const userInfoFromStorage = localStorage.getItem("userInfo");
    let parsedUserInfo = null;
    if (userInfoFromStorage) {
      try {
        parsedUserInfo = JSON.parse(userInfoFromStorage);
      } catch (e) {
        console.warn("⚠️ Invalid userInfo in localStorage");
      }
    }

    // Only fetch user if we have a token and don't already have user data
    if (token && !user) {
      // If we have userInfo in localStorage, use it instead of fetching
      if (parsedUserInfo && parsedUserInfo.user_id) {
        console.log("✅ AuthProvider: Using userInfo from localStorage, skipping fetch");
        setUser(parsedUserInfo);
        setLoading(false);
        return;
      }

      console.log("🔄 AuthProvider: Fetching user with token");
      fetchUser(token).catch(err => {
        console.error("❌ Failed to fetch user in useEffect:", err);
        // Don't remove token here - let the error handler in fetchUser do it
        // But don't auto-logout if we're on vendor route
        const isVendorRoute = window.location.pathname.startsWith('/vendor');
        if (!isVendorRoute) {
          setLoading(false);
        }
      });
    } else if (!token) {
      setLoading(false);
    } else {
      // We have both token and user, mark as loaded
      console.log("✅ AuthProvider: User already loaded, skipping fetch");
      setLoading(false);
    }
  }, [token, fetchUser, user]);

  // --- login chuẩn, đồng bộ với backend ---
  const login = async ({ token: newToken, user: loginUser }) => {
    if (!newToken) return;
    
    console.log("🔐 Login called with token:", newToken.substring(0, 20) + "...", "user:", loginUser?.email, "role:", loginUser?.role);
    
    // Set flag to prevent useEffect from running during login
    isLoggingInRef.current = true;
    
    // CRITICAL: Set user FIRST, then token, to prevent useEffect from calling fetchUser
    if (loginUser && loginUser.user_id) {
      console.log("✅ Setting user FIRST to prevent useEffect race condition");
      // Also save userInfo to localStorage for VendorProtectedRouteWrapper fallback
      localStorage.setItem("userInfo", JSON.stringify(loginUser));
      setUser(loginUser);
      setLoading(false);
    }
    
    // Then set token (useEffect will see isLoggingInRef.current = true and skip)
    localStorage.setItem("token", newToken);
    setToken(newToken);
    
    // Reset flag after a longer delay to ensure state updates complete and redirect happens
    setTimeout(() => {
      isLoggingInRef.current = false;
      console.log("✅ Login flag reset");
    }, 500); // Increased from 100ms to 500ms to allow redirect to complete

    // If user data is provided from login response, we're done
    if (loginUser && loginUser.user_id) {
      console.log("✅ Login complete with user from response");
      
      // Determine role-based welcome message
      const roleMessages = {
        vendor: "Vendor",
        admin: "Admin", 
        owner: "Customer"
      };
      const roleLabel = roleMessages[loginUser.role] || "Customer";
      const displayName = loginUser.full_name || loginUser.email;
      
      // Welcome notification với role
      showSuccess(
        `Chào mừng, ${displayName}!`,
        `PetCare+ chào mừng bạn với vai trò ${roleLabel} 💙`,
        2000
      );
      
      // Log role for debugging
      console.log("🔐 Login role check:", {
        email: loginUser.email,
        role: loginUser.role,
        hasVendor: !!loginUser.vendor,
        full_name: loginUser.full_name
      });
      return; // Exit early to prevent useEffect from running
    }
    
    // Fallback: Fetch user from backend if not provided (shouldn't happen)
    console.log("⏳ No user in response, fetching from backend...");
    const fetchedUser = await fetchUser(newToken);
    
    if (fetchedUser) {
      // Also save userInfo to localStorage
      localStorage.setItem("userInfo", JSON.stringify(fetchedUser));
      setUser(fetchedUser);
      
      // Determine role-based welcome message
      const roleMessages = {
        vendor: "Vendor",
        admin: "Admin", 
        owner: "Customer"
      };
      const roleLabel = roleMessages[fetchedUser.role] || "Customer";
      const displayName = fetchedUser.full_name || fetchedUser.email;
      
      // Welcome notification với role
      showSuccess(
        `Chào mừng, ${displayName}!`,
        `PetCare+ chào mừng bạn với vai trò ${roleLabel} 💙`,
        2000
      );
      
      // Log role for debugging
      console.log("🔐 Login role check:", {
        email: fetchedUser.email,
        role: fetchedUser.role,
        hasVendor: !!fetchedUser.vendor,
        full_name: fetchedUser.full_name
      });
    } else {
      // nếu login fail thì remove token
      console.error("❌ Failed to fetch user after login");
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear all tokens first (but don't redirect yet)
    performCompleteLogout(false);
    
    // Clear state
    setToken(null);
    setUser(null);

    // Show logout success notification
    showSuccess(
      "Đăng xuất thành công!",
      "Cảm ơn bạn đã sử dụng PetCare+ 💙 Hẹn gặp lại!",
      1500
    ).then(() => {
      // Redirect after showing success message
      window.location.href = "/";
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      customer: user?.customer || null,
      token, 
      loading, 
      login, 
      logout, 
      fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
