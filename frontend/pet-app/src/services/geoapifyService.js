// src/services/geoapifyService.js
// -----------------------------------------------------------------------------
// 🧭 GEOAPIFY SERVICE LAYER
// Mô-đun chịu trách nhiệm giao tiếp với API Geoapify và các API nội bộ liên quan
// Cung cấp các hàm tìm kiếm, định vị, và xử lý phòng khám thú y.
// -----------------------------------------------------------------------------

import axios from "axios";

// ============================================================================
// 🔧 CONFIGURATION
// ============================================================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ============================================================================
// ⚙️ UTILITIES & HELPERS
// ============================================================================
const handleError = (error, fallbackMessage) => {
  console.error("[GeoapifyService Error]", error.message || error);
  return {
    success: false,
    data: [],
    total: 0,
    error: fallbackMessage || "Có lỗi xảy ra, vui lòng thử lại sau.",
  };
};

const cacheGet = (key) => {
  try {
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const cacheSet = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (import.meta.env.DEV) console.warn("⚠️ Cache save failed:", error);
  }
};

const buildKey = (...parts) => parts.join("_").replace(/\W+/g, "_");

const withRetry = async (fn, retries = 2, delay = 500) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((res) => setTimeout(res, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

// ============================================================================
// 🚀 MAIN SERVICE
// ============================================================================
export const geoapifyService = {
  // 🔹 Tự động tìm phòng khám gần vị trí người dùng
  async autoLocateVeterinaryClinics(lat, lon, radius = 15000) {
    const key = buildKey("autoLocate", lat, lon, radius);
    const cached = cacheGet(key);
    if (cached) return cached;

    try {
      const { data } = await withRetry(() =>
        api.get("/geoapify/auto-locate", { params: { lat, lon, radius } })
      );

      const result = { success: true, ...data };
      cacheSet(key, result);
      return result;
    } catch (error) {
      return handleError(error, "Không thể tự động tìm phòng khám gần bạn.");
    }
  },

  // 🔹 Tìm kiếm nâng cao với ưu tiên kết quả địa phương
  async smartSearchEnhanced({
    query,
    latitude,
    longitude,
    radius = 15000,
    prioritizeLocal = true,
  }) {
    try {
      const { data } = await withRetry(() =>
        api.post("/geoapify/smart-search-enhanced", {
          query,
          latitude,
          longitude,
          radius,
          prioritizeLocal,
        })
      );
      return { success: true, ...data };
    } catch (error) {
      return handleError(error, "Có lỗi xảy ra khi tìm kiếm nâng cao.");
    }
  },

  // 🔹 Lấy danh sách phòng khám thú y (Geoapify hoặc local DB)
  async getVeterinaryClinics(lat, lon, radius = 15000, query = "") {
    const key = buildKey("vets", lat, lon, radius, query);
    const cached = cacheGet(key);
    if (cached) return cached;

    try {
      const { data } = await withRetry(() =>
        api.get("/geoapify/vet-clinics", { params: { lat, lon, radius, query } })
      );

      const result = { success: true, ...data };
      cacheSet(key, result);
      return result;
    } catch (error) {
      return handleError(error, "Không thể tải dữ liệu phòng khám.");
    }
  },

  // 🔹 Chuyển địa chỉ sang toạ độ (Geocoding)
  async geocodeAddress(address) {
    try {
      const { data } = await withRetry(() =>
        api.get("/geoapify/geocode", { params: { address } })
      );
      return { success: true, ...data };
    } catch (error) {
      return handleError(error, "Không thể tìm kiếm địa chỉ.");
    }
  },

  // 🔹 Tìm kiếm phòng khám theo địa chỉ
  async findVetsByAddress(address, radius = 15000) {
    try {
      const { data } = await withRetry(() =>
        api.get("/geoapify/vets-by-address", { params: { address, radius } })
      );
      return { success: true, ...data };
    } catch (error) {
      return handleError(error, "Không thể tìm kiếm phòng khám theo địa chỉ.");
    }
  },

  // 🔹 Tìm kiếm thông minh tổng quát
  async smartSearch({ query, latitude, longitude, radius = 15000, filters = {} }) {
    try {
      const { data } = await withRetry(() =>
        api.post("/geoapify/smart-search", {
          query,
          latitude,
          longitude,
          radius,
          filters,
        })
      );
      return { success: true, ...data };
    } catch (error) {
      return handleError(error, "Có lỗi xảy ra khi tìm kiếm thông minh.");
    }
  },

  // 🔹 Gộp kết quả từ Geoapify và Local DB
  async getCombinedResults(lat, lon, radius = 15000, query = "") {
    try {
      const [geo, local] = await Promise.allSettled([
        this.getVeterinaryClinics(lat, lon, radius, query),
        this.getLocalVets(lat, lon, radius, query),
      ]);

      const combined = [];
      if (geo.status === "fulfilled" && geo.value.success)
        combined.push(...geo.value.data);
      if (local.status === "fulfilled" && local.value.success)
        combined.push(...local.value.data);

      const unique = this.removeDuplicates(combined);
      return {
        success: true,
        data: unique,
        total: unique.length,
        sources: {
          geoapify: geo.value?.data?.length || 0,
          local: local.value?.data?.length || 0,
        },
      };
    } catch (error) {
      return handleError(error, "Không thể tải dữ liệu phòng khám.");
    }
  },

  // 🔹 Lấy danh sách phòng khám từ API nội bộ
  async getLocalVets(lat, lon, radius = 15000, query = "") {
    try {
      const { data } = await withRetry(() =>
        api.get("/vets/nearby", { params: { lat, lon, radius, query } })
      );
      return { success: true, ...data };
    } catch (error) {
      return handleError(error, "Không thể tải dữ liệu phòng khám nội bộ.");
    }
  },

  // 🔹 Loại bỏ phòng khám trùng lặp
  removeDuplicates(clinics) {
    const seen = new Set();
    return clinics.filter((clinic) => {
      const key = `${clinic.name}_${clinic.coordinates?.lat}_${clinic.coordinates?.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  // 🔹 Tính khoảng cách giữa hai điểm (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },
};

// ============================================================================
// 🧩 BACKWARD COMPATIBILITY (Alias)
// Giúp các component cũ vẫn hoạt động bình thường (VD: VeterinaryMapPage.jsx)
// ============================================================================
geoapifyService.enhancedSearch = async (options) =>
  await geoapifyService.smartSearch(options);

// ============================================================================
// ✅ END OF FILE
// ============================================================================
