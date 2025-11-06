// ============================================================================
// 🌍 GEOAPIFY CLIENT
// -----------------------------------------------------------------------------
// Module chuyên trách giao tiếp trực tiếp với Geoapify API.
// Được gọi bởi geoapify.routes.js để thực hiện request tới Geoapify.
// ============================================================================

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// 🔧 CONFIG
// ============================================================================
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v2/places";
const GEOAPIFY_GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search";

if (!GEOAPIFY_API_KEY) {
  console.error("❌ GEOAPIFY_API_KEY is missing. Check your .env file!");
}

// ============================================================================
// 🧩 HELPER FUNCTION — Chuẩn hóa dữ liệu trả về từ Geoapify
// ============================================================================
function normalizePlacesResponse(data) {
  if (!data || !data.features) return [];

  return data.features.map((f) => ({
    id: f.properties.place_id,
    name: f.properties.name || "Unnamed Clinic",
    address: f.properties.formatted,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    distance: f.properties.distance || null,
    categories: f.properties.categories || [],
    datasource: f.properties.datasource?.name || "geoapify",
  }));
}

// ============================================================================
// 🌐 GỬI REQUEST TỚI GEOAPIFY
// ============================================================================
export async function fetchPlaces(params, endpoint = GEOAPIFY_BASE_URL) {
  try {
    console.log("🌐 [GeoapifyClient] Fetching places...");
    console.log("🔹 Params:", params);

    const { data } = await axios.get(endpoint, { params, timeout: 15000 });
    const clinics = normalizePlacesResponse(data);

    return { success: true, data: clinics, total: clinics.length };
  } catch (error) {
    console.error("[GeoapifyClient Error]", error.response?.data || error.message);
    return {
      success: false,
      message: "Geoapify places request failed",
      error: error.response?.data || error.message,
    };
  }
}

// ============================================================================
// 📍 GEOCODE — Lấy tọa độ từ địa chỉ
// ============================================================================
export async function geocodeAddress(address) {
  try {
    const { data } = await axios.get(GEOAPIFY_GEOCODE_URL, {
      params: { text: address, apiKey: GEOAPIFY_API_KEY },
      timeout: 15000,
    });

    if (!data.features?.length) {
      return { success: false, message: "No results found for this address." };
    }

    const first = data.features[0];
    return {
      success: true,
      coordinates: {
        lat: first.geometry.coordinates[1],
        lon: first.geometry.coordinates[0],
      },
      address: first.properties.formatted,
    };
  } catch (error) {
    console.error("[GeoapifyClient Geocode Error]", error.message);
    return {
      success: false,
      message: "Failed to geocode address",
      error: error.message,
    };
  }
}

// ============================================================================
// ✅ EXPORT DEFAULT (nếu bạn muốn import toàn bộ)
// ============================================================================
export default {
  fetchPlaces,
  geocodeAddress,
};

// ============================================================================
// ✅ END OF FILE
// ============================================================================
