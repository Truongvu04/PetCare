import { prisma } from "../config/prisma.js";

export const validateCoupon = async (req, res) => {
    try {
        const { code, vendor_id } = req.body;
        
        console.log("🔍 validateCoupon: code:", code, "vendor_id:", vendor_id);

        if (!code || typeof code !== 'string' || code.trim().length === 0) {
            return res.status(400).json({ message: "Mã coupon không hợp lệ" });
        }

        const coupon = await prisma.coupons.findUnique({
            where: { code: code.toUpperCase().trim() },
        });

        if (!coupon) {
            console.log("❌ Coupon not found:", code);
            return res.status(404).json({ message: "Coupon không tồn tại" });
        }

        console.log("✅ Coupon found:", {
            coupon_id: coupon.coupon_id,
            code: coupon.code,
            vendor_id: coupon.vendor_id,
            vendor_id_type: typeof coupon.vendor_id,
            discount_percent: coupon.discount_percent,
            discount_amount: coupon.discount_amount
        });
        
        console.log("🔍 Comparing vendor_ids:", {
            coupon_vendor_id: coupon.vendor_id,
            coupon_vendor_id_type: typeof coupon.vendor_id,
            request_vendor_id: vendor_id,
            request_vendor_id_type: typeof vendor_id,
            parsed_vendor_id: vendor_id !== null && vendor_id !== undefined ? parseInt(vendor_id) : null
        });

        // Check vendor match: if coupon has vendor_id, it must match (unless vendor_id is null in request)
        if (coupon.vendor_id !== null && coupon.vendor_id !== undefined) {
            // Coupon is vendor-specific
            if (vendor_id === null || vendor_id === undefined) {
                console.log("❌ Vendor ID mismatch: coupon requires vendor_id but request doesn't have one");
                return res.status(400).json({ message: "Coupon này chỉ áp dụng cho sản phẩm của vendor cụ thể" });
            }
            
            // Convert both to integers for comparison
            const couponVendorId = parseInt(coupon.vendor_id);
            const requestVendorId = parseInt(vendor_id);
            
            console.log("🔍 Comparing:", {
                couponVendorId,
                requestVendorId,
                areEqual: couponVendorId === requestVendorId
            });
            
            if (couponVendorId !== requestVendorId) {
                console.log("❌ Vendor ID mismatch:", {
                    coupon_vendor_id: couponVendorId,
                    request_vendor_id: requestVendorId
                });
                return res.status(400).json({ message: "Coupon không thuộc vendor này" });
            }
            
            console.log("✅ Vendor IDs match!");
        }
        // If coupon.vendor_id is null, it's an admin coupon and can be used for any vendor

        const now = new Date();
        if (coupon.start_date && new Date(coupon.start_date) > now) {
            return res.status(400).json({ message: "Coupon chưa có hiệu lực" });
        }
        if (coupon.end_date && new Date(coupon.end_date) < now) {
            return res.status(400).json({ message: "Coupon đã hết hạn" });
        }

        console.log("✅ Coupon is valid");
        res.json({ valid: true, coupon });
    } catch (error) {
        console.error("❌ Error in validateCoupon:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get user's available coupons
export const getUserCoupons = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const now = new Date();

        // Get all available coupons (vendor-specific and admin coupons)
        const allCoupons = await prisma.coupons.findMany({
            where: {
                OR: [
                    { vendor_id: null }, // Admin coupons
                    { vendors: { status: 'approved' } } // Vendor coupons from approved vendors
                ],
                AND: [
                    {
                        OR: [
                            { start_date: null },
                            { start_date: { lte: now } }
                        ]
                    },
                    {
                        OR: [
                            { end_date: null },
                            { end_date: { gte: now } }
                        ]
                    }
                ]
            },
            include: {
                vendors: {
                    select: {
                        vendor_id: true,
                        store_name: true
                    }
                },
                coupon_usages: {
                    where: {
                        orders: {
                            user_id: user_id
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Categorize coupons
        const available = [];
        const used = [];
        const expired = [];

        allCoupons.forEach(coupon => {
            const couponEndDate = coupon.end_date ? new Date(coupon.end_date) : null;
            const isExpired = couponEndDate && couponEndDate < now;
            const isUsed = coupon.coupon_usages.length > 0;

            const couponData = {
                coupon_id: coupon.coupon_id,
                code: coupon.code,
                discount_percent: coupon.discount_percent,
                discount_amount: coupon.discount_amount,
                rule_condition: coupon.rule_condition,
                start_date: coupon.start_date,
                end_date: coupon.end_date,
                vendor: coupon.vendors ? {
                    vendor_id: coupon.vendors.vendor_id,
                    store_name: coupon.vendors.store_name
                } : null
            };

            // Priority: expired > used > available
            if (isExpired) {
                expired.push(couponData);
            } else if (isUsed) {
                used.push(couponData);
            } else {
                available.push(couponData);
            }
        });

        res.json({
            available,
            used,
            expired
        });
    } catch (error) {
        console.error("Error fetching user coupons:", error);
        res.status(500).json({ error: error.message });
    }
};

// Admin: Get all coupons
export const getAllCouponsAdmin = async (req, res) => {
    try {
        const coupons = await prisma.coupons.findMany({
            include: {
                vendors: {
                    select: {
                        vendor_id: true,
                        store_name: true
                    }
                },
                coupon_usages: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Add usage count
        const couponsWithUsage = coupons.map(coupon => ({
            ...coupon,
            usage_count: coupon.coupon_usages.length
        }));

        res.json(couponsWithUsage);
    } catch (error) {
        console.error("Error fetching all coupons:", error);
        res.status(500).json({ error: error.message });
    }
};

// Admin: Create coupon
export const createCouponAdmin = async (req, res) => {
    try {
        const {
            code,
            discount_percent,
            discount_amount,
            rule_condition,
            start_date,
            end_date,
            vendor_id
        } = req.body;

        // Validate: must have either discount_percent or discount_amount
        if (!discount_percent && !discount_amount) {
            return res.status(400).json({ error: "Must provide either discount_percent or discount_amount" });
        }

        // Check if code already exists
        const existing = await prisma.coupons.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return res.status(400).json({ error: "Coupon code already exists" });
        }

        const coupon = await prisma.coupons.create({
            data: {
                code: code.toUpperCase(),
                discount_percent: discount_percent || null,
                discount_amount: discount_amount || null,
                rule_condition: rule_condition || null,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null,
                vendor_id: vendor_id || null
            },
            include: {
                vendors: {
                    select: {
                        vendor_id: true,
                        store_name: true
                    }
                }
            }
        });

        res.status(201).json(coupon);
    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update coupon
export const updateCouponAdmin = async (req, res) => {
    try {
        const { couponId } = req.params;
        const {
            discount_percent,
            discount_amount,
            rule_condition,
            start_date,
            end_date,
            vendor_id
        } = req.body;

        // Check if coupon exists
        const existing = await prisma.coupons.findUnique({
            where: { coupon_id: parseInt(couponId) }
        });

        if (!existing) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        const coupon = await prisma.coupons.update({
            where: { coupon_id: parseInt(couponId) },
            data: {
                discount_percent: discount_percent !== undefined ? discount_percent : existing.discount_percent,
                discount_amount: discount_amount !== undefined ? discount_amount : existing.discount_amount,
                rule_condition: rule_condition !== undefined ? rule_condition : existing.rule_condition,
                start_date: start_date !== undefined ? (start_date ? new Date(start_date) : null) : existing.start_date,
                end_date: end_date !== undefined ? (end_date ? new Date(end_date) : null) : existing.end_date,
                vendor_id: vendor_id !== undefined ? vendor_id : existing.vendor_id
            },
            include: {
                vendors: {
                    select: {
                        vendor_id: true,
                        store_name: true
                    }
                }
            }
        });

        res.json(coupon);
    } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).json({ error: error.message });
    }
};

// Admin: Delete coupon
export const deleteCouponAdmin = async (req, res) => {
    try {
        const { couponId } = req.params;

        // Check if coupon exists
        const existing = await prisma.coupons.findUnique({
            where: { coupon_id: parseInt(couponId) }
        });

        if (!existing) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        await prisma.coupons.delete({
            where: { coupon_id: parseInt(couponId) }
        });

        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).json({ error: error.message });
    }
};
