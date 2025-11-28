import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GOONG_API_KEY = process.env.GOONG_API_KEY;
const GOONG_AUTOCOMPLETE_URL = "https://rsapi.goong.io/Place/AutoComplete";
const GOONG_PLACE_DETAIL_URL = "https://rsapi.goong.io/Place/Detail";
const GOONG_GEOCODE_URL = "https://rsapi.goong.io/Geocode";
const GOONG_DIRECTION_URL = "https://rsapi.goong.io/Direction";

if (!GOONG_API_KEY) {
  console.error("❌ GOONG_API_KEY missing!");
}

function normalizeGoongPlace(place) {
  const lat = place.geometry?.location?.lat || place.lat;
  const lng = place.geometry?.location?.lng || place.lng || place.lon;
  
  return {
    id: place.place_id,
    name: place.name || place.structured_formatting?.main_text || "Unnamed Place",
    address: place.formatted_address || place.description,
    coordinates: (lat && lng) ? { lat, lng } : null,
    lat,
    lon: lng,
    distance: place.distance || null,
    categories: place.types || [],
    datasource: "goong",
  };
}

export async function searchAddress(query) {
  try {
    const { data } = await axios.get(GOONG_AUTOCOMPLETE_URL, {
      params: {
        api_key: GOONG_API_KEY,
        input: query,
        limit: 10,
      },
      timeout: 15000,
    });

    if (!data.predictions?.length) {
      return { success: false, message: "No results found" };
    }

    return {
      success: true,
      data: data.predictions.map(normalizeGoongPlace),
      total: data.predictions.length,
    };
  } catch (err) {
    console.error("[GoongService searchAddress Error]", err.response?.data || err.message);
    return {
      success: false,
      message: "Goong search address failed",
      error: err.response?.data || err.message,
    };
  }
}

export async function getNearbyVetClinics(lat, lng, radius = 10000) {
  try {
    const { data } = await axios.get(GOONG_AUTOCOMPLETE_URL, {
      params: {
        api_key: GOONG_API_KEY,
        input: "thú y",
        location: `${lat},${lng}`,
        radius: radius,
        limit: 50,
        more_compound: true,
      },
      timeout: 15000,
    });

    if (!data.predictions?.length) {
      return {
        success: true,
        data: [],
        total: 0,
      };
    }

    const placesWithDetails = await Promise.all(
      data.predictions.slice(0, 10).map(async (place) => {
        try {
          const detailResponse = await axios.get(GOONG_PLACE_DETAIL_URL, {
            params: {
              api_key: GOONG_API_KEY,
              place_id: place.place_id,
            },
            timeout: 5000,
          });

          if (detailResponse.data?.result) {
            const result = detailResponse.data.result;
            return {
              ...place,
              geometry: result.geometry,
              formatted_address: result.formatted_address || place.description,
            };
          }
        } catch (err) {
          console.warn(`Failed to get details for ${place.place_id}`);
        }
        return place;
      })
    );

    return {
      success: true,
      data: placesWithDetails.map(normalizeGoongPlace).filter(p => p.coordinates),
      total: placesWithDetails.length,
    };
  } catch (err) {
    console.error("[GoongService getNearbyVetClinics Error]", err.response?.data || err.message);
    
    const errorCode = err.response?.data?.error?.code;
    if (errorCode === 'OVER_RATE_LIMIT') {
      console.log("⚠️ Goong API vượt giới hạn rate limit");
      return {
        success: false,
        data: [],
        total: 0,
        message: "Đã vượt giới hạn API Goong. Vui lòng dùng nguồn 'Local' hoặc thử lại sau.",
      };
    }
    
    console.log("⚠️ Goong API không khả dụng, trả về empty array");
    return {
      success: true,
      data: [],
      total: 0,
      message: "Goong API tạm thời không khả dụng. Vui lòng dùng nguồn 'Local'.",
    };
  }
}

export async function getDirections(startLat, startLng, endLat, endLng, vehicle = "car") {
  try {
    const { data } = await axios.get(GOONG_DIRECTION_URL, {
      params: {
        api_key: GOONG_API_KEY,
        origin: `${startLat},${startLng}`,
        destination: `${endLat},${endLng}`,
        vehicle: vehicle,
      },
      timeout: 15000,
    });

    if (!data.routes?.length) {
      return { success: false, message: "No route found" };
    }

    const route = data.routes[0];
    return {
      success: true,
      data: {
        distance: route.legs[0].distance,
        duration: route.legs[0].duration,
        geometry: route.overview_polyline.points,
        steps: route.legs[0].steps,
      },
    };
  } catch (err) {
    console.error("[GoongService getDirections Error]", err.response?.data || err.message);
    return {
      success: false,
      message: "Goong directions failed",
      error: err.response?.data || err.message,
    };
  }
}

export async function geocodeAddress(address) {
  try {
    const { data } = await axios.get(GOONG_GEOCODE_URL, {
      params: {
        api_key: GOONG_API_KEY,
        address: address,
      },
      timeout: 15000,
    });

    if (!data.results?.length) {
      return { success: false, message: "No results found" };
    }

    const first = data.results[0];
    return {
      success: true,
      coordinates: {
        lat: first.geometry.location.lat,
        lon: first.geometry.location.lng,
      },
      address: first.formatted_address,
      data: data.results.map(normalizeGoongPlace),
    };
  } catch (err) {
    console.error("[GoongService geocodeAddress Error]", err.response?.data || err.message);
    return {
      success: false,
      message: "Failed to geocode address",
      error: err.response?.data || err.message,
    };
  }
}

export default { searchAddress, getNearbyVetClinics, getDirections, geocodeAddress };
