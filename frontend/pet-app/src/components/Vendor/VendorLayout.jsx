// src/components/Vendor/VendorLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, List, ShoppingCart, Tag, Settings, LogOut } from 'lucide-react';
import { apiGetVendorProfile } from '../../api/vendorApi';

const Sidebar = () => {
    const navigate = useNavigate();

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
            const response = await apiGetVendorProfile();
            // Cập nhật state
            setVendor(response.data);
            // [SỬA 2] Cập nhật luôn vào LocalStorage để lần sau vào lại vẫn nhanh
            localStorage.setItem('vendor', JSON.stringify(response.data));
        } catch (error) {
            console.error("Lỗi lấy thông tin Vendor:", error);
        }
    };

    useEffect(() => {
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
    }, []);

    const handleLogout = () => {
        if (window.confirm('Bạn có muốn đăng xuất?')) {
            localStorage.removeItem('vendorToken');
            localStorage.removeItem('vendor'); // Xóa luôn thông tin lưu tạm
            navigate('/vendor/login');
        }
    };

    // [SỬA 3] Logic hiển thị tên thông minh hơn (check nhiều trường)
    const displayName = vendor?.shopName || vendor?.store_name || vendor?.full_name || vendor?.email || "Vendor";
    const displayInitial = displayName.charAt(0).toUpperCase();
    
    // Ưu tiên logo_url (từ DB) hoặc avatar (từ user) hoặc logo (từ login)
    const logoUrl = vendor?.logo_url || vendor?.avatar || vendor?.logo; 

    const getNavLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
         ${isActive ? 'bg-green-50 text-green-700 font-semibold' : 'font-medium'}`;

    return (
        <div className="w-64 h-screen p-4 bg-white border-r border-gray-100 flex flex-col shadow-sm sticky top-0">

            {/* Header Sidebar */}
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-lg font-semibold text-gray-600">
                            {displayInitial}
                        </span>
                    )}
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
                <NavLink to="/vendor/settings" className={getNavLinkClass}>
                    <Settings size={20} /> Cài đặt Shop
                </NavLink>
                <NavLink to="/vendor/account" className={getNavLinkClass}>
                    <Settings size={20} /> Cài đặt Tài khoản
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