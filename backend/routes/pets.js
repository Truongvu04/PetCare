const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const db = require("../config/db");

// ✅ Tạo thư mục lưu ảnh nếu chưa có
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Cấu hình multer (upload ảnh)
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


// ✅ API thêm thú cưng
router.post("/", upload.single("photo_url"), async (req, res) => {
  try {
    const {
      user_id,
      name,
      species,
      vaccination,
      age,
      weight,
      breed,
      medical_history,
      description,
    } = req.body;

    if (!user_id || !name || user_id === "undefined" || name.trim() === "") {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const id = crypto.randomBytes(6).toString("hex");
    const validAge = age ? parseInt(age) : null;
    const validWeight = weight ? parseFloat(weight) : null;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    await db.execute(
      `INSERT INTO pets 
      (id, user_id, name, species, vaccination, age, weight, breed, medical_history, description, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user_id,
        name,
        species,
        vaccination,
        validAge,
        validWeight,
        breed,
        medical_history,
        description,
        photoPath,
      ]
    );

    res.status(201).json({
      message: "✅ Pet added successfully!",
      pet_id: id,
      photo_url: photoPath,
    });
  } catch (err) {
    console.error("❌ Error adding pet:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ✅ API lấy danh sách thú cưng
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM pets ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching pets:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ✅ API lấy chi tiết thú cưng theo ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM pets WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching pet:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ✅ API cập nhật thú cưng (giữ nguyên ảnh cũ nếu không upload mới)
router.put("/:id", upload.single("photo_url"), async (req, res) => {
  try {
    const { name, species, vaccination, age, weight, breed, medical_history, description } = req.body;

    // 🔹 Lấy dữ liệu cũ để giữ lại ảnh
    const [oldPetRows] = await db.execute("SELECT photo_url FROM pets WHERE id = ?", [req.params.id]);
    if (oldPetRows.length === 0) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // 🔹 Nếu không có file mới, giữ lại ảnh cũ
    const oldPhoto = oldPetRows[0].photo_url;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : oldPhoto;

    const validAge = age ? parseInt(age) : null;
    const validWeight = weight ? parseFloat(weight) : null;

    await db.execute(
      `UPDATE pets 
       SET name=?, species=?, vaccination=?, age=?, weight=?, breed=?, medical_history=?, description=?, photo_url=?
       WHERE id=?`,
      [
        name || null,
        species || null,
        vaccination || null,
        validAge,
        validWeight,
        breed || null,
        medical_history || null,
        description || null,
        photoPath,
        req.params.id,
      ]
    );

    res.json({ message: "✅ Pet updated successfully!", photo_url: photoPath });
  } catch (err) {
    console.error("❌ Error updating pet:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// ✅ API xóa thú cưng
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM pets WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({ message: "✅ Pet deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting pet:", err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
