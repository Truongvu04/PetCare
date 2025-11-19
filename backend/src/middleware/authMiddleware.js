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

    const customer = await prisma.vendors.findUnique({
      where: { user_id: user.user_id }
    }).then(v => v ? null : { customer_id: user.user_id });

    const vendor = await prisma.vendors.findUnique({
      where: { user_id: user.user_id }
    });

    req.user = user;
    req.customer = customer;
    req.vendor = vendor;

    console.log("✅ Token verified. User:", { 
      user_id: user.user_id, 
      email: user.email,
      hasCustomer: !!customer,
      hasVendor: !!vendor
    });
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
