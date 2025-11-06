// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
 
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("Incoming auth header:", authHeader);

  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({ message: "No token provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return res.status(401).json({ message: "Malformed token" });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verify error:", err);
      // 403 nếu token invalid/expired, 401 nếu missing info
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const userIdFromPayload = decoded?.user_id || decoded?.id || decoded?.sub || decoded?.uid;

    req.user = {
      user_id: userIdFromPayload || null,
      email: decoded?.email || null,
      role: decoded?.role || null,
      raw: decoded, // lưu tạm payload để debug (xóa sau khi production)
    };

    if (!req.user.user_id) {
      console.warn("Token verified but no user_id found in payload. Payload:", decoded);
      return res.status(401).json({ message: "Unauthorized: Missing user ID in token" });
    }

    console.log("✅ Token verified. User:", { user_id: req.user.user_id, email: req.user.email, role: req.user.role });
    next();
  });
};
