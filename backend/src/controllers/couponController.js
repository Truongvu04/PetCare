import prisma from "../config/prisma.js";

export const validateCoupon = async (req, res) => {
    try {
        const { code, vendor_id } = req.body;

        const coupon = await prisma.coupon.findUnique({
            where: { code },
        });

        if (!coupon) return res.status(404).json({ message: "Coupon không tồn tại" });

        if (coupon.vendor_id !== vendor_id)
            return res.status(400).json({ message: "Coupon không thuộc vendor này" });

        const now = new Date();
        if (coupon.start_date > now || coupon.end_date < now)
            return res.status(400).json({ message: "Coupon đã hết hạn" });

        res.json({ valid: true, coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
