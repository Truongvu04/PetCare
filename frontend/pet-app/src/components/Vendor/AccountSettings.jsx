import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, Loader2, Save, Eye, EyeOff } from 'lucide-react';
// Đảm bảo đường dẫn import đúng với cấu trúc dự án của bạn
import { apiGetVendorProfile, apiUpdatePassword } from '../../api/vendorApi'; 

const AccountSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // State cho thông tin cá nhân
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'Vendor', // Mặc định là Vendor
    });

    // State cho đổi mật khẩu
    const [passData, setPassData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

    // State cho thông báo & cài đặt khác
    const [notifications, setNotifications] = useState({
        emailNotif: true,
        pushNotif: true,
        orderUpdates: true
    });

    useEffect(() => {
        fetchAccountInfo();
    }, []);

    const fetchAccountInfo = async () => {
        try {
            setLoading(true);
            const res = await apiGetVendorProfile();
            const data = res.data;
            
            // Xử lý hiển thị role: Lấy từ data hoặc mặc định là Vendor
            // Helper function để viết hoa chữ cái đầu (vendor -> Vendor)
            const displayRole = data.role 
                ? data.role.charAt(0).toUpperCase() + data.role.slice(1) 
                : 'Vendor';

            setProfile({
                fullName: data.full_name || '', 
                email: data.email || '',
                phone: data.phone || '', 
                role: displayRole 
            });
        } catch (err) {
            console.error("Lỗi tải thông tin tài khoản:", err);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý đổi mật khẩu
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            alert("Mật khẩu mới không khớp!");
            return;
        }
        if (passData.newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        setSaving(true);
        try {
            await apiUpdatePassword({
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            // Reset form
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const toggleShowPass = (field) => {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
            <Loader2 className="animate-spin" /> Đang tải thông tin...
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cài đặt Tài khoản</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý thông tin đăng nhập và bảo mật</p>
                </div>

                {/* 1. Thông tin cá nhân (Read-only) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-600" /> Thông tin Cá nhân
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                            <input 
                                type="text" value={profile.fullName} disabled 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Đăng nhập</label>
                            <input 
                                type="text" value={profile.email} disabled 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input 
                                type="text" value={profile.phone} disabled 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 w-fit">
                                <Shield size={16} /> {profile.role}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 italic">* Để thay đổi thông tin cá nhân, vui lòng liên hệ Admin hoặc hỗ trợ viên.</p>
                </div>

                {/* 2. Đổi Mật khẩu */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-red-600" /> Đổi Mật khẩu
                    </h3>
                    <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                        
                        {/* Mật khẩu cũ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                            <div className="relative">
                                <input 
                                    type={showPass.old ? "text" : "password"} 
                                    required
                                    value={passData.oldPassword}
                                    onChange={e => setPassData({...passData, oldPassword: e.target.value})}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none pr-10"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => toggleShowPass('old')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass.old ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        {/* Mật khẩu mới */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <div className="relative">
                                <input 
                                    type={showPass.new ? "text" : "password"} 
                                    required minLength={6}
                                    value={passData.newPassword}
                                    onChange={e => setPassData({...passData, newPassword: e.target.value})}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none pr-10"
                                    placeholder="Tối thiểu 6 ký tự"
                                />
                                <button type="button" onClick={() => toggleShowPass('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass.new ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <input 
                                    type={showPass.confirm ? "text" : "password"} 
                                    required
                                    value={passData.confirmPassword}
                                    onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                                    className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none pr-10 transition-colors
                                        ${passData.confirmPassword && passData.newPassword !== passData.confirmPassword 
                                            ? 'border-red-500 focus:ring-red-200' 
                                            : 'border-gray-300 focus:ring-red-500'}`}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                                <button type="button" onClick={() => toggleShowPass('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass.confirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            {passData.confirmPassword && passData.newPassword !== passData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp!</p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={saving || !passData.oldPassword || !passData.newPassword}
                            className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 font-medium flex items-center gap-2 transition-all"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? 'Đang xử lý...' : 'Lưu Mật Khẩu'}
                        </button>
                    </form>
                </div>

                {/* 3. Cài đặt Thông báo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Bell size={20} className="text-yellow-500" /> Cài đặt Thông báo
                    </h3>
                    <div className="space-y-4 max-w-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Thông báo qua Email</p>
                                <p className="text-xs text-gray-500">Nhận email khi có đơn hàng mới hoặc tin nhắn</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={notifications.emailNotif} onChange={() => setNotifications(p => ({...p, emailNotif: !p.emailNotif}))} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Thông báo trên Trình duyệt</p>
                                <p className="text-xs text-gray-500">Hiển thị popup khi bạn đang mở trang web</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={notifications.pushNotif} onChange={() => setNotifications(p => ({...p, pushNotif: !p.pushNotif}))} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                            </label>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AccountSettings;