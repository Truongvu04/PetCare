// PetCare/backend/src/utils/mailer.js
import nodemailer from "nodemailer";
import 'dotenv/config'; // Load biến môi trường

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
    // THÊM VÀO: Bật log để gỡ lỗi
    logger: true, 
    debug: true 
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ LỖI XÁC THỰC MAILER:', error);
    } else {
        console.log('✅ Mailer đã sẵn sàng để gửi email (Đã xác thực)');
    }
});

/**
 * Gửi email thông báo reminder.
 * @param {string} userEmail Địa chỉ email người nhận.
 * @param {string} subject Chủ đề email.
 * @param {string} htmlContent Nội dung email dạng HTML.
 * @returns {Promise<boolean>} True nếu gửi thành công, false nếu lỗi.
 */

export async function sendReminderEmail(userEmail, subject, htmlContent) {
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


export const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"PetCare+ System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};