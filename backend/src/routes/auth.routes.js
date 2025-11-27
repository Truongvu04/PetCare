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

    // IMPORTANT: Preserve admin role even if user has vendor record
    // Admin users can have both admin and vendor access
    let finalRole = user.role;
    
    // Debug logging
    console.log("🔍 Role check - Original role:", user.role, "Vendor exists:", !!vendor, "Vendor ID:", vendor?.vendor_id);
    
    // Only override role if:
    // 1. User has vendor record AND
    // 2. User role is NOT 'admin' (preserve admin role)
    // 3. User role is null/undefined (set default to 'vendor')
    if (vendor && user.role !== 'admin') {
      if (!finalRole || finalRole === null || finalRole === undefined) {
        // If no role set and has vendor, default to 'vendor'
        finalRole = 'vendor';
        console.log("🔧 Setting default role to 'vendor' because user has vendor record and no role was set");
        
        // Only update database if role was null/undefined
        try {
          await prisma.users.update({
            where: { user_id: user.user_id },
            data: { role: 'vendor' }
          });
          user.role = 'vendor';
        } catch (err) {
          console.warn("⚠️ Failed to update user.role in database:", err.message);
        }
      } else if (finalRole !== 'vendor') {
        // User has vendor but role is something else (not admin) - override in response only
        finalRole = 'vendor';
        console.log("🔧 Overriding role to 'vendor' in response (vendor_id:", vendor.vendor_id + ") - NOT updating database");
        // DO NOT update database - preserve original role
      }
    } else if (!finalRole || finalRole === null || finalRole === undefined) {
      // If no role set and no vendor, default to 'owner' (customer)
      finalRole = 'owner';
      console.log("🔧 Setting default role to 'owner' because no role was set");
    } else if (user.role === 'admin' && vendor) {
      // Admin with vendor - preserve admin role, vendor info available in response
      console.log("✅ Admin user with vendor record - preserving admin role, vendor info available");
    } else {
      console.log("✅ Keeping original role:", finalRole);
    }

    console.log("✅ Login successful:", email, "Original Role:", user.role, "Final Role:", finalRole, "Has vendor:", !!vendor);

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

    // IMPORTANT: Preserve admin role even if user has vendor record
    // Admin users can have both admin and vendor access
    let finalRole = user.role;
    
    // Only override role if:
    // 1. User has vendor record AND
    // 2. User role is NOT 'admin' (preserve admin role)
    // 3. User role is null/undefined (set default to 'vendor')
    if (vendor && user.role !== 'admin') {
      if (!finalRole || finalRole === null || finalRole === undefined) {
        // If no role set and has vendor, default to 'vendor'
        finalRole = 'vendor';
        console.log("🔧 /me: Setting default role to 'vendor' because user has vendor record and no role was set");
        
        // Only update database if role was null/undefined
        try {
          await prisma.users.update({
            where: { user_id: user.user_id },
            data: { role: 'vendor' }
          });
          user.role = 'vendor';
        } catch (err) {
          console.warn("⚠️ /me: Failed to update user.role in database:", err.message);
        }
      } else if (finalRole !== 'vendor') {
        // User has vendor but role is something else (not admin) - override in response only
        finalRole = 'vendor';
        console.log("🔧 /me: Overriding role to 'vendor' in response - NOT updating database");
        // DO NOT update database - preserve original role
      }
    } else if (!finalRole || finalRole === null) {
      // If no role set and no vendor, default to 'owner' (customer)
      finalRole = 'owner';
      console.log("🔧 /me: Setting default role to 'owner' because no role was set");
    } else if (user.role === 'admin' && vendor) {
      // Admin with vendor - preserve admin role, vendor info available in response
      console.log("✅ /me: Admin user with vendor record - preserving admin role, vendor info available");
    } else {
      console.log("✅ /me: Keeping original role:", finalRole);
    }

    console.log("✅ Authenticated user:", user.email, "Original Role:", user.role, "Final Role:", finalRole);
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
