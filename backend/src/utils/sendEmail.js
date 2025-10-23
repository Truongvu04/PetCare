import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true nếu port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"PetCare+" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });

    console.log("OTP sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Send OTP error:", err);
    throw err;
  }
};
