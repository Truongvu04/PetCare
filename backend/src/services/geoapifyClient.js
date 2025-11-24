import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const BASE_URL = "https://api.geoapify.com/v2/places";
const GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search";

if (!GEOAPIFY_API_KEY) {
  console.error("❌ GEOAPIFY_API_KEY missing!");
}

// 🔧 Chuẩn hóa response
function normalizePlacesResponse(data) {
  if (!data?.features) return [];

  return data.features.map((f) => {
    // categories có thể là mảng hoặc chuỗi => ép về mảng
    let categories = [];
    const rawCategories = f.properties.categories;

    if (Array.isArray(rawCategories)) {
      categories = rawCategories;
    } else if (typeof rawCategories === "string") {
      categories = rawCategories.split(",").map((c) => c.trim());
    }

    return {
      id: f.properties.place_id,
      name: f.properties.name || "Unnamed Clinic",
      address: f.properties.formatted,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      distance: f.properties.distance || null,
      categories,
      datasource: f.properties.datasource?.name || "geoapify",
    };
  });
}

// 🌍 Fetch places
export async function fetchPlaces(params) {
  try {
    const fullParams = { ...params, apiKey: GEOAPIFY_API_KEY }; // luôn có apiKey
    console.log("🌐 [Geoapify] Params:", fullParams);

    const { data } = await axios.get(BASE_URL, { params: fullParams, timeout: 15000 });
    return {
      success: true,
      data: normalizePlacesResponse(data),
      total: data.features?.length || 0,
    };
  } catch (err) {
    console.error("[GeoapifyClient Error]", err.response?.data || err.message);
    return {
      success: false,
      message: "Geoapify places request failed",
      error: err.response?.data || err.message,
    };
  }
}

// 📍 Geocode address
export async function geocodeAddress(address) {
  try {
    const { data } = await axios.get(GEOCODE_URL, {
      params: { text: address, apiKey: GEOAPIFY_API_KEY },
      timeout: 15000,
    });

    if (!data.features?.length)
      return { success: false, message: "No results found" };

    const first = data.features[0];
    return {
      success: true,
      coordinates: {
        lat: first.geometry.coordinates[1],
        lon: first.geometry.coordinates[0],
      },
      address: first.properties.formatted,
    };
  } catch (err) {
    console.error("[GeoapifyClient Geocode Error]", err.response?.data || err.message);
    return {
      success: false,
      message: "Failed to geocode address",
      error: err.response?.data || err.message,
    };
  }
}

export default { fetchPlaces, geocodeAddress };
