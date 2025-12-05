import api from "./axiosConfig.js";

/**
 * GET /api/admin/stats
 * Lấy thống kê tổng quan
 */
export const apiGetAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response;
};

/**
 * GET /api/admin/users
 * Lấy danh sách users với pagination và search
 */
export const apiGetUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response;
};

/**
 * GET /api/admin/users/:id
 * Lấy thông tin chi tiết user
 */
export const apiGetUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response;
};

/**
 * PUT /api/admin/users/:id
 * Cập nhật thông tin user
 */
export const apiUpdateUser = async (userId, data) => {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response;
};

/**
 * PUT /api/admin/users/:id/status
 * Khóa/mở khóa user
 */
export const apiUpdateUserStatus = async (userId, isActive) => {
  const response = await api.put(`/admin/users/${userId}/status`, {
    is_active: isActive
  });
  return response;
};

/**
 * GET /api/admin/products/pending
 * Lấy danh sách sản phẩm chờ duyệt
 */
export const apiGetPendingProducts = async () => {
  const response = await api.get("/admin/products/pending");
  return response;
};

/**
 * PUT /api/admin/products/:id/approval
 * Duyệt sản phẩm
 */
export const apiApproveProduct = async (productId) => {
  const response = await api.put(`/admin/products/${productId}/approval`, {
    status: "APPROVED"
  });
  return response;
};

/**
 * PUT /api/admin/products/:id/approval
 * Từ chối sản phẩm
 */
export const apiRejectProduct = async (productId, reason) => {
  const response = await api.put(`/admin/products/${productId}/approval`, {
    status: "REJECTED",
    rejection_reason: reason
  });
  return response;
};

/**
 * GET /api/admin/vendors/pending
 * Lấy danh sách vendor requests chờ duyệt
 */
export const apiGetPendingVendors = async () => {
  const response = await api.get("/admin/vendors/pending");
  return response;
};

/**
 * PUT /api/admin/vendors/:id/approval
 * Duyệt vendor request
 */
export const apiApproveVendor = async (vendorId) => {
  const response = await api.put(`/admin/vendors/${vendorId}/approval`, {
    status: "approved"
  });
  return response;
};

/**
 * PUT /api/admin/vendors/:id/approval
 * Từ chối vendor request
 */
export const apiRejectVendor = async (vendorId, reason) => {
  const response = await api.put(`/admin/vendors/${vendorId}/approval`, {
    status: "rejected",
    rejection_reason: reason
  });
  return response;
};

