import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/sendEmail.js";

const router = express.Router();
const prisma = new PrismaClient();

/* ------------------- REGISTER ------------------- */
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log("📩 Register request:", req.body);

  if (!fullName || !email || !password)
    return res.status(400).json({ message: "Full name, email, and password required" });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.warn("⚠️ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { full_name: fullName, email, password_hash: hash },
    });

    console.log("✅ User registered:", newUser.user_id);
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------- SEND OTP ------------------- */
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  console.log("📩 Send OTP request:", email);

  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔢 Generated OTP:", otp);

    await prisma.oTP.create({ data: { email, code: otp } });
    await sendOTPEmail(email, otp);
    console.log("📧 OTP sent to:", email);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ------------------- VERIFY OTP ------------------- */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  console.log("📩 Verify OTP:", email, otp);

  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  try {
    const record = await prisma.oTP.findFirst({
      where: { email, code: otp },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      console.warn("⚠️ Invalid OTP for:", email);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    console.log("✅ OTP verified for:", email);
    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------- LOGIN ------------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("📩 Login request:", email);

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn("⚠️ User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.warn("⚠️ Invalid password for:", email);
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ FIXED: dùng "user_id" thay vì "userId"
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful:", email);

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------- USER INFO (JWT Token) ------------------- */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn("⚠️ No Authorization header received");
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Log token và secret đang dùng
    console.log("Incoming auth header:", authHeader);
    console.log("Using secret:", process.env.JWT_SECRET);

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔍 Decoded token:", decoded);

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { user_id: true, full_name: true, email: true, role: true},
    });

    if (!user) {
      console.warn("⚠️ User not found in DB for email:", decoded.email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Authenticated user:", user.email);
    res.json(user);
  } catch (err) {
    console.error("❌ /me error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});


/* ------------------- LOGOUT ------------------- */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  console.log("🚪 User logged out");
  res.json({ message: "Logged out successfully" });
});

export default router;
