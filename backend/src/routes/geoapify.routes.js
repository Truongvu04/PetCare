import express from "express";
import dotenv from "dotenv";
import { fetchPlaces, geocodeAddress } from "../services/geoapifyClient.js";

dotenv.config();
const router = express.Router();

// ============================================================================
// 🩺 GET /api/geoapify/vet-clinics
// Lấy danh sách phòng khám gần tọa độ
// ============================================================================
router.get("/vet-clinics", async (req, res) => {
  const { lat, lon, radius = 15000, query = "veterinary clinic" } = req.query;

  if (!lat || !lon) return res.status(400).json({ success: false, message: "Missing latitude or longitude" });

  const params = {
    categories: "commercial.pet",
    text: query.trim(),
    filter: `circle:${lon},${lat},${radius}`,
    bias: `proximity:${lon},${lat}`,
    limit: 50,
    apiKey: process.env.GEOAPIFY_API_KEY,
  };

  const result = await fetchPlaces(params);
  if (!result.success) console.error("[Geoapify Route Error]", result.error);
  return res.status(result.success ? 200 : 500).json(result);
});

// ============================================================================
// 🔍 POST /api/geoapify/smart-search-enhanced
// Smart Search nâng cao theo tọa độ + từ khóa
// ============================================================================
router.post("/smart-search-enhanced", async (req, res) => {
  const { query = "veterinary clinic", latitude, longitude, radius = 15000 } = req.body;

  if (!latitude || !longitude) return res.status(400).json({ success: false, message: "Missing latitude or longitude" });

  const params = {
    categories: "commercial.pet",
    text: query.trim(),
    filter: `circle:${longitude},${latitude},${radius}`,
    bias: `proximity:${longitude},${latitude}`,
    limit: 50,
    apiKey: process.env.GEOAPIFY_API_KEY,
  };

  const result = await fetchPlaces(params);
  if (!result.success) console.error("[Geoapify Route Error]", result.error);
  return res.status(result.success ? 200 : 500).json(result);
});

// ============================================================================
// 🔍 POST /api/geoapify/smart-search (backward compatibility)
// ============================================================================
router.post("/smart-search", async (req, res) => {
  const { query = "veterinary clinic", latitude, longitude, radius = 15000, filters = {} } = req.body;

  if (!latitude || !longitude) return res.status(400).json({ success: false, message: "Missing latitude or longitude" });

  const params = {
    categories: filters.categories || "commercial.pet",
    text: query?.trim() || "veterinary clinic",
    filter: `circle:${longitude},${latitude},${radius}`,
    bias: `proximity:${longitude},${latitude}`,
    limit: 50,
    ...(filters.type ? { type: filters.type } : {}),
    apiKey: process.env.GEOAPIFY_API_KEY,
  };

  console.log("🔹 [Route /smart-search] Params:", params);

  const result = await fetchPlaces(params);
  if (!result.success) console.error("[Geoapify Route Error]", result.error);
  return res.status(result.success ? 200 : 500).json(result);
});

// ============================================================================
// 🧭 GET /api/geoapify/auto-locate
// Tự động tìm phòng khám gần vị trí người dùng
// ============================================================================
router.get("/auto-locate", async (req, res) => {
  const { lat, lon, radius = 15000 } = req.query;

  if (!lat || !lon) return res.status(400).json({ success: false, message: "Missing latitude or longitude" });

  const params = {
    categories: "commercial.pet",
    filter: `circle:${lon},${lat},${radius}`,
    bias: `proximity:${lon},${lat}`,
    limit: 50,
    apiKey: process.env.GEOAPIFY_API_KEY,
  };

  const result = await fetchPlaces(params);
  if (!result.success) console.error("[Geoapify Route Error]", result.error);
  return res.status(result.success ? 200 : 500).json(result);
});

// ============================================================================
// 🧭 GET /api/geoapify/geocode
// Biến địa chỉ thành tọa độ
// ============================================================================
router.get("/geocode", async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ success: false, message: "Missing address parameter" });

  const result = await geocodeAddress(address);
  if (!result.success) console.error("[Geoapify Route Error]", result.error || result.message);
  return res.status(result.success ? 200 : 500).json(result);
});

// ============================================================================
// 🏥 GET /api/geoapify/vets-by-address
// Tìm phòng khám theo địa chỉ
// ============================================================================
router.get("/vets-by-address", async (req, res) => {
  const { address, radius = 15000 } = req.query;
  if (!address) return res.status(400).json({ success: false, message: "Missing address parameter" });

  const geocodeResult = await geocodeAddress(address);
  if (!geocodeResult.success) {
    console.error("[Geoapify Route Error] Cannot geocode address:", geocodeResult.message);
    return res.status(500).json({ success: false, data: [], message: "Cannot geocode address" });
  }

  const { lat, lon } = geocodeResult.coordinates;

  const params = {
    categories: "commercial.pet",
    filter: `circle:${lon},${lat},${radius}`,
    bias: `proximity:${lon},${lat}`,
    limit: 50,
    apiKey: process.env.GEOAPIFY_API_KEY,
  };

  const result = await fetchPlaces(params);
  if (!result.success) console.error("[Geoapify Route Error]", result.error);
  return res.status(result.success ? 200 : 500).json(result);
});

export default router;
