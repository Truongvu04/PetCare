import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

export const verifyToken = async (req, res, next) => {
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

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userIdFromPayload = decoded?.user_id || decoded?.id || decoded?.sub || decoded?.uid;

    if (!userIdFromPayload) {
      console.warn("Token verified but no user_id found in payload. Payload:", decoded);
      return res.status(401).json({ message: "Unauthorized: Missing user ID in token" });
    }

    const user = await prisma.users.findUnique({
      where: { user_id: userIdFromPayload }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const vendor = await prisma.vendors.findUnique({
      where: { user_id: user.user_id }
    });

    const customer = vendor ? null : { customer_id: user.user_id };

    // IMPORTANT: Preserve admin role even if user has vendor record
    // This ensures admin users can access admin routes even if they have vendor data
    let finalRole = user.role;
    
    // Only override role if user has vendor AND role is NOT 'admin' (preserve admin role)
    if (vendor && user.role !== 'admin') {
      if (!finalRole || finalRole === null || finalRole === undefined) {
        // If no role set and has vendor, default to 'vendor'
        finalRole = 'vendor';
      } else if (finalRole !== 'vendor') {
        // User has vendor but role is something else (not admin) - keep original role
        finalRole = finalRole;
      }
    }
    // If user.role === 'admin', preserve it regardless of vendor existence

    // Create user object with preserved role
    const userWithRole = {
      ...user,
      role: finalRole
    };

    req.user = userWithRole;
    req.customer = customer;
    req.vendor = vendor;

    console.log("✅ Token verified. User:", { 
      user_id: user.user_id, 
      email: user.email,
      originalRole: user.role,
      finalRole: finalRole,
      hasCustomer: !!customer,
      hasVendor: !!vendor
    });
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
