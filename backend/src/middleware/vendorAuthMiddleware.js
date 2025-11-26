// src/middleware/vendorAuthMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const vendorAuth = async (req, res, next) => {
    try {
        // 1. Lấy token (code giữ nguyên)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Vui lòng đăng nhập (Thiếu token Vendor)" });
        }
        const token = authHeader.split(" ")[1];
        //const decoded = jwt.verify(token, process.env.VENDOR_SECRET_KEY);
// Tìm dòng xác thực token và sửa lại tham số thứ 2 (Secret Key)
const decoded = jwt.verify(
    token, 
    process.env.VENDOR_SECRET_KEY || process.env.JWT_SECRET // <--- SỬA DÒNG NÀY
);
        // 3. Tìm Vendor trong DB
        const vendorId = decoded.id; // ID từ token

        if (!vendorId) {
            return res.status(401).json({ message: "Token Vendor không có ID hợp lệ." });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { vendor_id: vendorId }, // ✅ SỬA LỖI: Dùng vendor_id
        });

        if (!vendor) {
            return res.status(403).json({ message: "Tài khoản Vendor không tồn tại hoặc đã bị xóa." });
        }

        // 4. Gắn thông tin và chuyển tiếp
        // Gắn ID Vendor để Controllers (như getRevenueChart) có thể sử dụng
        req.vendor = vendor; 
        next();

    } catch (err) {
        return res.status(401).json({ message: "Token Vendor không hợp lệ hoặc đã hết hạn.", error: err.message });
    }
};