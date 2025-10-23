import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import passport from "passport";

const router = express.Router();
const prisma = new PrismaClient();

/* ------------------- Nodemailer config ------------------- */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/* ------------------- Send OTP Email ------------------- */
const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}`,
    });
};

/* ------------------- REGISTER ------------------- */
router.post("/register", async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
        return res.status(400).json({ message: "Full name, email, and password required" });

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { full_name: fullName, email, password_hash: hash },
        });
        res.json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ------------------- SEND OTP ------------------- */
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP in DB
        await prisma.oTP.create({
            data: {
                email,
                code: otp,
            },
        });

        await sendOTPEmail(email, otp);
        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("Send OTP error:", err);
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

/* ------------------- VERIFY OTP ------------------- */
router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp)
        return res.status(400).json({ message: "Email and OTP required" });

    try {
        const record = await prisma.oTP.findFirst({
            where: { email, code: otp },
            orderBy: { createdAt: "desc" },
        });

        if (!record)
            return res.status(400).json({ message: "Invalid or expired OTP" });

        res.json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ------------------- LOGIN ------------------- */
/* ------------------- LOGIN (Normal email/password) ------------------- */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ------------------- USER INFO (OAuth or JWT) ------------------- */
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ message: "Missing Authorization header" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { user_id: decoded.userId },
            select: { user_id: true, full_name: true, email: true, role: true },
        });

        res.json(user);
    } catch (err) {
        console.error("Get /me error:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});

/* ------------------- DELETE USER (User data deletion) ------------------- */
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({ where: { user_id: Number(id) } });
        if (!user) return res.status(404).json({ message: "User not found" });

        await prisma.user.delete({ where: { user_id: Number(id) } });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ message: "Failed to delete user" });
    }
});

export default router;
