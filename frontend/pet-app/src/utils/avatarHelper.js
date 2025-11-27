/**
 * Helper function to get consistent avatar URL across the application
 * @param {Object} user - User object with avatar_url, full_name, email
 * @param {Object} vendor - Optional vendor object with logo_url, avatar, logo
 * @param {string} size - Size for dicebear API (default: 40)
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (user, vendor = null, size = 40) => {
  // For vendor, prioritize vendor logo
  if (vendor) {
    const vendorLogo = vendor.logo_url || vendor.avatar || vendor.logo;
    if (vendorLogo) return vendorLogo;
  }

  // For user, prioritize avatar_url
  if (user?.avatar_url) {
    return user.avatar_url;
  }

  // Fallback to dicebear initials
  const seed = user?.full_name || user?.email?.split("@")[0] || "User";
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
};

/**
 * Get user initials for fallback display
 * @param {Object} user - User object
 * @returns {string} Initial letter(s)
 */
export const getUserInitials = (user) => {
  if (user?.full_name) {
    const names = user.full_name.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }
  if (user?.email) {
    return user.email.split("@")[0][0].toUpperCase();
  }
  return "U";
};

