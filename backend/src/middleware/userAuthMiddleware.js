// src/middleware/userAuthMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const userAuth = async (req, res, next) => {
    // console.log(">>> [DEBUG] Đang kiểm tra Auth User...");

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Vui lòng đăng nhập (Thiếu token User)" });
        }

        const token = authHeader.split(" ")[1];

        // 2. Giải mã Token với USER_SECRET_KEY
        // Đảm bảo token được ký bằng khóa bí mật của User
        const decoded = jwt.verify(token, process.env.USER_SECRET_KEY);

        // 3. Tìm User trong DB
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).json({ message: "Token User không có ID hợp lệ." });
        }

        // LƯU Ý: Đảm bảo bạn có model 'User' trong Prisma schema
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(403).json({ message: "Tài khoản User không tồn tại hoặc đã bị xóa." });
        }

        // 4. Gắn thông tin và chuyển tiếp
        req.user = user;
        next();

    } catch (err) {
        // console.error("Auth Error User:", err.message);
        return res.status(401).json({ message: "Token User không hợp lệ hoặc đã hết hạn.", error: err.message });
    }
};