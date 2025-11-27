// src/components/Vendor/VendorLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, List, ShoppingCart, Tag, Settings, LogOut, Store, Shield } from 'lucide-react';
import { apiGetVendorProfile } from '../../api/vendorApi';
import { getAvatarUrl } from '../../utils/avatarHelper';
import { performCompleteLogout } from '../../utils/logoutHelper';
import { useAuth } from '../../hooks/useAuth';
import { showConfirm } from '../../utils/notifications';

const Sidebar = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // [SỬA 1] Khởi tạo state bằng dữ liệu từ LocalStorage (nếu có)
    // Giúp hiển thị tên Shop NGAY LẬP TỨC, không cần chờ API
    const [vendor, setVendor] = useState(() => {
        const stored = localStorage.getItem('vendor');
        try {
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    });

    // Hàm lấy thông tin profile mới nhất từ Server
    const fetchProfile = async () => {
        try {
            // Add a small delay to ensure token is fully validated after login
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const response = await apiGetVendorProfile();
            // Cập nhật state
            setVendor(response.data);
            // [SỬA 2] Cập nhật luôn vào LocalStorage để lần sau vào lại vẫn nhanh
            localStorage.setItem('vendor', JSON.stringify(response.data));
        } catch (error) {
            console.error("Lỗi lấy thông tin Vendor:", error);
            const status = error.response?.status;
            const message = error.response?.data?.message || '';
            
            // Don't logout here - just log the error
            // If it's a real auth issue, the interceptor will handle it after retry
            if (status === 401) {
                console.warn("⚠️ Unauthorized - token may be expired or not yet validated");
                // Don't clear vendor data from localStorage - might be temporary
            } else if (status === 403) {
                console.warn("⚠️ Forbidden - user may not have vendor role:", message);
            }
        }
    };

    useEffect(() => {
        // Wait for auth to finish loading before making API calls
        if (authLoading) {
            return;
        }

        // Check if user is authenticated and has vendor access
        // Allow access if:
        // 1. User has vendor role, OR
        // 2. User has admin role AND has vendor record (admin can access vendor dashboard)
        const hasVendorAccess = user && (
            user.role === 'vendor' || 
            (user.role === 'admin' && (user.vendor || localStorage.getItem('vendor')))
        );
        
        if (!user || !hasVendorAccess) {
            console.warn("⚠️ VendorLayout: User not authenticated or doesn't have vendor access. User:", user?.email, "Role:", user?.role, "Has vendor:", !!user?.vendor);
            return;
        }

        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("⚠️ VendorLayout: No token found");
            return;
        }

        // 1. Gọi API để lấy dữ liệu mới nhất (trong background)
        fetchProfile();

        // 2. Lắng nghe sự kiện update từ trang Settings
        const handleProfileUpdate = () => {
            fetchProfile();
        };

        window.addEventListener('vendorProfileUpdated', handleProfileUpdate);
        return () => {
            window.removeEventListener('vendorProfileUpdated', handleProfileUpdate);
        };
    }, [authLoading, user]);

    const handleLogout = async () => {
        const result = await showConfirm(
            'Đăng xuất',
            'Bạn có muốn đăng xuất khỏi hệ thống?',
            'Đăng xuất',
            'Hủy'
        );
        if (result.isConfirmed) {
            performCompleteLogout();
        }
    };

    // [SỬA 3] Logic hiển thị tên thông minh hơn (check nhiều trường)
    const displayName = vendor?.shopName || vendor?.store_name || vendor?.full_name || vendor?.email || "Vendor";
    const displayInitial = displayName.charAt(0).toUpperCase();
    
    // Use consistent avatar helper
    const logoUrl = getAvatarUrl(vendor, vendor, 40); 

    const getNavLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
         ${isActive ? 'bg-green-50 text-green-700 font-semibold' : 'font-medium'}`;

    return (
        <div className="w-64 h-screen p-4 bg-white border-r border-gray-100 flex flex-col shadow-sm sticky top-0">

            {/* Header Sidebar */}
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 shrink-0 relative">
                    <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                            if (fallback) fallback.style.display = 'flex';
                        }}
                    />
                    <span className="avatar-fallback text-lg font-semibold text-gray-600 absolute inset-0 items-center justify-center" style={{ display: logoUrl && logoUrl.includes('dicebear') ? 'flex' : 'none' }}>
                        {displayInitial}
                    </span>
                </div>
                <div className="overflow-hidden">
                    <h2 className="font-bold text-gray-800 truncate text-sm" title={displayName}>
                        {displayName}
                    </h2>
                    <p className="text-xs text-gray-500">Vendor Account</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow space-y-1">
                <NavLink to="/vendor/dashboard" className={getNavLinkClass}>
                    <Home size={20} /> Dashboard
                </NavLink>
                <NavLink to="/vendor/products" className={getNavLinkClass}>
                    <List size={20} /> Listings (Sản phẩm)
                </NavLink>
                <NavLink to="/vendor/orders" className={getNavLinkClass}>
                    <ShoppingCart size={20} /> Orders
                </NavLink>
                <NavLink to="/vendor/coupons" className={getNavLinkClass}>
                    <Tag size={20} /> Coupons
                </NavLink>
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-100 space-y-1">
                {/* Show Admin Management if user has admin role */}
                {user?.role === 'admin' && (
                    <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                    >
                        <Shield size={20} /> Admin Management
                    </button>
                )}
                <button
                    onClick={() => navigate("/")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                    <Store size={20} /> Về trang chủ
                </button>
                <NavLink to="/vendor/settings" className={getNavLinkClass}>
                    <Settings size={20} /> Cài đặt Shop
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                    <LogOut size={20} /> Đăng xuất
                </button>
            </div>
        </div>
    );
};

const VendorLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 h-screen p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default VendorLayout;