// src/middleware/roleAuthMiddleware.js

export const requireRole = (allowedRoles) => {
    const requiredRoles = Array.isArray(allowedRoles) 
                          ? allowedRoles.map(role => role.toLowerCase()) 
                          : [allowedRoles.toLowerCase()];
                          
    return (req, res, next) => {
        // Lấy vai trò từ req.user (đã được gắn sau verifyToken/vendorAuth)
        const userPayload = req.user || req.vendor; 

        if (!userPayload || !userPayload.role) {
            // Lỗi Auth thất bại (401)
            return res.status(401).json({
                message: "Không xác thực được vai trò. Vui lòng đăng nhập lại.",
            });
        }
        
        const actualRole = userPayload.role.toLowerCase();

        // 2. Kiểm tra vai trò
        if (!requiredRoles.includes(actualRole)) {
            // 403 Forbidden: Lỗi phân quyền
            return res.status(403).json({
                message: "Bạn không có quyền truy cập chức năng này.",
                required: requiredRoles.join(', '), 
                actual: userPayload.role
            });
        }

        next();
    };
};