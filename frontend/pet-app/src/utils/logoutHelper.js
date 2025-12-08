/**
 * Unified logout function that clears ALL authentication tokens
 * This ensures complete logout regardless of which authentication system was used
 * @param {boolean} redirect - Whether to redirect to home page (default: true)
 */
export const performCompleteLogout = (redirect = true) => {
  // Clear unified user authentication token
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  
  // Clear vendor cache (not token, just cached data)
  localStorage.removeItem("vendor");
  
  // Clear any other related data
  localStorage.removeItem("cart"); // Optional: clear cart on logout
  
  // Force page reload to clear all state
  if (redirect) {
    window.location.href = "/";
  }
};

