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

// ✅ API lấy danh sách thú cưng (CÓ LỌC THEO USER_ID VÀ LUÔN TRẢ VỀ MẢNG)
router.get("/", async (req, res) => {
  try {
    const userId = req.query.user_id; // Lấy user_id từ query ?user_id=...
    let sql = "SELECT * FROM pets"; // Câu lệnh SQL cơ bản
    const params = []; // Mảng chứa tham số cho câu lệnh SQL

    if (userId) {
      if (!/^\d+$/.test(userId)) {
         return res.status(400).json({ message: "Invalid user_id format" });
      }
      sql += " WHERE user_id = ?"; // Thêm điều kiện lọc
      params.push(userId); // Thêm giá trị user_id vào mảng tham số
    }

    sql += " ORDER BY created_at DESC"; // Thêm sắp xếp

    // Sử dụng db.query vì nó thường trả về mảng rows trực tiếp hơn theo setup db.js
    const rows = await db.query(sql, params);

    // ✅ Thêm log để kiểm tra kiểu dữ liệu của rows TRƯỚC KHI gửi response
    console.log(`[DEBUG] GET /api/pets - UserID: ${userId || 'ALL'} - Rows type: ${typeof rows}, Is Array: ${Array.isArray(rows)}`);
    // console.log('[DEBUG] Rows data:', rows); // Bỏ comment nếu muốn xem cả dữ liệu

    // ✅ Đảm bảo luôn gửi về một mảng JSON
    // Nếu rows không phải là mảng (ví dụ: null, undefined, hoặc object lỗi từ db.query), gửi về mảng rỗng.
    res.json(Array.isArray(rows) ? rows : []);

  } catch (err) {
    console.error("❌ Error fetching pets:", err); // Log lỗi chi tiết ở backend
    // Trả về lỗi 500 với thông báo rõ ràng
    res.status(500).json({ message: "Database error while fetching pets" });
  }
});


// ✅ API lấy chi tiết thú cưng theo ID (giữ nguyên)
router.get("/:id", async (req, res) => {
  try {
    const petId = req.params.id;
    // Bỏ kiểm tra regex nếu ID của bạn có thể khác 12 hex chars
    // if (!/^[a-f0-9]{12}$/.test(petId)) {
    //    return res.status(400).json({ message: "Invalid pet ID format" });
    // }

    // Sử dụng db.execute vì thường dùng cho câu lệnh có tham số đơn lẻ và cần hiệu năng
    const [rows] = await db.execute("SELECT * FROM pets WHERE id = ?", [petId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json(rows[0]); // API lấy chi tiết thì trả về object là đúng
  } catch (err) {
    console.error("❌ Error fetching pet:", err);
    res.status(500).json({ message: "Database error while fetching pet details" });
  }
});

//GET /api/pets/:petId/reminders
//Lấy tất cả reminders của một pet, sắp xếp theo reminder_date ASC
router.get('/:petId/reminders', async (req, res) => {
  try {
    const petId = req.params.petId;
    if (Number.isNaN(Number(petId))) {
      return res.status(400).json({ error: 'Invalid pet id' });
    }

    const rows = await db.query(
      'SELECT * FROM reminders WHERE pet_id = ? ORDER BY reminder_date ASC',
      [petId]
    );

    return res.status(200).json(rows || []);
  } catch (err) {
    console.error('GET /api/pets/:petId/reminders error:', err);
    return res.status(500).json({ error: 'Internal server error' });
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