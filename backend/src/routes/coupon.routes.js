import express from "express";
import { 
    validateCoupon, 
    getUserCoupons, 
    getAllCouponsAdmin, 
    createCouponAdmin, 
    updateCouponAdmin, 
    deleteCouponAdmin 
} from "../controllers/couponController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/validate", validateCoupon);

// User
router.get("/user/wallet", verifyToken, getUserCoupons);

// Admin (simple check - can be enhanced later)
const checkAdmin = async (req, res, next) => {
    console.log("🔍 checkAdmin middleware:", {
        hasUser: !!req.user,
        userId: req.user?.user_id,
        userRole: req.user?.role,
        userEmail: req.user?.email,
        hasVendor: !!req.vendor,
        vendorId: req.vendor?.vendor_id
    });
    
    if (!req.user) {
        console.warn("⚠️ checkAdmin: No user found in request");
        return res.status(403).json({ error: "Admin access required - No user found" });
    }
    
    // Always re-fetch from database to ensure we have the latest role
    // This is important because role might have been changed by other processes
    const { prisma } = await import("../config/prisma.js");
    const latestUser = await prisma.users.findUnique({
        where: { user_id: req.user.user_id },
        select: { 
            role: true,
            email: true,
            user_id: true
        }
    });
    
    if (!latestUser) {
        console.error("❌ checkAdmin: User not found in database, user_id:", req.user.user_id);
        return res.status(403).json({ error: "Admin access required - User not found" });
    }
    
    let userRole = latestUser.role;
    
    // IMPORTANT: If user has vendor record but role is 'admin' in database, preserve it
    // Admin users can have both admin and vendor access
    if (req.vendor && userRole === 'admin') {
        console.log("✅ checkAdmin: Admin user with vendor record - preserving admin role");
        // Role is already 'admin', no need to change
    } else if (req.vendor && userRole !== 'admin' && userRole !== 'vendor') {
        // User has vendor record but role is something else - don't auto-update to vendor
        // Preserve the original role
        console.log("🔧 checkAdmin: User has vendor record but role is:", userRole, "- preserving original role");
    }
    
    // Update req.user.role to latest value from database
    req.user.role = userRole;
    
    console.log("🔍 checkAdmin: Final role check - DB role:", userRole, "User ID:", latestUser.user_id, "Email:", latestUser.email);
    
    if (userRole === 'admin') {
        console.log("✅ checkAdmin: User is admin, allowing access");
        next();
    } else {
        console.warn("⚠️ checkAdmin: User role is not admin. Role:", userRole, "User ID:", latestUser.user_id, "Email:", latestUser.email);
        console.warn("⚠️ checkAdmin: To fix this, run: UPDATE users SET role = 'admin' WHERE user_id =", latestUser.user_id);
        res.status(403).json({ 
            error: "Admin access required",
            message: `User role is '${userRole}', expected 'admin'. User ID: ${latestUser.user_id}. Please ensure your account has admin role in the database.`,
            userId: latestUser.user_id,
            currentRole: userRole
        });
    }
};

router.get("/admin/all", verifyToken, checkAdmin, getAllCouponsAdmin);
router.post("/admin/create", verifyToken, checkAdmin, createCouponAdmin);
router.put("/admin/:couponId", verifyToken, checkAdmin, updateCouponAdmin);
router.delete("/admin/:couponId", verifyToken, checkAdmin, deleteCouponAdmin);

export default router;
