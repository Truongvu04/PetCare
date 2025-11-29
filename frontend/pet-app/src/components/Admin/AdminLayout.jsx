// src/components/Admin/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Users, Tag, LogOut, Store, Shield } from 'lucide-react';
import { getAvatarUrl } from '../../utils/avatarHelper';
import { performCompleteLogout } from '../../utils/logoutHelper';
import { useAuth } from '../../hooks/useAuth';
import { showConfirm } from '../../utils/notifications';

const Sidebar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

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

    const displayName = user?.full_name || user?.email || "Admin";
    const displayInitial = displayName.charAt(0).toUpperCase();
    const avatarUrl = getAvatarUrl(user);

    const getNavLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
         ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'font-medium'}`;

    return (
        <div className="w-64 h-screen p-4 bg-white border-r border-gray-100 flex flex-col shadow-sm sticky top-0">
            {/* Header Sidebar */}
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center overflow-hidden border border-blue-300 shrink-0 relative">
                    <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                            if (fallback) fallback.style.display = 'flex';
                        }}
                    />
                    <span className="avatar-fallback text-lg font-semibold text-blue-600 absolute inset-0 items-center justify-center" style={{ display: avatarUrl && avatarUrl.includes('dicebear') ? 'flex' : 'none' }}>
                        {displayInitial}
                    </span>
                </div>
                <div className="overflow-hidden">
                    <h2 className="font-bold text-gray-800 truncate text-sm" title={displayName}>
                        {displayName}
                    </h2>
                    <p className="text-xs text-gray-500">Admin Account</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow space-y-1">
                <NavLink to="/admin/dashboard" className={getNavLinkClass}>
                    <Home size={20} /> Dashboard
                </NavLink>
                <NavLink to="/admin/vendors" className={getNavLinkClass}>
                    <Users size={20} /> Danh sách Vendors
                </NavLink>
                <NavLink to="/admin/coupons" className={getNavLinkClass}>
                    <Tag size={20} /> Coupons
                </NavLink>
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-100 space-y-1">
                {/* Show Vendor Management if admin has vendor data */}
                {user?.vendor && (
                    <button
                        onClick={() => navigate("/vendor/dashboard")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                    >
                        <Store size={20} /> Vendor Management
                    </button>
                )}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                    <Home size={20} /> Về trang chủ
                </button>
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

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 h-screen p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;


