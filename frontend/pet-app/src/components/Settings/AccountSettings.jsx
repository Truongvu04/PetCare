import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, Loader2, Save, Eye, EyeOff, Home, ArrowLeft, Store, CheckCircle, AlertCircle, Tag, Globe } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { apiGetVendorProfile, apiUpdatePassword, apiRequestVendorAccount } from '../../api/vendorApi';
import { showSuccess, showError, showWarning } from '../../utils/notifications';
import api from '../../api/axiosConfig.js'; 

const AccountSettings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // State cho thông tin cá nhân
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: '',
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

    // State cho đăng ký vendor
    const [vendorRequest, setVendorRequest] = useState({
        store_name: '',
        phone: '',
        address: '',
        logo_url: '',
        banner_url: '',
        description: ''
    });
    const [vendorStatus, setVendorStatus] = useState(null); // 'pending', 'approved', 'rejected', null
    const [hasVendorRecord, setHasVendorRecord] = useState(false); // Track xem user có vendor record không
    const [submittingVendor, setSubmittingVendor] = useState(false);

    // Check if user is vendor - CHỈ dựa vào role từ users table, không check vendors table
    // Điều này đảm bảo khi admin downgrade user từ vendor về owner, role sẽ đúng
    const isVendor = user?.role === 'vendor';
    
    // Logic hiển thị form đăng ký vendor:
    // - Nếu không phải vendor (role !== 'vendor')
    // - VÀ (không phải admin HOẶC admin nhưng chưa có vendor record)
    const shouldShowVendorForm = !isVendor && (user?.role !== 'admin' || !hasVendorRecord);

    useEffect(() => {
        if (user) {
            fetchAccountInfo();
            fetchNotificationPreferences();
            checkVendorStatus();
            
            // Nếu user object có vendor data từ auth context, set hasVendorRecord
            // Điều này giúp check nhanh mà không cần đợi API call
            if (user.vendor) {
                setHasVendorRecord(true);
            }
        }
    }, [user]);

    const checkVendorStatus = async () => {
        try {
            // Kiểm tra xem user có vendor record không
            // Sử dụng vendorApi thay vì axiosConfig để có đúng endpoint
            const res = await apiGetVendorProfile();
            if (res.data) {
                const status = res.data.status;
                setVendorStatus(status);
                setHasVendorRecord(true); // User có vendor record
                if (status === 'pending') {
                    setVendorRequest({
                        store_name: res.data.store_name || '',
                        phone: res.data.phone || '',
                        address: res.data.address || '',
                        logo_url: res.data.logo_url || '',
                        banner_url: '', // banner_url không tồn tại trong schema
                        description: res.data.description || ''
                    });
                }
            }
        } catch (err) {
            // User chưa có vendor record hoặc chưa đăng ký
            if (err.response?.status === 404 || err.response?.status === 403) {
                // 404/403 = không có vendor record
                setHasVendorRecord(false);
                setVendorStatus(null);
            } else {
                console.error("Lỗi kiểm tra vendor status:", err);
                // Nếu lỗi khác, giữ nguyên state hiện tại
            }
        }
    };

    const fetchNotificationPreferences = async () => {
        try {
            const res = await api.get('/notification-settings');
            if (res.data) {
                setNotifications({
                    emailNotif: res.data.new_products_services !== false,
                    pushNotif: res.data.platform_updates !== false,
                    orderUpdates: res.data.appointment_reminders !== false
                });
            }
        } catch (err) {
            console.error("Lỗi tải notification preferences:", err);
        }
    };

    const handleNotificationChange = async (field, value) => {
        const newNotifications = { ...notifications, [field]: value };
        setNotifications(newNotifications);
        
        try {
            await api.put('/notification-settings', {
                new_products_services: newNotifications.emailNotif,
                platform_updates: newNotifications.pushNotif,
                appointment_reminders: newNotifications.orderUpdates
            });
            showSuccess("Success", "Notification settings updated");
        } catch (err) {
            setNotifications(notifications);
            console.error("Error updating notification preferences:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to update notification settings";
            showError("Error", errorMessage);
        }
    };

    const fetchAccountInfo = async () => {
        try {
            setLoading(true);
            
            // LUÔN dùng role từ users table làm nguồn chính xác
            // Không dùng vendor API để lấy role vì có thể không sync với users.role
            const displayRole = user?.role 
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1) 
                : 'Customer';

            if (isVendor) {
                // Nếu là vendor, có thể lấy thêm thông tin từ vendor API nhưng role vẫn từ users table
                try {
                    const res = await apiGetVendorProfile();
                    const data = res.data;
                    setProfile({
                        fullName: data.full_name || user?.full_name || '',
                        email: data.email || user?.email || '',
                        phone: data.phone || user?.phone || '',
                        role: displayRole // LUÔN dùng role từ users table
                    });
                } catch (vendorErr) {
                    // Nếu không lấy được vendor profile, fallback về user info
                    setProfile({
                        fullName: user?.full_name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        role: displayRole
                    });
                }
            } else {
                // Use user info from auth context
                setProfile({
                    fullName: user?.full_name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    role: displayRole
                });
            }
        } catch (err) {
            console.error("Error loading account information:", err);
            // Fallback to user from context
            if (user) {
                setProfile({
                    fullName: user.full_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            showWarning("Error", "New passwords do not match!");
            return;
        }
        if (passData.newPassword.length < 6) {
            showWarning("Error", "New password must be at least 6 characters.");
            return;
        }

        setSaving(true);
        try {
            if (isVendor) {
                // Use vendor API for password update
                await apiUpdatePassword({
                    oldPassword: passData.oldPassword,
                    newPassword: passData.newPassword
                });
            } else {
                // Use regular user API for password update
                await api.put('/auth/change-password', {
                    oldPassword: passData.oldPassword,
                    newPassword: passData.newPassword
                });
            }
            showSuccess("Success", "Password changed successfully! Please login again.");
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showError("Error", err.response?.data?.message || err.message || "Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const toggleShowPass = (field) => {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleVendorRequest = async (e) => {
        e.preventDefault();
        
        // Validation: 3 fields bắt buộc
        if (!vendorRequest.store_name || vendorRequest.store_name.trim().length === 0) {
            showWarning("Error", "Please enter shop name");
            return;
        }
        if (!vendorRequest.phone || vendorRequest.phone.trim().length === 0) {
            showWarning("Error", "Please enter phone number");
            return;
        }
        if (!vendorRequest.address || vendorRequest.address.trim().length === 0) {
            showWarning("Error", "Please enter warehouse address");
            return;
        }

        setSubmittingVendor(true);
        try {
            await apiRequestVendorAccount({
                store_name: vendorRequest.store_name.trim(),
                phone: vendorRequest.phone.trim(),
                address: vendorRequest.address.trim(),
                logo_url: vendorRequest.logo_url?.trim() || null,
                description: vendorRequest.description?.trim() || null
            });
            showSuccess("Success", "Vendor registration successful! Your request is pending admin approval.");
            setVendorStatus('pending');
            setHasVendorRecord(true); // Đã có vendor record sau khi đăng ký thành công
            setVendorRequest({ 
                store_name: '', 
                phone: '', 
                address: '', 
                logo_url: '', 
                banner_url: '', 
                description: '' 
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to register as vendor";
            
            // Check if user already has vendor data - show helpful message instead of error
            if (errorMessage.includes("đã có") || 
                errorMessage.includes("already") || 
                errorMessage.includes("vendor record") ||
                errorMessage.includes("đã là vendor")) {
                showWarning(
                    "Vendor Account Exists", 
                    "You already have a vendor account. If you need assistance, please contact the administrator for help."
                );
            } else {
                showError("Error", errorMessage);
            }
        } finally {
            setSubmittingVendor(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
            <Loader2 className="animate-spin" /> Loading information...
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800"
                            title="Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage login information and security</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                    >
                        <Home size={18} />
                        <span>Back to Home</span>
                    </button>
                </div>

                {/* 1. Thông tin cá nhân (Read-only) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-600" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text" value={profile.fullName} disabled 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Login Email</label>
                            <input 
                                type="text" value={profile.email} disabled 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input 
                                type="text" value={profile.phone || 'Not updated'} disabled 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 w-fit">
                                <Shield size={16} /> {profile.role}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 italic">* To change personal information, please contact Admin or support staff.</p>
                </div>

                {/* 2. Đổi Mật khẩu */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-red-600" /> Change Password
                    </h3>
                    <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                        
                        {/* Mật khẩu cũ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <input 
                                    type={showPass.new ? "text" : "password"} 
                                    required minLength={6}
                                    value={passData.newPassword}
                                    onChange={e => setPassData({...passData, newPassword: e.target.value})}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none pr-10"
                                    placeholder="Minimum 6 characters"
                                />
                                <button type="button" onClick={() => toggleShowPass('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass.new ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
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
                                    placeholder="Re-enter new password"
                                />
                                <button type="button" onClick={() => toggleShowPass('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass.confirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            {passData.confirmPassword && passData.newPassword !== passData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match!</p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={saving || !passData.oldPassword || !passData.newPassword}
                            className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 font-medium flex items-center gap-2 transition-all"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? 'Processing...' : 'Save Password'}
                        </button>
                    </form>
                </div>

                {/* 3. Cài đặt Thông báo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Bell size={20} className="text-yellow-500" /> Notification Settings
                    </h3>
                    <div className="space-y-4 max-w-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Email Notifications</p>
                                <p className="text-xs text-gray-500">Receive emails when there are new orders or messages</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={notifications.emailNotif} 
                                    onChange={() => handleNotificationChange('emailNotif', !notifications.emailNotif)} 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Browser Notifications</p>
                                <p className="text-xs text-gray-500">Show popup when you have the website open</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={notifications.pushNotif} 
                                    onChange={() => handleNotificationChange('pushNotif', !notifications.pushNotif)} 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 4. Đăng ký làm Vendor (hiển thị nếu: không phải vendor VÀ (không phải admin HOẶC admin nhưng chưa có vendor record)) */}
                {shouldShowVendorForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Store size={20} className="text-green-600" /> Register as Vendor
                        </h3>
                        
                        {vendorStatus === 'pending' && (
                            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-medium text-yellow-800">Request Pending Approval</p>
                                    <p className="text-sm text-yellow-700 mt-1">Your vendor registration request is pending admin approval. Please wait a moment.</p>
                                </div>
                            </div>
                        )}

                        {vendorStatus === 'rejected' && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-medium text-red-800">Request Rejected</p>
                                    <p className="text-sm text-red-700 mt-1">Your vendor registration request has been rejected. You can register again with new information.</p>
                                </div>
                            </div>
                        )}

                        {vendorStatus !== 'pending' && (
                            <form onSubmit={handleVendorRequest} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Cột 1: Thông tin Cơ bản */}
                                    <div className="lg:col-span-1 space-y-5">
                                        <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2">
                                            <Tag size={18} className="text-green-600"/> Basic Information
                                        </h3>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Shop Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={vendorRequest.store_name}
                                                onChange={(e) => setVendorRequest({...vendorRequest, store_name: e.target.value})}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                                placeholder="e.g., Pet Shop"
                                                disabled={submittingVendor}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Required field</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={vendorRequest.phone}
                                                onChange={(e) => setVendorRequest({...vendorRequest, phone: e.target.value})}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                                placeholder="09..."
                                                disabled={submittingVendor}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Required field</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Warehouse Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={vendorRequest.address}
                                                onChange={(e) => setVendorRequest({...vendorRequest, address: e.target.value})}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                                placeholder="House number, street, district..."
                                                disabled={submittingVendor}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Required field</p>
                                        </div>
                                    </div>

                                    {/* Cột 2: Hình ảnh & Mô tả */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2">
                                            <Globe size={18} className="text-green-600"/> Images & Description
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {/* Logo */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://..."
                                                    value={vendorRequest.logo_url}
                                                    onChange={(e) => setVendorRequest({...vendorRequest, logo_url: e.target.value})}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                                    disabled={submittingVendor}
                                                />
                                                {vendorRequest.logo_url && (
                                                    <div className="mt-3 border p-1 w-fit rounded-lg bg-white shadow-sm">
                                                        <img 
                                                            src={vendorRequest.logo_url} 
                                                            alt="Logo" 
                                                            className="w-16 h-16 object-cover rounded-md" 
                                                            onError={(e) => e.target.style.display = 'none'} 
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Banner */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner URL</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://..."
                                                    value={vendorRequest.banner_url}
                                                    onChange={(e) => setVendorRequest({...vendorRequest, banner_url: e.target.value})}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                                    disabled={submittingVendor}
                                                />
                                                {vendorRequest.banner_url && (
                                                    <div className="mt-3 border p-1 rounded-lg bg-white shadow-sm">
                                                        <img 
                                                            src={vendorRequest.banner_url} 
                                                            alt="Banner" 
                                                            className="w-full h-16 object-cover rounded-md" 
                                                            onError={(e) => e.target.style.display = 'none'} 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mô tả */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Introduction</label>
                                            <textarea
                                                rows="4"
                                                value={vendorRequest.description}
                                                onChange={(e) => setVendorRequest({...vendorRequest, description: e.target.value})}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                                                placeholder="Welcome to our store..."
                                                disabled={submittingVendor}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="pt-6 flex justify-end border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={submittingVendor || !vendorRequest.store_name.trim() || !vendorRequest.phone.trim() || !vendorRequest.address.trim()}
                                        className="px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:bg-green-300 transition-all shadow-lg shadow-green-200 flex items-center gap-2 active:scale-95 transform"
                                    >
                                        {submittingVendor ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Store size={20} />
                                                Submit Registration Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AccountSettings;

