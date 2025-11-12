import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import passport from "passport";
import cookieParser from "cookie-parser";

import authRoutes from "./src/routes/auth.routes.js";
import petRoutes from "./src/routes/pets.js";
import reminderRoutes from "./src/routes/reminder.js";
import geoapifyRoutes from "./src/routes/geoapify.routes.js";

import "./src/config/passport.js";
import './src/scheduler/reminderJob.js'; // Đã kích hoạt cron job

if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET in .env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/geoapify", geoapifyRoutes);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// -------------------  FIX START -------------------
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    // req.user bây giờ là đối tượng user từ database
    const user = req.user; 

    // ✅ TẠO TOKEN MỚI TỪ THÔNG TIN USER
    const payload = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    };

    // Tạo token giống hệt như khi đăng nhập bằng email
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Đặt hạn 1 ngày
    );

    // Chuyển hướng về frontend VỚI TOKEN HỢP LỆ
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  }
);
// -------------------  FIX END -------------------


app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// -------------------  FIX START (Tương tự cho Facebook) -------------------
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login", session: false }),
  (req, res) => {
    // req.user bây giờ là đối tượng user từ database
    const user = req.user;

    // ✅ TẠO TOKEN MỚI TỪ THÔNG TIN USER
    const payload = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Chuyển hướng về frontend VỚI TOKEN HỢP LỆ
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  }
);
// -------------------  FIX END -------------------


app.get("/", (req, res) => res.send("✅ PetCare+ Backend (Prisma+JWT) is running!"));

app.listen(PORT, () =>
  console.log(`🚀 Server (Prisma) running at http://localhost:${PORT}`)
);