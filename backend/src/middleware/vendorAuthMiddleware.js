// src/middleware/vendorAuthMiddleware.js
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

export const vendorAuth = async (req, res, next) => {
    try {
        // 1. Lấy token từ user authentication (unified token)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("⚠️ VendorAuth: No authorization header");
            return res.status(401).json({ message: "Vui lòng đăng nhập (Thiếu token)" });
        }
        const token = authHeader.split(" ")[1];
        
        // 2. Verify token using JWT_SECRET (same as user auth)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ VendorAuth: Token verified, user_id:", decoded.user_id);
        
        // 3. Get user from token
        const userId = decoded.user_id;
        if (!userId) {
            console.warn("⚠️ VendorAuth: No user_id in token");
            return res.status(401).json({ message: "Token không có user_id hợp lệ." });
        }

        // 4. Get user and check if they are a vendor
        const user = await prisma.users.findUnique({
            where: { user_id: userId }
        });

        if (!user) {
            console.warn("⚠️ VendorAuth: User not found, user_id:", userId);
            return res.status(401).json({ message: "Người dùng không tồn tại." });
        }

        console.log("✅ VendorAuth: User found, role:", user.role);

        // 5. Check vendor record FIRST (more reliable than checking role)
        // If vendor record exists, user is a vendor regardless of user.role value
        console.log("🔍 VendorAuth: Looking for vendor record with user_id:", user.user_id);
        let vendor = await prisma.vendors.findUnique({
            where: { user_id: user.user_id }
        });

        if (!vendor) {
            console.warn("⚠️ VendorAuth: No vendor record found for user_id:", user.user_id, "email:", user.email, "role:", user.role);
            
            // No vendor record - check if role is vendor (might be set but no vendor record created)
            if (user.role !== 'vendor') {
                console.warn("⚠️ VendorAuth: User is not a vendor, role:", user.role, "and no vendor record found");
                return res.status(403).json({ message: "Tài khoản không có quyền truy cập vendor." });
            } else {
                // Role is vendor but no vendor record - auto-create vendor record for consistency
                // This handles cases where user.role was set but vendor record wasn't created
                console.log("🔧 VendorAuth: User role is 'vendor' but vendor record doesn't exist. Auto-creating vendor record...");
                try {
                    const newVendor = await prisma.vendors.create({
                        data: {
                            user_id: user.user_id,
                            store_name: user.full_name || `Store ${user.user_id}`,
                            status: 'approved', // Auto-approve since user already has vendor role
                        }
                    });
                    console.log("✅ VendorAuth: Auto-created vendor record, vendor_id:", newVendor.vendor_id);
                    
                    // Use the newly created vendor
                    vendor = newVendor;
                } catch (err) {
                    console.error("❌ VendorAuth: Failed to auto-create vendor record:", err.message);
                    return res.status(403).json({ 
                        message: "Vendor record không tồn tại. Vui lòng đăng ký tài khoản vendor hoặc liên hệ quản trị viên.",
                        error: err.message
                    });
                }
            }
        }

        // Vendor record exists - user is a vendor (regardless of user.role value)
        // This handles the case where user.role might not be updated in database yet
        console.log("✅ VendorAuth: Vendor record found, vendor_id:", vendor.vendor_id, "User role in DB:", user.role);
        
        // IMPORTANT: Preserve admin role - do NOT update admin role to 'vendor'
        // Admin users can have both admin and vendor access
        // Only update role if:
        // 1. User role is NOT 'admin' (preserve admin role)
        // 2. User role is null/undefined (set default to 'vendor')
        if (user.role !== 'admin' && user.role !== 'vendor') {
            if (!user.role || user.role === null || user.role === undefined) {
                // If no role set and has vendor, default to 'vendor'
                console.log("🔧 VendorAuth: Setting default role to 'vendor' because user has vendor record and no role was set");
                try {
                    await prisma.users.update({
                        where: { user_id: user.user_id },
                        data: { role: 'vendor' }
                    });
                    // Update the user object for this request
                    user.role = 'vendor';
                } catch (err) {
                    console.warn("⚠️ VendorAuth: Failed to update user.role:", err.message);
                    // Continue anyway - vendor record exists so access is allowed
                }
            } else {
                // User has a role that's not 'admin' or 'vendor' - don't update, just allow access
                console.log("🔧 VendorAuth: User has role:", user.role, "- not updating, allowing vendor access");
            }
        } else if (user.role === 'admin') {
            // Admin with vendor record - preserve admin role, allow vendor access
            console.log("✅ VendorAuth: Admin user with vendor record - preserving admin role, allowing vendor access");
        } else {
            // User already has 'vendor' role - no update needed
            console.log("✅ VendorAuth: User already has 'vendor' role - no update needed");
        }

        console.log("✅ VendorAuth: Vendor found, vendor_id:", vendor.vendor_id);

        // 7. Attach vendor and user info to request
        req.vendor = vendor;
        req.user = user;
        next();

    } catch (err) {
        console.error("❌ VendorAuth Error:", err.message);
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn.", error: err.message });
        }
        return res.status(500).json({ message: "Lỗi xác thực.", error: err.message });
    }
};