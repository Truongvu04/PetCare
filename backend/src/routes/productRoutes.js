import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isVendor } from "../middleware/checkRole.js";
import {
  createProduct,
  updateProduct,
  getVendorProducts,
  getAllProducts,
  getProductById,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadDir);
}
console.log("📁 Upload directory:", uploadDir);

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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("📎 File upload check:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase()
    });

    const allowedExtensions = [".jpeg", ".jpg", ".png", ".webp", ".gif"];
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype.toLowerCase();

    const isValidExtension = allowedExtensions.includes(extname);
    const isValidMimeType = mimetype.startsWith("image/");

    if (isValidExtension || isValidMimeType) {
      console.log("✅ File accepted");
      return cb(null, true);
    } else {
      console.error("❌ File rejected:", {
        extname: extname || "no extension",
        mimetype,
        isValidExtension,
        isValidMimeType
      });
      cb(new Error(`Only image files are allowed. Received: ${extname || "no extension"}, MIME: ${mimetype}`));
    }
  },
});

router.post(
  "/",
  verifyToken,
  isVendor,
  (req, res, next) => {
    upload.array("images", 10)(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large. Maximum size is 5MB" });
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ message: "Too many files. Maximum is 10" });
          }
        }
        return res.status(400).json({ message: "File upload error: " + err.message });
      }
      next();
    });
  },
  createProduct
);

router.get("/", getAllProducts);

router.get("/my-products", verifyToken, isVendor, getVendorProducts);

router.get("/:id", getProductById);

router.put(
  "/:id",
  verifyToken,
  isVendor,
  (req, res, next) => {
    upload.array("images", 10)(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large. Maximum size is 5MB" });
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ message: "Too many files. Maximum is 10" });
          }
        }
        return res.status(400).json({ message: "File upload error: " + err.message });
      }
      next();
    });
  },
  updateProduct
);

router.delete("/:id", verifyToken, isVendor, deleteProduct);

export default router;

