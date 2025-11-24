import express from "express";
import { sendOTPSMS } from "../services/smsService.js";
// service gửi SMS

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
    res.send("SMS route is working!");
});

// Route gửi OTP SMS
router.post("/send-otp", async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // random 6 số

    try {
        await sendOTPSMS(phone, otp);
        res.json({ success: true, otp }); // trả OTP để test
    } catch (error) {
        res.status(500).json({ success: false, message: "SMS send failed" });
    }
});

export default router;
