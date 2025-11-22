// src/middleware/roleAuthMiddleware.js

// Hàm factory tạo middleware kiểm tra vai trò cụ thể
export const requireRole = (requiredRole) => {
    return (req, res, next) => {
        // LƯU Ý: Middleware này phải được đặt SAU userAuth 
        // để đảm bảo req.user đã được gắn vào request.

        // 1. Kiểm tra xem thông tin User đã được gắn chưa
        if (!req.user) {
            // Trường hợp userAuth chưa chạy hoặc thất bại
            return res.status(403).json({
                message: "Lỗi nội bộ: Không có thông tin người dùng được xác thực.",
            });
        }

        // 2. Kiểm tra vai trò
        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập chức năng này.",
                required: requiredRole,
                actual: req.user.role
            });
        }

        // 3. Nếu OK, tiếp tục
        next();
    };
};

// Tạo middleware cụ thể cho Admin
export const adminAuth = [
    requireRole("ADMIN") // Thay "ADMIN" bằng giá trị role thực tế trong DB của bạn
];
// (Trong thực tế, nó sẽ được dùng như một mảng: [userAuth, requireRole('ADMIN')])