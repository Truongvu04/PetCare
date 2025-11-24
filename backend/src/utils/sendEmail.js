import { sendEmail } from "./mailer.js";

export const sendOTPEmail = async (email, otp) => {
  const subject = "🔐 Your PetCare+ OTP Verification Code";
  const text = `Your OTP code is: ${otp}`;
  return sendEmail(email, subject, text);
};
