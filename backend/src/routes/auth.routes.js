import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();
const prisma = new PrismaClient();

/* ------------------- REGISTER ------------------- */
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log("📩 Register request:", req.body);

  if (!fullName || !email || !password)
    return res.status(400).json({ message: "Full name, email, and password required" });

  try {
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      console.warn("⚠️ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
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

    await prisma.otp.create({ data: { email, code: otp } });
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
    const record = await prisma.otp.findFirst({
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
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      console.warn("⚠️ User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.warn("⚠️ Invalid password for:", email);
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const vendor = await prisma.vendors.findUnique({
      where: { user_id: user.user_id },
    });

    const customer = vendor ? null : { customer_id: user.user_id };

    // QUAN TRỌNG: LUÔN dùng role từ users table làm nguồn chính xác duy nhất
    // KHÔNG override role dựa trên vendor record vì:
    // - Admin có thể downgrade user từ vendor về owner
    // - Role trong users table là nguồn chính xác nhất
    // - Vendor record chỉ là metadata, không quyết định role
    let finalRole = user.role;
    
    // Chỉ set default role nếu role là null/undefined (chưa được set)
    if (!finalRole || finalRole === null || finalRole === undefined) {
      // Nếu có vendor record và role chưa set, có thể set default là vendor
      // Nhưng chỉ khi role thực sự là null/undefined
      if (vendor) {
        finalRole = 'vendor';
        // Update database để sync
        try {
          await prisma.users.update({
            where: { user_id: user.user_id },
            data: { role: 'vendor' }
          });
          user.role = 'vendor';
        } catch (err) {
          console.warn("⚠️ Failed to update user.role in database:", err.message);
        }
      } else {
        finalRole = 'owner'; // Default to owner if no vendor
      }
    }
    // Nếu role đã được set (không phải null/undefined), LUÔN dùng role đó
    // KHÔNG override dựa trên vendor record

    console.log("✅ Login successful:", email, "Role:", finalRole, "Has vendor:", !!vendor);

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: finalRole, // Use corrected role for automatic redirect
        customer: customer,
        vendor: vendor ? {
          vendor_id: vendor.vendor_id,
          store_name: vendor.store_name,
          logo_url: vendor.logo_url,
          status: vendor.status
        } : null, // Include vendor info if exists
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn("⚠️ No Authorization header received");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.users.findUnique({
      where: { user_id: decoded.user_id },
      select: { 
        user_id: true, 
        full_name: true, 
        email: true, 
        phone: true,
        avatar_url: true,
        role: true // Include role for frontend routing
      },
    });

    if (!user) {
      console.warn("⚠️ User not found in DB for user_id:", decoded.user_id);
      return res.status(404).json({ message: "User not found" });
    }

    const vendor = await prisma.vendors.findUnique({
      where: { user_id: user.user_id },
    });

    const customer = vendor ? null : { customer_id: user.user_id };

    // QUAN TRỌNG: LUÔN dùng role từ users table làm nguồn chính xác duy nhất
    // KHÔNG override role dựa trên vendor record vì:
    // - Admin có thể downgrade user từ vendor về owner
    // - Role trong users table là nguồn chính xác nhất
    // - Vendor record chỉ là metadata, không quyết định role
    let finalRole = user.role;
    
    // Chỉ set default role nếu role là null/undefined (chưa được set)
    if (!finalRole || finalRole === null || finalRole === undefined) {
      // Nếu có vendor record và role chưa set, có thể set default là vendor
      // Nhưng chỉ khi role thực sự là null/undefined
      if (vendor) {
        finalRole = 'vendor';
        // Update database để sync
        try {
          await prisma.users.update({
            where: { user_id: user.user_id },
            data: { role: 'vendor' }
          });
          user.role = 'vendor';
        } catch (err) {
          console.warn("⚠️ /me: Failed to update user.role in database:", err.message);
        }
      } else {
        finalRole = 'owner'; // Default to owner if no vendor
      }
    }
    // Nếu role đã được set (không phải null/undefined), LUÔN dùng role đó
    // KHÔNG override dựa trên vendor record

    console.log("✅ Authenticated user:", user.email, "Role:", finalRole, "Has vendor:", !!vendor);
    res.json({
      ...user,
      role: finalRole, // Use corrected role
      customer: customer || null,
      vendor: vendor || null,
    });
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

router.post('/register', registerUser);

export default router;
