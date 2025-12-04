import React, { useState, useEffect } from 'react';
import { Store, Loader2, Tag, Globe, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { apiGetVendorProfile, apiUpdateVendorProfile } from '../../api/vendorApi';

const ShopSettings = () => {
    const [profile, setProfile] = useState({
        vendorName: '',
        phone: '',
        address: '',
        description: '',
        logoUrl: '',
        bannerUrl: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Hàm tải dữ liệu shop từ server
    const fetchProfile = async () => {
        try {
            const res = await apiGetVendorProfile();
            const data = res.data;
            
            // Map dữ liệu từ API (Backend) vào Form (Frontend)
            // Backend trả về: store_name, logo_url...
            // Note: banner_url không tồn tại trong schema vendors
            setProfile({
                vendorName: data.store_name || data.shopName || '', 
                phone: data.phone || '',
                address: data.address || '',
                description: data.description || '',
                logoUrl: data.logo_url || data.logo || '', 
                bannerUrl: '', // banner_url không tồn tại trong database
            });
        } catch (err) {
            console.error("Error loading profile:", err);
            setMessage({ type: 'error', text: 'Failed to load shop information.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setProfile({
            ...profile,
            [name]: type === 'number' ? Number(value) : value
        });
    };
// frontend/src/components/Vendor/ShopSettings.jsx

// ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        // Validation: 3 fields bắt buộc
        if (!profile.vendorName || profile.vendorName.trim().length === 0) {
            setMessage({ type: 'error', text: 'Please enter shop name' });
            setSaving(false);
            return;
        }
        if (!profile.phone || profile.phone.trim().length === 0) {
            setMessage({ type: 'error', text: 'Please enter phone number' });
            setSaving(false);
            return;
        }
        if (!profile.address || profile.address.trim().length === 0) {
            setMessage({ type: 'error', text: 'Please enter warehouse address' });
            setSaving(false);
            return;
        }

        // Chuẩn bị dữ liệu gửi lên Backend
        // Key ở đây phải khớp với req.body trong vendorController.js
        const payload = {
            shopName: profile.vendorName.trim(), // Bắt buộc
            phone: profile.phone.trim(), // Bắt buộc
            address: profile.address.trim(), // Bắt buộc
        };
        
        // Chỉ thêm các field optional nếu có giá trị hoặc muốn xóa (empty string)
        if (profile.description !== undefined && profile.description !== null) {
            payload.description = profile.description;
        }
        if (profile.logoUrl !== undefined && profile.logoUrl !== null) {
            payload.logo = profile.logoUrl;
        }

        try {
            // Gọi API cập nhật
            await apiUpdateVendorProfile(payload);
            setMessage({ type: 'success', text: 'Information updated successfully!' });
            
            // Load lại dữ liệu để đảm bảo đồng bộ
            await fetchProfile(); 

            // Phát sự kiện để Sidebar cập nhật Avatar/Tên ngay lập tức
            window.dispatchEvent(new Event('vendorProfileUpdated'));

            // Tự động ẩn thông báo sau 3 giây
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            // Hiển thị lỗi chi tiết từ backend nếu có
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setMessage({ type: 'error', text: 'Error: ' + errorMessage });
        } finally {
            setSaving(false);
        }
    };

// ...

    if (loading) return (
        <div className="flex items-center justify-center p-12 h-screen bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
    );

    const MessageIcon = message.type === 'success' ? CheckCircle : AlertTriangle;

    return (
        <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <div className="p-3 bg-green-100 rounded-xl shadow-sm">
                        <Store className="text-green-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Shop Settings</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage display information, images, and shipping</p>
                    </div>
                </div>

                {/* Thông báo */}
                {message.text && (
                    <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm border ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        <MessageIcon size={20} className="shrink-0" />
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cột 1: Thông tin chung */}
                        <div className="lg:col-span-1 space-y-5">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2">
                                <Tag size={18} className="text-green-600"/> Basic Information
                            </h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Shop Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" name="vendorName" required
                                    value={profile.vendorName} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="e.g., Pet Shop Cưng"
                                />
                                <p className="text-xs text-gray-500 mt-1">Required field</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" name="phone" required
                                    value={profile.phone} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="09..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Required field</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Warehouse Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" name="address" required
                                    value={profile.address} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="House number, street, district..."
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
                                        type="text" name="logoUrl" placeholder="https://..."
                                        value={profile.logoUrl} onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                    {profile.logoUrl && (
                                        <div className="mt-3 border p-1 w-fit rounded-lg bg-white shadow-sm">
                                            <img src={profile.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-md" 
                                                onError={(e) => e.target.style.display = 'none'} 
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Banner */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner URL</label>
                                    <input
                                        type="text" name="bannerUrl" placeholder="https://..."
                                        value={profile.bannerUrl} onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                    {profile.bannerUrl && (
                                        <div className="mt-3 border p-1 rounded-lg bg-white shadow-sm">
                                            <img src={profile.bannerUrl} alt="Banner" className="w-full h-16 object-cover rounded-md" 
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
                                    name="description" rows="4"
                                    value={profile.description} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                                    placeholder="Welcome to our shop..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-6 flex justify-end border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={saving || !profile.vendorName.trim() || !profile.phone.trim() || !profile.address.trim()}
                            className="px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:bg-green-300 transition-all shadow-lg shadow-green-200 flex items-center gap-2 active:scale-95 transform"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopSettings;