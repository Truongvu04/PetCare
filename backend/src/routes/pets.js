import express from "express";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { prisma } from "../config/prisma.js"; // 👈 THAY ĐỔI: Import Prisma
import { verifyToken } from "../middleware/authMiddleware.js"; // 👈 THAY ĐỔI: Import auth middleware

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

// ------------------- Thêm thú cưng (Đã bảo mật) -------------------
// POST /api/pets
router.post("/", verifyToken, upload.single("photo_url"), async (req, res) => {
  try {
    const {
      // user_id được lấy từ token, không phải body
      name,
      species,
      vaccination,
      age,
      weight,
      breed,
      medical_history,
      description,
    } = req.body;

    // 👈 BẢO MẬT: Lấy user_id từ token đã được xác thực
    const userIdFromToken = req.user.user_id;

    if (!userIdFromToken || !name || name.trim() === "") {
      return res.status(400).json({ message: "Missing required fields or authentication" });
    }

    const validAge = age ? parseInt(age) : null;
    const validWeight = weight ? parseFloat(weight) : null;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    // 👈 THAY ĐỔI: Dùng Prisma
    const newPet = await prisma.pet.create({
      data: {
        // id: tự động tạo (nếu dùng CUID/UUID) hoặc dùng crypto nếu schema yêu cầu
        id: crypto.randomBytes(6).toString("hex"), // Giữ logic cũ
        user_id: userIdFromToken, // 👈 Lấy từ token
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
      pet_id: newPet.id, // Trả về ID
      photo_url: newPet.photo_url,
    });
  } catch (err) {
    console.error("❌ Error adding pet (Prisma):", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- Lấy danh sách thú cưng của user (Đã bảo mật) -------------------
// GET /api/pets
router.get("/", verifyToken, async (req, res) => {
  try {
    // 👈 BẢO MẬT: Lấy user_id từ token
    const userIdFromToken = req.user.user_id;

    // 👈 THAY ĐỔI: Dùng Prisma và lọc theo user_id
    const pets = await prisma.pet.findMany({
      where: {
        user_id: userIdFromToken, // Chỉ lấy pet của user đã đăng nhập
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(pets); // Prisma luôn trả về mảng
  } catch (err) {
    console.error("❌ Error fetching pets (Prisma):", err);
    res.status(500).json({ message: "Database error while fetching pets" });
  }
});

// ------------------- Lấy chi tiết thú cưng theo ID (Đã bảo mật) -------------------
// GET /api/pets/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const petId = req.params.id;
    const userIdFromToken = req.user.user_id;

    // 👈 THAY ĐỔI: Dùng Prisma và lọc cả petId và user_id
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        user_id: userIdFromToken, // Đảm bảo pet này thuộc về user
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

// ------------------- Cập nhật thú cưng (Đã bảo mật) -------------------
// PUT /api/pets/:id
router.put("/:id", verifyToken, upload.single("photo_url"), async (req, res) => {
  try {
    const petId = req.params.id;
    const userIdFromToken = req.user.user_id;
    const { name, species, vaccination, age, weight, breed, medical_history, description } = req.body;

    // 👈 BẢO MẬT: Kiểm tra xem pet có tồn tại và thuộc về user không
    const existingPet = await prisma.pet.findFirst({
      where: { id: petId, user_id: userIdFromToken },
      select: { photo_url: true },
    });

    if (!existingPet) {
      return res.status(404).json({ message: "Pet not found or unauthorized" });
    }

    const oldPhoto = existingPet.photo_url;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : oldPhoto;

    const validAge = age ? parseInt(age) : null;
    const validWeight = weight ? parseFloat(weight) : null;

    // 👈 THAY ĐỔI: Dùng Prisma Update
    const updatedPet = await prisma.pet.update({
      where: { id: petId }, // update_many không cần thiết nếu ID là unique
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

// ------------------- Xóa thú cưng (Đã bảo mật) -------------------
// DELETE /api/pets/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const petId = req.params.id;
    const userIdFromToken = req.user.user_id;

    // 👈 THAY ĐỔI: Dùng Prisma deleteMany để xóa dựa trên cả 2 điều kiện
    // Điều này ngăn user xóa pet của người khác
    const deleteResult = await prisma.pet.deleteMany({
      where: {
        id: petId,
        user_id: userIdFromToken,
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