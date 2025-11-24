// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    // SỬ DỤNG JWT_SECRET CHUNG cho Owner/Admin
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" }); 
        }

        // Gắn thông tin cơ bản và vai trò vào req.user
        req.user = {
            user_id: decoded.user_id,
            role: decoded.role, 
            email: decoded.email,
        };
        
        if (!req.user.user_id) {
            return res.status(401).json({ message: "Unauthorized: Missing user ID in token" });
        }

        next();
    });
};