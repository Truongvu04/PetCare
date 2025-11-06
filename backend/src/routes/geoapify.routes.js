// ============================================================================
// 🌍 GEOAPIFY ROUTES
// -----------------------------------------------------------------------------
// Chịu trách nhiệm nhận request từ client, kiểm tra dữ liệu đầu vào,
// và gọi geoapifyClient.js để giao tiếp với Geoapify API.
// ============================================================================

import express from "express";
import dotenv from "dotenv";
import { fetchPlaces, geocodeAddress } from "../services/geoapifyClient.js";

dotenv.config();
const router = express.Router();

// ============================================================================
// 🩺 ROUTE: Get nearby veterinary clinics
// GET /api/geoapify/vet-clinics?lat=...&lon=...&radius=...&query=...
// ============================================================================
router.get("/vet-clinics", async (req, res) => {
  const { lat, lon, radius = 15000, query = "" } = req.query;

  console.log("[Geoapify] incoming query:", req.query);

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ success: false, message: "Missing latitude or longitude" });
  }

  const params = {
    text: query || "veterinary clinic",
    filter: `circle:${lon},${lat},${radius}`,
    bias: `proximity:${lon},${lat}`,
    limit: 50,
    apiKey: process.env.GEOAPIFY_API_KEY,
  };

  const result = await fetchPlaces(params);
  return res.status(result.success ? 200 : 500).json(result);
});

// ============================================================================
// 🔍 ROUTE: Smart Search (POST)
// POST /api/geoapify/smart-search-enhanced
// ============================================================================
router.post("/smart-search-enhanced", async (req, res) => {
  const {
    query = "veterinary clinic",
    latitude,
    longitude,
    radius = 15000,
  } = req.body;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ success: false, message: "Missing latitude or longitude" });
  }

  const params = {
    text: query,
    filter: `circle:${longitude},${latitude},${radius}`,
    bias: `proximity:${longitude},${latitude}`,
    limit: 50,
    apiKey: process.env.GEOAPIFY_API_KEY,
  };

  const result = await fetchPlaces(params);
  return res.status(result.success ? 200 : 500).json(result);
});

// ============================================================================
// 🧭 ROUTE: Geocode address
// GET /api/geoapify/geocode?address=...
// ============================================================================
router.get("/geocode", async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({
      success: false,
      message: "Missing address parameter",
    });
  }

  const result = await geocodeAddress(address);
  return res.status(result.success ? 200 : 500).json(result);
});

// ============================================================================
// 🧩 EXPORT ROUTER
// ============================================================================
export default router;

// ============================================================================
// ✅ END OF FILE
// ============================================================================
