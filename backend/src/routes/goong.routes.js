import express from "express";
import dotenv from "dotenv";
import {
  searchAddress,
  getNearbyVetClinics,
  getDirections,
  geocodeAddress,
} from "../services/goongService.js";

dotenv.config();
const router = express.Router();

router.get("/vet-clinics", async (req, res) => {
  const { lat, lon, radius = 10000 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: "Missing latitude or longitude" });
  }

  const result = await getNearbyVetClinics(parseFloat(lat), parseFloat(lon), parseInt(radius));
  return res.status(result.success ? 200 : 500).json(result);
});

router.post("/smart-search-enhanced", async (req, res) => {
  const { query = "", latitude, longitude, radius = 10000 } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: "Missing latitude or longitude" });
  }

  if (query.trim()) {
    const searchResult = await searchAddress(query);
    return res.status(searchResult.success ? 200 : 500).json(searchResult);
  }

  const result = await getNearbyVetClinics(parseFloat(latitude), parseFloat(longitude), parseInt(radius));
  return res.status(result.success ? 200 : 500).json(result);
});

router.post("/smart-search", async (req, res) => {
  const { query = "", latitude, longitude, radius = 10000 } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: "Missing latitude or longitude" });
  }

  if (query.trim()) {
    const searchResult = await searchAddress(query);
    return res.status(searchResult.success ? 200 : 500).json(searchResult);
  }

  const result = await getNearbyVetClinics(parseFloat(latitude), parseFloat(longitude), parseInt(radius));
  return res.status(result.success ? 200 : 500).json(result);
});

router.get("/auto-locate", async (req, res) => {
  const { lat, lon, radius = 10000 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: "Missing latitude or longitude" });
  }

  const result = await getNearbyVetClinics(parseFloat(lat), parseFloat(lon), parseInt(radius));
  return res.status(result.success ? 200 : 500).json(result);
});

router.get("/geocode", async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ success: false, message: "Missing address parameter" });
  }

  const result = await geocodeAddress(address);
  return res.status(result.success ? 200 : 500).json(result);
});

router.get("/vets-by-address", async (req, res) => {
  const { address, radius = 10000 } = req.query;
  if (!address) {
    return res.status(400).json({ success: false, message: "Missing address parameter" });
  }

  const geocodeResult = await geocodeAddress(address);
  if (!geocodeResult.success) {
    return res.status(500).json({ success: false, data: [], message: "Cannot geocode address" });
  }

  const { lat, lon } = geocodeResult.coordinates;
  const result = await getNearbyVetClinics(lat, lon, parseInt(radius));
  return res.status(result.success ? 200 : 500).json(result);
});

router.get("/directions", async (req, res) => {
  const { startLat, startLng, endLat, endLng, vehicle = "car" } = req.query;

  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ success: false, message: "Missing coordinates" });
  }

  const result = await getDirections(
    parseFloat(startLat),
    parseFloat(startLng),
    parseFloat(endLat),
    parseFloat(endLng),
    vehicle
  );
  return res.status(result.success ? 200 : 500).json(result);
});

export default router;
