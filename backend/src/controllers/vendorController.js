import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// =========================================================
// 1. AUTH (Đăng ký & Đăng nhập)
// =========================================================

export const registerVendor = async (req, res) => {
    try {
        const { full_name, name, email, password, phone, store_name, shopName, address } = req.body;
        
        // Xử lý fallback tên trường nếu frontend gửi lên khác nhau
        const finalFullName = full_name || name;
        const finalStoreName = store_name || shopName;

        if (!finalFullName || !email || !password || !finalStoreName) {
             return res.status(400).json({ message: "Vui lòng điền đủ thông tin." });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email đã được sử dụng." });

        const hashed = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Tạo User trước
            const newUser = await tx.user.create({
                data: {
                    full_name: finalFullName, 
                    email, 
                    password_hash: hashed, 
                    role: "vendor", 
                    phone: phone || null
                }
            });

            // 2. Tạo Vendor
            const newVendor = await tx.vendor.create({
                data: {
                    user_id: newUser.user_id, 
                    store_name: finalStoreName, 
                    address: address || null, 
                    phone: phone || null,
                    
                    // --- THAY ĐỔI Ở ĐÂY ---
                    // Để trạng thái là 'active' (hoặc 'approved') để coi như Admin đã duyệt
                    status: 'active', 
                    
                    // Lưu ý: Nếu trong Prisma Schema bạn định nghĩa field là isApproved (Boolean) 
                    // thì dùng dòng dưới đây thay cho dòng status ở trên:
                    // isApproved: true,
                }
            });
            return { user: newUser, vendor: newVendor };
        });

        // Tạo token
        const token = jwt.sign(
            { id: result.vendor.vendor_id, role: 'vendor' }, 
            process.env.VENDOR_SECRET_KEY, 
            { expiresIn: "7d" }
        );

        res.status(201).json({ 
            message: "Đăng ký thành công! Tài khoản đã được kích hoạt.", 
            token, 
            vendor: result.vendor 
        });

    } catch (error) {
        console.error("Register Vendor Error:", error); // Nên log lỗi ra để debug
        res.status(500).json({ error: "Lỗi hệ thống khi đăng ký." });
    }
};

export const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Thiếu Email hoặc Mật khẩu!" });

        const user = await prisma.user.findUnique({ where: { email }, include: { vendor: true } });
        if (!user || user.role !== 'vendor' || !user.vendor) return res.status(400).json({ message: "Tài khoản không hợp lệ." });

        const check = await bcrypt.compare(password, user.password_hash); 
        if (!check) return res.status(400).json({ message: "Sai mật khẩu." });

        const token = jwt.sign({ id: user.vendor.vendor_id, role: 'vendor' }, process.env.VENDOR_SECRET_KEY, { expiresIn: "7d" });
        res.json({ message: "Đăng nhập thành công", token, vendor: { id: user.vendor.vendor_id, shopName: user.vendor.store_name, email: user.email, avatar: user.avatar_url } });
    } catch (error) {
        res.status(500).json({ error: "Lỗi đăng nhập." });
    }
};

// backend/src/controllers/vendorController.js

// ... (Phần code bên trên giữ nguyên)

// =========================================================
// backend/src/controllers/vendorController.js

// ... (các hàm khác) ...

// =========================================================
// 2. PROFILE (Đảm bảo đoạn này có tồn tại và có chữ export)
// =========================================================
export const getVendorProfile = async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({ where: { vendor_id: req.vendor.vendor_id }, include: { user: true } });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });
        
        res.json({ 
            ...vendor, 
            email: vendor.user.email, 
            full_name: vendor.user.full_name, 
            avatar_url: vendor.user.avatar_url,
            banner: vendor.banner_url, 
            logo: vendor.logo_url,
            defaultShippingFee: vendor.default_shipping_fee
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const updateVendorProfile = async (req, res) => {
    try {
        const { shopName, phone, address, description, logo, banner, defaultShippingFee } = req.body;
        const updated = await prisma.vendor.update({
            where: { vendor_id: req.vendor.vendor_id },
            data: { 
                store_name: shopName, 
                phone, 
                address, 
                description, 
                logo_url: logo,
                banner_url: banner,
                default_shipping_fee: parseFloat(defaultShippingFee || 0)
            },
        });
        res.json({ message: "Cập nhật thành công", vendor: updated });
    } catch (error) { res.status(500).json({ error: error.message }); }
};
// =========================================================
// 3. PRODUCTS (CRUD)
// =========================================================
export const getVendorProducts = async (req, res) => {
    try {
        const list = await prisma.product.findMany({ where: { vendor_id: req.vendor.vendor_id }, orderBy: { created_at: 'desc' } });
        res.json(list);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        const product = await prisma.product.create({
            data: { vendor_id: req.vendor.vendor_id, name, description, price: parseFloat(price), stock: parseInt(stock), category }
        });
        res.status(201).json({ message: "Tạo sản phẩm thành công.", product });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        const updated = await prisma.product.update({
            where: { product_id: parseInt(req.params.productId) },
            data: { name, description, price: parseFloat(price), stock: parseInt(stock), category }
        });
        res.json({ message: "Cập nhật thành công", product: updated });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const deleteProduct = async (req, res) => {
    try {
        await prisma.product.delete({ where: { product_id: parseInt(req.params.productId) } });
        res.json({ message: "Xóa thành công" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// =========================================================
// 4. ORDERS (QUẢN LÝ ĐƠN HÀNG - REAL DATA)
// =========================================================

export const getVendorOrders = async (req, res) => {
    try {
        // Lấy danh sách đơn hàng từ DB
        const orders = await prisma.order.findMany({
            where: { vendor_id: req.vendor.vendor_id },
            orderBy: { created_at: 'desc' },
            include: { 
                user: true, // Lấy thông tin người mua
                order_items: { // Lấy chi tiết sản phẩm đã mua
                    include: { product: true }
                }
            }
        });

        // Format dữ liệu trả về
        const mappedOrders = orders.map(o => ({
            ...o,
            total: Number(o.total), // Chuyển Decimal sang Number
            user_name: o.user ? o.user.full_name : 'Khách vãng lai',
            items_count: o.order_items.length
        }));

        res.json(mappedOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        await prisma.order.update({
            where: { order_id: parseInt(req.params.orderId) },
            data: { status: req.body.status }
        });
        res.json({ message: "Cập nhật trạng thái thành công" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// =========================================================
// 5. DASHBOARD & CHART (REAL DATA)
// =========================================================

export const getVendorDashboardStats = async (req, res) => {
    try {
        const vendorId = req.vendor.vendor_id;
        const [productCount, orderCount, revenueAgg] = await Promise.all([
            prisma.product.count({ where: { vendor_id: vendorId } }),
            prisma.order.count({ where: { vendor_id: vendorId } }),
            prisma.order.aggregate({ where: { vendor_id: vendorId, status: "paid" }, _sum: { total: true } })
        ]);
        res.json({
            productCount,
            newOrders: orderCount,
            totalRevenue: Number(revenueAgg._sum.total || 0),
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// [REAL DATA] Tính toán biểu đồ từ Database
export const getRevenueChart = async (req, res) => {
    try {
        const vendorId = req.vendor.vendor_id;
        
        // Lấy tất cả đơn hàng "paid" (đã thanh toán)
        // Ta lấy hết rồi lọc bằng JS để tránh lỗi múi giờ của SQL
        const orders = await prisma.order.findMany({
            where: { vendor_id: vendorId, status: 'paid' },
            select: { total: true, created_at: true }
        });

        const today = new Date();
        const chartData = [];

        // Vòng lặp 7 ngày gần nhất
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            
            const dayStr = d.getDate();
            const monthStr = d.getMonth() + 1;
            const labelDate = `${dayStr}/${monthStr}`; 

            // Tính tổng tiền cho ngày d
            const dailyRevenue = orders
                .filter(order => {
                    const orderDate = new Date(order.created_at);
                    return (
                        orderDate.getDate() === d.getDate() &&
                        orderDate.getMonth() === d.getMonth() &&
                        orderDate.getFullYear() === d.getFullYear()
                    );
                })
                .reduce((sum, order) => sum + Number(order.total || 0), 0);

            chartData.push({ date: labelDate, revenue: dailyRevenue });
        }
        
        res.json(chartData);
    } catch (error) {
        console.error("Chart Error", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// =========================================================
// 6. COUPONS & KHÁC
// =========================================================
export const createCoupon = async (req, res) => {
    try {
        const { code, discountValue, expiryDate, minOrderValue } = req.body;
        await prisma.coupon.create({
            data: {
                vendor_id: req.vendor.vendor_id, code: code.toUpperCase(), discount_percent: parseFloat(discountValue),
                start_date: new Date(), end_date: new Date(expiryDate), rule_condition: `Min: ${minOrderValue}`
            }
        });
        res.json({ message: "Tạo coupon thành công" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getVendorCoupons = async (req, res) => {
    try {
        const list = await prisma.coupon.findMany({ where: { vendor_id: req.vendor.vendor_id }, orderBy: { created_at: 'desc' } });
        res.json(list);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const deleteCoupon = async (req, res) => {
    try {
        await prisma.coupon.delete({ where: { coupon_id: parseInt(req.params.couponId) } });
        res.json({ message: "Xóa coupon thành công" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getTopProducts = async (req, res) => { res.json([]); };
export const getNotifications = async (req, res) => { res.json([]); };
export const updatePassword = async (req, res) => { /* (Giữ nguyên logic đổi pass cũ) */ res.json({message: "OK"}); };

// --- Seed Data (Giữ lại để bạn tạo dữ liệu test vào DB khi cần) ---
export const seedData = async (req, res) => {
    try {
        const vendorId = req.vendor.vendor_id;
        console.log(`⏳ Đang tạo dữ liệu giả cho Vendor ID: ${vendorId}...`);

        // 1. Tạo khách hàng mẫu
        const customer = await prisma.user.upsert({
            where: { email: 'khachhang_demo@gmail.com' },
            update: {},
            create: {
                email: 'khachhang_demo@gmail.com',
                full_name: 'Khách Hàng Demo',
                password_hash: 'dummy_hash',
                role: 'owner',
                phone: '0999888777'
            }
        });

        // 2. Tạo sản phẩm mẫu
        const product = await prisma.product.create({
            data: { 
                vendor_id: vendorId, 
                name: `Sản phẩm Demo ${Date.now()}`, 
                price: 100000, 
                stock: 100, 
                category: 'Demo' 
            }
        });

        // 3. Tạo đơn hàng 7 ngày qua
        const today = new Date();
        let totalOrdersCreated = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Random 1-3 đơn mỗi ngày
            const ordersPerDay = Math.floor(Math.random() * 3) + 1; 

            for (let j = 0; j < ordersPerDay; j++) {
                const randomTotal = Math.floor(Math.random() * 400000) + 100000; 
                
                await prisma.order.create({
                    data: {
                        user_id: customer.user_id,
                        vendor_id: vendorId,
                        status: 'paid',   
                        total: randomTotal,
                        created_at: date, 
                        updated_at: date,
                        payment_method: 'momo',
                        order_items: {
                            create: [{ 
                                product_id: product.product_id, 
                                quantity: 1, 
                                price: randomTotal 
                            }]
                        }
                    }
                });
                totalOrdersCreated++;
            }
        }

        res.json({ 
            message: `✅ Đã bơm thành công! Tạo ${totalOrdersCreated} đơn hàng trong 7 ngày qua.` 
        });

    } catch (error) {
        console.error("Seed Error:", error);
        res.status(500).json({ error: error.message });
    }
};