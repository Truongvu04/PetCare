import express from "express";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { prisma } from "../config/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------- Thư mục lưu ảnh -------------------
const uploadDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ------------------- Multer config (Giữ nguyên) -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      crypto.randomBytes(4).toString("hex") +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("photo_url"), async (req, res) => {
  try {
    const {
      name,
      species,
      vaccination,
      age,
      weight,
      breed,
      medical_history,
      description,
    } = req.body;

    const user_id = req.user.user_id;

    if (!user_id || !name || name.trim() === "") {
      return res.status(400).json({ message: "Missing required fields or authentication" });
    }

    const validAge = age ? parseInt(age) : null;
    const validWeight = weight ? parseFloat(weight) : null;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const newPet = await prisma.pet.create({
      data: {
        id: crypto.randomBytes(6).toString("hex"),
        user_id,
        name,
        species,
        vaccination,
        age: validAge,
        weight: validWeight,
        breed,
        medical_history,
        description,
        photo_url: photoPath,
      },
    });

    res.status(201).json({
      message: "✅ Pet added successfully!",
      pet_id: newPet.id,
      photo_url: newPet.photo_url,
    });
  } catch (err) {
    console.error("❌ Error adding pet (Prisma):", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const pets = await prisma.pet.findMany({
      where: {
        user_id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(pets);
  } catch (err) {
    console.error("❌ Error fetching pets (Prisma):", err);
    res.status(500).json({ message: "Database error while fetching pets" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const petId = req.params.id;
    const user_id = req.user.user_id;

    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        user_id,
      },
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or unauthorized" });
    }
    res.json(pet);
  } catch (err) {
    console.error("❌ Error fetching pet (Prisma):", err);
    res.status(500).json({ message: "Database error while fetching pet details" });
  }
});

router.put("/:id", verifyToken, upload.single("photo_url"), async (req, res) => {
  try {
    const petId = req.params.id;
    const user_id = req.user.user_id;
    const { name, species, vaccination, age, weight, breed, medical_history, description } = req.body;

    const existingPet = await prisma.pet.findFirst({
      where: { id: petId, user_id },
      select: { photo_url: true },
    });

    if (!existingPet) {
      return res.status(404).json({ message: "Pet not found or unauthorized" });
    }

    const oldPhoto = existingPet.photo_url;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : oldPhoto;

    const validAge = age ? parseInt(age) : null;
    const validWeight = weight ? parseFloat(weight) : null;

    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: {
        name: name || undefined,
        species: species || undefined,
        vaccination: vaccination || undefined,
        age: validAge,
        weight: validWeight,
        breed: breed || undefined,
        medical_history: medical_history || undefined,
        description: description || undefined,
        photo_url: photoPath,
      },
    });

    res.json({ message: "✅ Pet updated successfully!", photo_url: updatedPet.photo_url });
  } catch (err) {
    console.error("❌ Error updating pet (Prisma):", err);
    res.status(500).json({ message: "Database error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const petId = req.params.id;
    const user_id = req.user.user_id;

    const deleteResult = await prisma.pet.deleteMany({
      where: {
        id: petId,
        user_id,
      },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ message: "Pet not found or unauthorized" });
    }

    res.json({ message: "✅ Pet deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting pet (Prisma):", err);
    res.status(500).json({ message: "Database error" });
  }
});

export default router;