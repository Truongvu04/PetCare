import { prisma } from "../config/prisma.js";
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

        const existingUser = await prisma.users.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email đã được sử dụng." });

        const hashed = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Tạo User trước
            const newUser = await tx.users.create({
                data: {
                    full_name: finalFullName, 
                    email, 
                    password_hash: hashed, 
                    role: "vendor", 
                    phone: phone || null
                }
            });

            // 2. Tạo Vendor
            const newVendor = await tx.vendors.create({
                data: {
                    user_id: newUser.user_id, 
                    store_name: finalStoreName, 
                    address: address || null, 
                    phone: phone || null,
                    
                    // --- THAY ĐỔI Ở ĐÂY ---
                    // Để trạng thái là 'approved' để coi như Admin đã duyệt
                    status: 'approved', 
                    
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

        const user = await prisma.users.findUnique({ where: { email }, include: { vendors: true } });
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
        console.log("🔍 getVendorProfile: vendor_id:", req.vendor?.vendor_id);
        const vendor = await prisma.vendors.findUnique({ 
            where: { vendor_id: req.vendor.vendor_id }, 
            include: { users: true } 
        });
        
        if (!vendor) {
            console.error("❌ Vendor not found, vendor_id:", req.vendor.vendor_id);
            return res.status(404).json({ message: "Vendor not found" });
        }
        
        if (!vendor.users) {
            console.error("❌ User relation not found for vendor_id:", req.vendor.vendor_id);
            return res.status(500).json({ message: "User data not found for this vendor" });
        }
        
        console.log("✅ Vendor profile found:", {
            vendor_id: vendor.vendor_id,
            store_name: vendor.store_name,
            user_email: vendor.users?.email
        });
        
        res.json({ 
            ...vendor, 
            email: vendor.users.email, 
            full_name: vendor.users.full_name, 
            avatar_url: vendor.users.avatar_url,
            logo: vendor.logo_url
            // Note: banner_url không tồn tại trong schema vendors
        });
    } catch (error) { 
        console.error("❌ Error in getVendorProfile:", error);
        res.status(500).json({ error: error.message }); 
    }
};

export const updateVendorProfile = async (req, res) => {
    try {
        const { shopName, phone, address, description, logo } = req.body;
        
        // Validate required field
        if (!shopName || shopName.trim() === '') {
            return res.status(400).json({ message: "Tên cửa hàng là bắt buộc" });
        }
        
        // Build update data object - chỉ include các field có giá trị (không phải empty string)
        const updateData = {
            store_name: shopName.trim(),
        };
        
        // Chỉ thêm các field optional nếu có giá trị
        if (phone !== undefined && phone !== null && phone.trim() !== '') {
            updateData.phone = phone.trim();
        } else if (phone === '') {
            updateData.phone = null; // Cho phép xóa phone
        }
        
        if (address !== undefined && address !== null && address.trim() !== '') {
            updateData.address = address.trim();
        } else if (address === '') {
            updateData.address = null; // Cho phép xóa address
        }
        
        if (description !== undefined && description !== null && description.trim() !== '') {
            updateData.description = description.trim();
        } else if (description === '') {
            updateData.description = null; // Cho phép xóa description
        }
        
        if (logo !== undefined && logo !== null && logo.trim() !== '') {
            updateData.logo_url = logo.trim();
        } else if (logo === '') {
            updateData.logo_url = null; // Cho phép xóa logo
        }
        
        const updated = await prisma.vendors.update({
            where: { vendor_id: req.vendor.vendor_id },
            data: updateData,
        });
        
        res.json({ message: "Cập nhật thông tin thành công", vendor: updated });
    } catch (error) { 
        console.error("❌ Error updating vendor profile:", error);
        res.status(500).json({ error: error.message }); 
    }
};
// =========================================================
// 3. PRODUCTS (CRUD)
// =========================================================
export const getVendorProducts = async (req, res) => {
    try {
        const list = await prisma.products.findMany({ 
            where: { vendor_id: req.vendor.vendor_id }, 
            include: { 
                product_images: {
                    orderBy: { is_thumbnail: 'desc' } // Thumbnail first
                }
            },
            orderBy: { created_at: 'desc' } 
        });
        res.json(list);
    } catch (error) { 
        console.error("Error fetching vendor products:", error);
        res.status(500).json({ error: error.message }); 
    }
};

export const createProduct = async (req, res) => {
    try {
        console.log("=== CREATE PRODUCT DEBUG ===");
        console.log("Request body:", req.body);
        console.log("Request body keys:", Object.keys(req.body || {}));
        console.log("Request files:", req.files ? `${req.files.length} files` : "No files");
        console.log("Vendor:", req.vendor ? { vendor_id: req.vendor.vendor_id, store_name: req.vendor.store_name } : "NOT FOUND");
        
        // Check if vendor exists
        if (!req.vendor || !req.vendor.vendor_id) {
            console.error("❌ Vendor not found in request");
            console.error("req.vendor:", req.vendor);
            return res.status(403).json({ message: "Vendor access required" });
        }

        // Parse FormData fields (they come as strings from multipart/form-data)
        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.price;
        const stock = req.body.stock;
        const category = req.body.category;
        const vendor_id = req.vendor.vendor_id;

        console.log("Raw body data:", req.body);
        console.log("Parsed data:", { name, description, price, stock, category, vendor_id });
        console.log("Data types:", {
            name: typeof name,
            price: typeof price,
            stock: typeof stock,
            vendor_id: typeof vendor_id
        });

        // Validate required fields
        if (!name || (typeof name === 'string' && name.trim() === '')) {
            return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
        }
        
        const priceNum = parseFloat(price);
        if (!price || isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({ message: "Giá sản phẩm không hợp lệ" });
        }
        
        const stockNum = parseInt(stock);
        if (stock === undefined || stock === null || isNaN(stockNum) || stockNum < 0) {
            return res.status(400).json({ message: "Số lượng tồn kho không hợp lệ" });
        }

        // Ensure vendor_id is an integer
        const vendorIdInt = parseInt(vendor_id);
        if (isNaN(vendorIdInt) || vendorIdInt <= 0) {
            console.error("❌ Invalid vendor_id:", vendor_id, "type:", typeof vendor_id);
            return res.status(400).json({ message: "Vendor ID không hợp lệ" });
        }
        
        console.log("✅ Validation passed. Vendor ID:", vendorIdInt, "Price:", priceNum, "Stock:", stockNum);

        // Verify vendor exists in database
        const vendorExists = await prisma.vendors.findUnique({
            where: { vendor_id: vendorIdInt }
        });

        if (!vendorExists) {
            console.error("❌ Vendor not found in database, vendor_id:", vendorIdInt);
            return res.status(404).json({ message: "Vendor không tồn tại trong hệ thống" });
        }

        const productData = {
            vendor_id: vendorIdInt,
            name: typeof name === 'string' ? name.trim() : String(name).trim(),
            description: description ? (typeof description === 'string' ? description.trim() : String(description).trim()) : null,
            price: priceNum,
            stock: stockNum,
            category: category ? (typeof category === 'string' ? category.trim() : String(category).trim()) : null,
        };
        
        console.log("Creating product with data:", JSON.stringify(productData, null, 2));
        console.log("Product data types:", {
            vendor_id: typeof productData.vendor_id,
            name: typeof productData.name,
            price: typeof productData.price,
            stock: typeof productData.stock
        });

        // Verify prisma client is available
        if (!prisma || !prisma.products) {
            console.error("❌ Prisma client not available!");
            return res.status(500).json({ message: "Database connection error" });
        }

        // Create product
        console.log("Attempting to create product in database...");
        const product = await prisma.products.create({
            data: productData
        });

        console.log("✅ Product created:", product.product_id);

        // Handle images if uploaded (req.files from multer)
        if (req.files && req.files.length > 0) {
            console.log(`Processing ${req.files.length} images...`);
            const imageData = req.files.map((file, index) => ({
                product_id: product.product_id,
                image_url: `/uploads/${file.filename}`,
                is_thumbnail: index === 0,
            }));

            console.log("Image data to insert:", imageData);

            await prisma.product_images.createMany({
                data: imageData,
            });

            console.log("✅ Images saved to database");
        }

        // Fetch product with images
        const createdProduct = await prisma.products.findUnique({
            where: { product_id: product.product_id },
            include: { product_images: true },
        });

        console.log("✅ Product fetch complete");
        res.status(201).json({ message: "Tạo sản phẩm thành công.", product: createdProduct });
    } catch (error) { 
        console.error("❌ Error creating product:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error meta:", error.meta);
        console.error("Full error:", error);
        
        // Handle Prisma errors
        if (error.code === "P2003") {
            return res.status(400).json({ 
                message: "Lỗi ràng buộc dữ liệu. Vendor không hợp lệ.",
                error: error.meta 
            });
        }
        
        if (error.code === "P2002") {
            return res.status(400).json({ 
                message: "Sản phẩm đã tồn tại.",
                error: error.meta 
            });
        }
        
        // Log full error details for debugging
        console.error("❌ Full error stack:", error.stack);
        console.error("❌ Error cause:", error.cause);
        
        // Return detailed error in development, generic in production
        const errorResponse = {
            error: error.message || "Lỗi hệ thống khi tạo sản phẩm",
            ...(process.env.NODE_ENV === 'development' && {
                details: error.stack,
                name: error.name,
                code: error.code,
                meta: error.meta
            })
        };
        
        res.status(500).json(errorResponse); 
    }
};

export const updateProduct = async (req, res) => {
    console.log("🚀 updateProduct function CALLED!");
    console.log("=== UPDATE PRODUCT DEBUG ===");
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);
    console.log("Request params:", req.params);
    console.log("Request query:", req.query);
    console.log("Request query keys:", Object.keys(req.query || {}));
    console.log("Request body:", req.body);
    console.log("Request body keys:", Object.keys(req.body || {}));
    console.log("Request files:", req.files ? `${req.files.length} files` : "No files");
    console.log("Product ID from params:", req.params.productId);
    
    try {
        
        const { name, description, price, stock, category } = req.body;
        const productId = parseInt(req.params.productId);
        
        // Parse deleted image IDs - check query params first, then body
        let deletedImageIds = [];
        
        // Try query params first (more reliable with multer)
        if (req.query.deletedImageIds) {
            console.log("🔍 Found deletedImageIds in query params:", req.query.deletedImageIds);
            const idsString = req.query.deletedImageIds;
            deletedImageIds = idsString.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            console.log("✅ Parsed deletedImageIds from query:", deletedImageIds);
        }
        // Fallback to body (FormData)
        else if (req.body.deletedImageIds) {
            console.log("🔍 Raw deletedImageIds from body:", req.body.deletedImageIds);
            console.log("🔍 Type of deletedImageIds:", typeof req.body.deletedImageIds);
            console.log("🔍 Is array?", Array.isArray(req.body.deletedImageIds));
            
            try {
                if (Array.isArray(req.body.deletedImageIds)) {
                    // Already an array from multer parsing 'deletedImageIds[]'
                    deletedImageIds = req.body.deletedImageIds.map(id => parseInt(id)).filter(id => !isNaN(id));
                } else if (typeof req.body.deletedImageIds === 'string') {
                    // Try parsing as JSON string or comma-separated
                    try {
                        deletedImageIds = JSON.parse(req.body.deletedImageIds);
                    } catch (e) {
                        // If not JSON, try comma-separated
                        deletedImageIds = req.body.deletedImageIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                    }
                } else {
                    // Single value
                    const parsed = parseInt(req.body.deletedImageIds);
                    if (!isNaN(parsed)) {
                        deletedImageIds = [parsed];
                    }
                }
                console.log("✅ Parsed deletedImageIds from body:", deletedImageIds);
            } catch (e) {
                console.error("❌ Failed to parse deletedImageIds:", e);
                console.error("❌ Error details:", e.message, e.stack);
            }
        } else {
            console.log("ℹ️ No deletedImageIds in query params or request body");
        }

        // Parse existing image IDs from FormData (to keep them)
        let existingImageIds = [];
        if (req.body.existingImageIds) {
            try {
                existingImageIds = typeof req.body.existingImageIds === 'string'
                    ? JSON.parse(req.body.existingImageIds)
                    : req.body.existingImageIds;
            } catch (e) {
                console.warn("⚠️ Failed to parse existingImageIds:", e);
            }
        }

        console.log("📝 Updating product:", {
            productId,
            deletedImageIds,
            deletedImageIdsLength: deletedImageIds?.length || 0,
            existingImageIds,
            newImagesCount: req.files?.length || 0
        });

        // Delete images that were removed - DO THIS FIRST before updating product
        if (deletedImageIds && Array.isArray(deletedImageIds) && deletedImageIds.length > 0) {
            // Ensure all IDs are integers
            const imageIdsToDelete = deletedImageIds.map(id => parseInt(id)).filter(id => !isNaN(id));
            console.log("🗑️ Attempting to delete images with IDs:", imageIdsToDelete);
            console.log("🗑️ Product ID:", productId);
            
            if (imageIdsToDelete.length > 0) {
                // First, verify these images exist and belong to this product
                // NOTE: Schema uses 'id' not 'image_id'
                const imagesToDelete = await prisma.product_images.findMany({
                    where: {
                        id: { in: imageIdsToDelete },
                        product_id: productId
                    }
                });
                
                console.log("🔍 Found images to delete:", imagesToDelete.length, "out of", imageIdsToDelete.length);
                if (imagesToDelete.length > 0) {
                    console.log("🔍 Images details:", imagesToDelete.map(img => ({ id: img.id, url: img.image_url, product_id: img.product_id })));
                } else {
                    // Check if images exist but belong to different product
                    const allImagesWithIds = await prisma.product_images.findMany({
                        where: {
                            id: { in: imageIdsToDelete }
                        }
                    });
                    console.log("🔍 Images with these IDs exist but belong to different products:", allImagesWithIds.map(img => ({ id: img.id, product_id: img.product_id })));
                }
                
                if (imagesToDelete.length > 0) {
                    // Use transaction to ensure atomicity
                    await prisma.$transaction(async (tx) => {
                        const deleteResult = await tx.product_images.deleteMany({
                            where: {
                                id: { in: imageIdsToDelete },
                                product_id: productId
                            }
                        });
                        console.log("✅ Successfully deleted", deleteResult.count, "images from database");
                        
                        // Verify deletion immediately within transaction
                        const verifyImages = await tx.product_images.findMany({
                            where: {
                                id: { in: imageIdsToDelete },
                                product_id: productId
                            }
                        });
                        console.log("🔍 Verification (within transaction): Remaining images with deleted IDs for this product:", verifyImages.length);
                        if (verifyImages.length > 0) {
                            console.error("❌ ERROR: Some images were NOT deleted:", verifyImages.map(img => ({ id: img.id, url: img.image_url })));
                            throw new Error(`Failed to delete images: ${verifyImages.map(img => img.id).join(', ')}`);
                        } else {
                            console.log("✅ Verification passed: All images deleted successfully");
                        }
                    });
                    
                    // Verify again after transaction commits
                    const verifyAfterCommit = await prisma.product_images.findMany({
                        where: {
                            id: { in: imageIdsToDelete },
                            product_id: productId
                        }
                    });
                    console.log("🔍 Verification (after commit): Remaining images:", verifyAfterCommit.length);
                    if (verifyAfterCommit.length > 0) {
                        console.error("❌ CRITICAL ERROR: Images still exist after transaction commit:", verifyAfterCommit.map(img => ({ id: img.id })));
                    }
                } else {
                    console.warn("⚠️ No images found to delete (may have been already deleted or IDs don't match)");
                }
            } else {
                console.warn("⚠️ No valid image IDs to delete after parsing");
            }
        } else {
            console.log("ℹ️ No images to delete (deletedImageIds is empty or invalid)");
        }

        // Update product
        const updated = await prisma.products.update({
            where: { product_id: productId },
            data: { 
                name, 
                description: description || null, 
                price: parseFloat(price), 
                stock: parseInt(stock), 
                category: category || null 
            }
        });

        // Get current images to check if we need to set a new thumbnail
        const currentImages = await prisma.product_images.findMany({
            where: { product_id: productId }
        });

        // Handle new images if uploaded
        if (req.files && req.files.length > 0) {
            // Check if we need to set thumbnail (if no images exist after deletion)
            const needsThumbnail = currentImages.length === 0;
            
            const imageData = req.files.map((file, index) => ({
                product_id: updated.product_id,
                image_url: `/uploads/${file.filename}`,
                is_thumbnail: index === 0 && needsThumbnail, // Set first new image as thumbnail if no images exist
            }));

            await prisma.product_images.createMany({
                data: imageData,
            });
            console.log("✅ Added new images:", imageData.length);
        }

        // Fetch updated product with images AFTER deletion
        // Use a fresh query to avoid any caching issues
        const updatedProduct = await prisma.products.findUnique({
            where: { product_id: updated.product_id },
            include: { 
                product_images: {
                    orderBy: { is_thumbnail: 'desc' }
                }
            },
        });

        console.log("✅ Product updated successfully");
        console.log("📸 Final product images count:", updatedProduct.product_images?.length || 0);
        console.log("📸 Final product images IDs:", updatedProduct.product_images?.map(img => img.id) || []);
        
        // Verify that deleted images are actually gone
        if (deletedImageIds && deletedImageIds.length > 0) {
            const remainingDeletedIds = updatedProduct.product_images
                ?.filter(img => deletedImageIds.includes(img.id))
                .map(img => img.id) || [];
            
            if (remainingDeletedIds.length > 0) {
                console.error("❌ ERROR: Deleted image IDs still present in response:", remainingDeletedIds);
                console.error("❌ This should not happen! Checking database directly...");
                
                // Double-check by querying database directly
                const directCheck = await prisma.product_images.findMany({
                    where: {
                        id: { in: remainingDeletedIds },
                        product_id: productId
                    }
                });
                console.error("❌ Direct database check - Images still exist:", directCheck.map(img => ({ id: img.id, url: img.image_url })));
                
                // Remove deleted images from response manually
                updatedProduct.product_images = updatedProduct.product_images.filter(
                    img => !deletedImageIds.includes(img.id)
                );
                console.log("🔧 Manually removed deleted images from response");
                console.log("📸 Corrected product images IDs:", updatedProduct.product_images.map(img => img.id));
            } else {
                console.log("✅ Verification: All deleted images are gone from response");
            }
        }
        
        res.json({ message: "Cập nhật thành công", product: updatedProduct });
    } catch (error) { 
        console.error("❌ Error updating product:", error);
        res.status(500).json({ error: error.message }); 
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await prisma.products.delete({ where: { product_id: parseInt(req.params.productId) } });
        res.json({ message: "Xóa thành công" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// =========================================================
// 4. ORDERS (QUẢN LÝ ĐƠN HÀNG - REAL DATA)
// =========================================================

export const getVendorOrders = async (req, res) => {
    try {
        console.log("🔍 getVendorOrders: vendor_id:", req.vendor?.vendor_id);
        
        // Lấy danh sách đơn hàng từ DB
        // Note: Prisma model name is 'orders' (plural) based on schema
        const orders = await prisma.orders.findMany({
            where: { vendor_id: req.vendor.vendor_id },
            orderBy: { created_at: 'desc' },
            include: { 
                users: true, // Lấy thông tin người mua (relation name is 'users' in schema)
                order_items: { // Lấy chi tiết sản phẩm đã mua
                    include: { 
                        products: {
                            include: {
                                product_images: true // Lấy tất cả ảnh để frontend tự chọn thumbnail hoặc ảnh đầu tiên
                            }
                        }
                    }
                }
            }
        });

        console.log("✅ Found orders:", orders.length);

        // Format dữ liệu trả về
        const mappedOrders = orders.map(o => ({
            ...o,
            total: Number(o.total), // Chuyển Decimal sang Number
            user_name: o.users ? o.users.full_name : 'Khách vãng lai',
            items_count: o.order_items.length
        }));

        res.json(mappedOrders);
    } catch (error) {
        console.error("❌ Error in getVendorOrders:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        await prisma.orders.update({
            where: { order_id: parseInt(req.params.orderId) },
            data: { status: req.body.status }
        });
        res.json({ message: "Cập nhật trạng thái thành công" });
    } catch (error) { 
        console.error("❌ Error in updateOrderStatus:", error);
        res.status(500).json({ error: error.message }); 
    }
};

// =========================================================
// 5. DASHBOARD & CHART (REAL DATA)
// =========================================================

export const getVendorDashboardStats = async (req, res) => {
    try {
        const vendorId = req.vendor.vendor_id;
        console.log("🔍 getVendorDashboardStats: vendor_id:", vendorId, "type:", typeof vendorId);
        
        // Debug: Check if products exist for this vendor
        const allProducts = await prisma.products.findMany({
            where: { vendor_id: vendorId },
            select: { product_id: true, name: true, vendor_id: true }
        });
        console.log("🔍 All products for vendor_id", vendorId, ":", allProducts.length, "products");
        if (allProducts.length > 0) {
            console.log("📦 Sample products:", allProducts.slice(0, 3).map(p => ({ id: p.product_id, name: p.name, vendor_id: p.vendor_id })));
        }
        
        // First, let's check all orders and their statuses for debugging
        const allOrders = await prisma.orders.findMany({
            where: { vendor_id: vendorId },
            select: { order_id: true, status: true, total: true }
        });
        console.log("🔍 All orders for vendor:", allOrders.map(o => ({ 
            id: o.order_id, 
            status: o.status, 
            total: Number(o.total) 
        })));
        
        // Check orders with specific statuses
        const paidOrders = allOrders.filter(o => o.status === 'paid');
        const deliveredOrders = allOrders.filter(o => o.status === 'delivered');
        const shippedOrders = allOrders.filter(o => o.status === 'shipped');
        
        console.log("📊 Orders by status:", {
            paid: paidOrders.length,
            delivered: deliveredOrders.length,
            shipped: shippedOrders.length,
            total: allOrders.length
        });
        
        const [productCount, orderCount, revenueAgg] = await Promise.all([
            prisma.products.count({ where: { vendor_id: vendorId } }),
            prisma.orders.count({ where: { vendor_id: vendorId } }),
            // Calculate revenue from orders that are paid OR delivered (completed orders)
            prisma.orders.aggregate({ 
                where: { 
                    vendor_id: vendorId, 
                    status: { in: ["paid", "delivered"] } // Include both paid and delivered orders
                }, 
                _sum: { total: true } 
            })
        ]);
        
        // Also calculate manually to verify
        const manualRevenue = allOrders
            .filter(o => o.status === 'paid' || o.status === 'delivered')
            .reduce((sum, o) => sum + Number(o.total || 0), 0);
        
        console.log("✅ Dashboard stats:", {
            productCount,
            orderCount,
            totalRevenue: Number(revenueAgg._sum.total || 0),
            manualRevenue: manualRevenue,
            revenueFromStatuses: "paid, delivered",
            paidOrdersCount: paidOrders.length,
            deliveredOrdersCount: deliveredOrders.length,
            paidOrdersTotal: paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
            deliveredOrdersTotal: deliveredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
        });
        
        res.json({
            productCount,
            newOrders: orderCount,
            totalRevenue: Number(revenueAgg._sum.total || 0),
        });
    } catch (error) { 
        console.error("❌ Error in getVendorDashboardStats:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: error.message }); 
    }
};

// [REAL DATA] Tính toán biểu đồ từ Database
export const getRevenueChart = async (req, res) => {
    try {
        const vendorId = req.vendor.vendor_id;
        
        // Lấy tất cả đơn hàng "paid" hoặc "delivered" (đã thanh toán hoặc đã giao thành công)
        // Ta lấy hết rồi lọc bằng JS để tránh lỗi múi giờ của SQL
        const orders = await prisma.orders.findMany({
            where: { 
                vendor_id: vendorId, 
                status: { in: ['paid', 'delivered'] } // Include both paid and delivered orders
            },
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
        console.log("🔍 createCoupon: vendor_id:", req.vendor?.vendor_id);
        console.log("🔍 Request body:", req.body);
        
        const { code, discountValue, expiryDate, minOrderValue } = req.body;
        
        // Validate required fields
        if (!code || !discountValue || !expiryDate) {
            return res.status(400).json({ 
                message: "Vui lòng điền đủ thông tin: code, discountValue, expiryDate" 
            });
        }
        
        // Validate code format
        if (typeof code !== 'string' || code.trim().length === 0) {
            return res.status(400).json({ message: "Mã coupon không hợp lệ" });
        }
        
        // Validate discount value
        const discountNum = parseFloat(discountValue);
        if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
            return res.status(400).json({ message: "Giá trị giảm giá phải từ 1 đến 100%" });
        }
        
        // Validate expiry date
        const expiryDateObj = new Date(expiryDate);
        if (isNaN(expiryDateObj.getTime())) {
            return res.status(400).json({ message: "Ngày hết hạn không hợp lệ" });
        }
        
        if (expiryDateObj < new Date()) {
            return res.status(400).json({ message: "Ngày hết hạn phải sau ngày hiện tại" });
        }
        
        const couponData = {
            vendor_id: req.vendor.vendor_id,
            code: code.toUpperCase().trim(),
            discount_percent: discountNum,
            start_date: new Date(),
            end_date: expiryDateObj,
            rule_condition: minOrderValue ? `Min: ${minOrderValue}` : null
        };
        
        console.log("✅ Creating coupon with data:", couponData);
        
        // Note: Prisma model name is 'coupons' (plural) based on schema
        const coupon = await prisma.coupons.create({
            data: couponData
        });
        
        console.log("✅ Coupon created successfully:", coupon.coupon_id);
        res.json({ message: "Tạo coupon thành công", coupon });
    } catch (error) { 
        console.error("❌ Error in createCoupon:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error meta:", error.meta);
        
        // Handle Prisma unique constraint violation (duplicate code)
        if (error.code === 'P2002') {
            return res.status(400).json({ 
                message: "Mã coupon đã tồn tại. Vui lòng chọn mã khác.",
                error: error.meta 
            });
        }
        
        // Handle Prisma foreign key constraint violation
        if (error.code === 'P2003') {
            return res.status(400).json({ 
                message: "Vendor không hợp lệ.",
                error: error.meta 
            });
        }
        
        res.status(500).json({ 
            error: error.message || "Lỗi hệ thống khi tạo coupon",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }); 
    }
};

export const getVendorCoupons = async (req, res) => {
    try {
        console.log("🔍 getVendorCoupons: vendor_id:", req.vendor?.vendor_id);
        // Note: Prisma model name is 'coupons' (plural) based on schema
        const list = await prisma.coupons.findMany({ 
            where: { vendor_id: req.vendor.vendor_id }, 
            orderBy: { created_at: 'desc' } 
        });
        console.log("✅ Found coupons:", list.length);
        res.json(list);
    } catch (error) { 
        console.error("❌ Error in getVendorCoupons:", error);
        res.status(500).json({ error: error.message }); 
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const couponId = parseInt(req.params.couponId);
        console.log("🔍 deleteCoupon: coupon_id:", couponId, "vendor_id:", req.vendor?.vendor_id);
        
        if (isNaN(couponId)) {
            return res.status(400).json({ message: "Coupon ID không hợp lệ" });
        }
        
        // Verify coupon belongs to this vendor before deleting
        const coupon = await prisma.coupons.findUnique({
            where: { coupon_id: couponId }
        });
        
        if (!coupon) {
            return res.status(404).json({ message: "Coupon không tồn tại" });
        }
        
        if (coupon.vendor_id !== req.vendor.vendor_id) {
            return res.status(403).json({ message: "Bạn không có quyền xóa coupon này" });
        }
        
        // Note: Prisma model name is 'coupons' (plural) based on schema
        await prisma.coupons.delete({ 
            where: { coupon_id: couponId } 
        });
        
        console.log("✅ Coupon deleted successfully:", couponId);
        res.json({ message: "Xóa coupon thành công" });
    } catch (error) { 
        console.error("❌ Error in deleteCoupon:", error);
        res.status(500).json({ error: error.message }); 
    }
};

export const getTopProducts = async (req, res) => { res.json([]); };

export const getNotifications = async (req, res) => {
    try {
        const vendorId = req.vendor.vendor_id;
        
        // Get recent orders (last 30 days) for this vendor
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get orders that were created OR updated in the last 30 days
        // This ensures we catch status changes (like delivered) even if order was created earlier
        const recentOrders = await prisma.orders.findMany({
            where: {
                vendor_id: vendorId,
                OR: [
                    {
                        created_at: {
                            gte: thirtyDaysAgo
                        }
                    },
                    {
                        updated_at: {
                            gte: thirtyDaysAgo
                        }
                    }
                ]
            },
            include: {
                users: {
                    select: {
                        full_name: true,
                        email: true
                    }
                }
            },
            orderBy: [
                {
                    updated_at: 'desc' // Sort by updated_at first (most recent status changes first)
                },
                {
                    created_at: 'desc' // Then by created_at
                }
            ],
            take: 50 // Limit to 50 most recent orders
        });
        
        const notifications = [];
        
        // Process orders to create notifications
        // Only create ONE notification per order (prioritize most recent status)
        recentOrders.forEach(order => {
            const customerName = order.users?.full_name || order.users?.email || 'Khách hàng';
            
            // Determine which date to use for sorting and timeAgo
            // For delivered orders, use updated_at (when customer confirmed receipt)
            // For other orders, use created_at (when order was created)
            let notificationDate;
            if (order.status === 'delivered' && order.updated_at) {
                notificationDate = new Date(order.updated_at);
            } else {
                notificationDate = new Date(order.created_at);
            }
            
            const timeAgo = getTimeAgo(notificationDate);
            
            // Priority: delivered > shipped > cancelled > paid > pending
            // Only create notification for the most relevant status
            
            // Delivered order notification (highest priority - customer confirmed receipt)
            if (order.status === 'delivered') {
                notifications.push({
                    id: `order-delivered-${order.order_id}`,
                    type: 'order_delivered',
                    title: 'Đơn hàng đã giao thành công',
                    message: `Đơn hàng #${order.order_id} từ ${customerName} đã được khách hàng xác nhận nhận - ${formatCurrency(order.total)}`,
                    orderId: order.order_id,
                    status: order.status,
                    amount: Number(order.total),
                    createdAt: order.updated_at || order.created_at,
                    timeAgo: timeAgo,
                    icon: 'check-circle',
                    color: 'green'
                });
            }
            // Shipped order notification
            else if (order.status === 'shipped') {
                notifications.push({
                    id: `order-shipped-${order.order_id}`,
                    type: 'status_update',
                    title: 'Đơn hàng đã được gửi',
                    message: `Đơn hàng #${order.order_id} từ ${customerName} đã được gửi đi - ${formatCurrency(order.total)}`,
                    orderId: order.order_id,
                    status: order.status,
                    amount: Number(order.total),
                    createdAt: order.updated_at || order.created_at,
                    timeAgo: timeAgo,
                    icon: 'truck',
                    color: 'blue'
                });
            }
            // Cancelled order notification
            else if (order.status === 'cancelled') {
                notifications.push({
                    id: `order-cancelled-${order.order_id}`,
                    type: 'status_update',
                    title: 'Đơn hàng đã bị hủy',
                    message: `Đơn hàng #${order.order_id} từ ${customerName} đã bị hủy`,
                    orderId: order.order_id,
                    status: order.status,
                    amount: Number(order.total),
                    createdAt: order.updated_at || order.created_at,
                    timeAgo: timeAgo,
                    icon: 'x-circle',
                    color: 'red'
                });
            }
            // New order notification (pending or paid status)
            else if (order.status === 'pending' || order.status === 'paid') {
                notifications.push({
                    id: `order-new-${order.order_id}`,
                    type: 'new_order',
                    title: 'Đơn hàng mới',
                    message: `Đơn hàng #${order.order_id} từ ${customerName} - ${formatCurrency(order.total)}`,
                    orderId: order.order_id,
                    status: order.status,
                    amount: Number(order.total),
                    createdAt: order.created_at,
                    timeAgo: timeAgo,
                    icon: 'shopping-cart',
                    color: 'blue'
                });
            }
        });
        
        // Sort by creation/update date (newest first)
        // Use updated_at for delivered orders, created_at for others
        notifications.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA; // Newest first
        });
        
        // Limit to 10 most recent notifications (only show latest)
        const limitedNotifications = notifications.slice(0, 10);
        
        console.log(`✅ Returning ${limitedNotifications.length} notifications for vendor ${vendorId}`);
        
        res.json(limitedNotifications);
    } catch (error) {
        console.error("❌ Error in getNotifications:", error);
        res.status(500).json({ error: error.message });
    }
};

// Helper function to format currency
const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount || 0);
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(numericAmount);
};

// Helper function to get time ago string
const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Vừa xong';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} tuần trước`;
    }
    
    return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};
export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user_id = req.user.user_id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
        }

        // Get user from database
        const user = await prisma.users.findUnique({
            where: { user_id }
        });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Verify old password
        if (!user.password_hash) {
            return res.status(400).json({ message: "Tài khoản này chưa có mật khẩu. Vui lòng đặt mật khẩu qua chức năng quên mật khẩu." });
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isOldPasswordValid) {
            return res.status(401).json({ message: "Mật khẩu cũ không đúng" });
        }

        // Hash new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        console.log("🔍 Updating password for user_id:", user_id);
        console.log("🔍 Old password_hash (first 20 chars):", user.password_hash?.substring(0, 20));
        console.log("🔍 New password_hash (first 20 chars):", newPasswordHash.substring(0, 20));

        // Update password
        const updatedUser = await prisma.users.update({
            where: { user_id },
            data: { password_hash: newPasswordHash },
            select: { user_id: true, email: true, password_hash: true } // Select để verify
        });

        console.log("✅ Password updated successfully for user_id:", user_id);
        console.log("✅ Updated password_hash (first 20 chars):", updatedUser.password_hash?.substring(0, 20));
        
        // Verify the update was successful by querying again
        const verifyUser = await prisma.users.findUnique({
            where: { user_id },
            select: { password_hash: true }
        });

        if (!verifyUser || !verifyUser.password_hash) {
            console.error("❌ CRITICAL: Password was not found after update!");
            return res.status(500).json({ message: "Lỗi: Mật khẩu không được cập nhật trong database. Vui lòng thử lại." });
        }

        if (verifyUser.password_hash === user.password_hash) {
            console.error("❌ CRITICAL: Password hash unchanged after update!");
            console.error("❌ Old hash:", user.password_hash?.substring(0, 30));
            console.error("❌ New hash:", verifyUser.password_hash?.substring(0, 30));
            return res.status(500).json({ message: "Lỗi: Mật khẩu không được cập nhật trong database. Vui lòng thử lại." });
        }

        // Verify new password works
        const isNewPasswordValid = await bcrypt.compare(newPassword, verifyUser.password_hash);
        if (!isNewPasswordValid) {
            console.error("❌ CRITICAL: New password hash doesn't match! This should never happen.");
            return res.status(500).json({ message: "Lỗi: Mật khẩu mới không hợp lệ. Vui lòng thử lại." });
        }

        console.log("✅ Password update verified successfully!");
        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error("❌ Error updating password:", error);
        res.status(500).json({ error: error.message || "Lỗi hệ thống khi đổi mật khẩu" });
    }
};

// --- Seed Data (Giữ lại để bạn tạo dữ liệu test vào DB khi cần) ---
// Get all vendors (public endpoint for user browsing)
export const getAllVendors = async (req, res) => {
    try {
        const { search, location, category } = req.query;
        
        const where = {
            status: 'approved' // Only show approved vendors
        };

        // Add search filter if provided
        if (search) {
            where.OR = [
                { store_name: { contains: search } },
                { description: { contains: search } }
            ];
        }

        // Add location filter if provided
        if (location) {
            where.address = { contains: location };
        }

        const vendors = await prisma.vendors.findMany({
            where,
            include: {
                users: {
                    select: {
                        user_id: true,
                        full_name: true,
                        email: true,
                        avatar_url: true
                    }
                },
                products: {
                    select: {
                        product_id: true,
                        name: true,
                        price: true,
                        category: true
                    },
                    take: 5 // Limit products for preview
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Calculate average rating (if reviews exist)
        const vendorsWithRating = await Promise.all(
            vendors.map(async (vendor) => {
                const products = await prisma.products.findMany({
                    where: { vendor_id: vendor.vendor_id },
                    include: {
                        reviews: {
                            select: {
                                rating: true
                            }
                        }
                    }
                });

                let totalRating = 0;
                let reviewCount = 0;
                products.forEach(product => {
                    product.reviews.forEach(review => {
                        totalRating += review.rating;
                        reviewCount++;
                    });
                });

                const avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

                return {
                    ...vendor,
                    rating: parseFloat(avgRating),
                    reviewCount
                };
            })
        );

        res.json(vendorsWithRating);
    } catch (error) {
        console.error("Get All Vendors Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const seedData = async (req, res) => {
    try {
        const vendorId = req.vendor.vendor_id;
        console.log(`⏳ Đang tạo dữ liệu giả cho Vendor ID: ${vendorId}...`);

        // 1. Tạo khách hàng mẫu
        const customer = await prisma.users.upsert({
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
        const product = await prisma.products.create({
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
                
                await prisma.orders.create({
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