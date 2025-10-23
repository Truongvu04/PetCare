import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Cấu hình Gmail SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,      // từ .env
        pass: process.env.GMAIL_PASSWORD,  // App Password
    },
});

// POST /api/send-otp
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await transporter.sendMail({
            from: `"PetCare+" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
        });

        // Có thể lưu otp vào DB hoặc cache ở đây
        res.json({ message: "OTP sent successfully", otp }); // trả OTP cho frontend test nhanh
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

export default router;
