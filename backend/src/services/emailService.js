// src/services/emailService.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // <--- đổi sang EMAIL_USER
        pass: process.env.EMAIL_PASS,  // <--- đổi sang EMAIL_PASS
    },
});

export const sendOTPEmail = async (toEmail, otp) => {
    try {
        console.log("Sending OTP to:", toEmail, "using:", process.env.EMAIL_USER);
        await transporter.sendMail({
            from: `"PetCare" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}`,
            html: `<h3>Your OTP code is:</h3> <h2>${otp}</h2>`,
        });
        console.log("✅ OTP sent to email!");
    } catch (error) {
        console.error("❌ Failed to send OTP:", error);
        throw error;
    }
};
