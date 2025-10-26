// PetCare/backend/utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load biến môi trường

// Tạo transporter object dùng SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // user
    pass: process.env.EMAIL_PASS, // password or app password
  },
  tls: {
      // Không từ chối cert tự ký (hữu ích khi test local nếu có)
      rejectUnauthorized: false
  }
});

/**
 * Gửi email thông báo reminder.
 * @param {string} userEmail Địa chỉ email người nhận.
 * @param {string} subject Chủ đề email.
 * @param {string} htmlContent Nội dung email dạng HTML.
 * @returns {Promise<boolean>} True nếu gửi thành công, false nếu lỗi.
 */
async function sendReminderEmail(userEmail, subject, htmlContent) {
  if (!userEmail || !subject || !htmlContent) {
    console.error('[Mailer] Missing required arguments: userEmail, subject, or htmlContent.');
    return false;
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[Mailer] Email credentials not configured in .env file. Cannot send email.');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"PetCare+ No-Reply" <${process.env.EMAIL_USER}>`, // sender address
    to: userEmail, // list of receivers
    subject: subject, // Subject line
    html: htmlContent, // html body
  };

  try {
    console.log(`[Mailer] Attempting to send email to ${userEmail} with subject: ${subject}`);
    let info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Email sent successfully to ${userEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${userEmail}:`, error);
    return false;
  }
}

module.exports = { sendReminderEmail };