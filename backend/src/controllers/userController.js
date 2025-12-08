import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
// Giả định bạn đã có JWT_SECRET trong .env

// =========================================================
// 1. USER AUTH (Đăng ký & Đăng nhập Owner)
// =========================================================

export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Vui lòng điền đủ thông tin." });
        }
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email đã được sử dụng." });

        const hashed = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { 
                full_name: fullName, 
                email, 
                password_hash: hashed,
                role: "owner", // ✅ Vai trò chính xác
                phone: phone || null
            },
        });

        const token = jwt.sign(
            { user_id: newUser.user_id, role: 'owner' },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ message: "Đăng ký User thành công", token, user: newUser });
    } catch (error) {
        console.error("User Register Error:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi đăng ký User." });
    }
};

// TRONG userController.js (Login User/Owner)
export const loginUser = async (req, res) => {
    const token = jwt.sign(
    { 
        user_id: user.user_id, 
        role: user.role // ✅ NẾU user.role LÀ 'admin', NÓ SẼ ĐƯỢC KÝ CHÍNH XÁC
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);
    // ...
};


// TRONG vendorController.js (Login Vendor)
export const loginVendor = async (req, res) => {
    // ...
    // Sau khi xác thực thành công và lấy vendor_id:
    const token = jwt.sign(
        { id: vendor.vendor_id, role: 'vendor' }, // ✅ KÝ VỚI ROLE: vendor
        process.env.VENDOR_SECRET_KEY, 
        { expiresIn: "7d" }
    );
    // ...
};