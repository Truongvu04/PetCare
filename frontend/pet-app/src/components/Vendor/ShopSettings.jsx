import React, { useState, useEffect } from 'react';
import { Store, Loader2, Tag, Globe, Package, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { apiGetVendorProfile, apiUpdateVendorProfile } from '../../api/vendorApi';

const ShopSettings = () => {
    const [profile, setProfile] = useState({
        vendorName: '',
        phone: '',
        address: '',
        description: '',
        logoUrl: '',
        bannerUrl: '',
        defaultShippingFee: 0,
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
            // Backend trả về: store_name, logo_url, banner_url, default_shipping_fee...
            setProfile({
                vendorName: data.store_name || data.shopName || '', 
                phone: data.phone || '',
                address: data.address || '',
                description: data.description || '',
                logoUrl: data.logo_url || data.logo || '', 
                bannerUrl: data.banner_url || data.banner || '', 
                defaultShippingFee: data.default_shipping_fee || data.defaultShippingFee || 0,
            });
        } catch (err) {
            console.error("Lỗi tải profile:", err);
            setMessage({ type: 'error', text: 'Không thể tải thông tin shop.' });
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

        // Chuẩn bị dữ liệu gửi lên Backend
        // Key ở đây phải khớp với req.body trong vendorController.js
        const payload = {
            shopName: profile.vendorName,
            phone: profile.phone,
            address: profile.address,
            description: profile.description,
            logo: profile.logoUrl,
            banner: profile.bannerUrl,
            defaultShippingFee: profile.defaultShippingFee,
        };

        try {
            // Gọi API cập nhật
            await apiUpdateVendorProfile(payload);
            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            
            // Load lại dữ liệu để đảm bảo đồng bộ
            await fetchProfile(); 

            // Phát sự kiện để Sidebar cập nhật Avatar/Tên ngay lập tức
            window.dispatchEvent(new Event('vendorProfileUpdated'));

            // Tự động ẩn thông báo sau 3 giây
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            // Hiển thị lỗi chi tiết từ backend nếu có
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setMessage({ type: 'error', text: 'Lỗi: ' + errorMessage });
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
                        <h1 className="text-2xl font-bold text-gray-800">Cài đặt Cửa hàng</h1>
                        <p className="text-sm text-gray-500 mt-1">Quản lý thông tin hiển thị, hình ảnh và vận chuyển</p>
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
                                <Tag size={18} className="text-green-600"/> Thông tin Cơ bản
                            </h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên Cửa Hàng</label>
                                <input
                                    type="text" name="vendorName" required
                                    value={profile.vendorName} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="VD: Pet Shop Cưng"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                                <input
                                    type="text" name="phone"
                                    value={profile.phone} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="09..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ kho</label>
                                <input
                                    type="text" name="address"
                                    value={profile.address} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="Số nhà, đường, quận..."
                                />
                            </div>
                        </div>

                        {/* Cột 2: Hình ảnh & Mô tả */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-2">
                                <Globe size={18} className="text-green-600"/> Hình ảnh & Mô tả
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Giới thiệu cửa hàng</label>
                                <textarea
                                    name="description" rows="4"
                                    value={profile.description} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                                    placeholder="Chào mừng đến với cửa hàng của chúng tôi..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vận chuyển */}
                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
                            <Package size={18} className="text-green-600"/> Cài đặt Vận chuyển
                        </h3>
                        <div className="max-w-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phí vận chuyển mặc định (VNĐ)</label>
                            <div className="relative">
                                <input
                                    type="number" name="defaultShippingFee" min="0" step="1000"
                                    value={profile.defaultShippingFee} onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all font-medium text-green-700 bg-gray-50 focus:bg-white pl-4 pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">VNĐ</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5 italic">Phí này sẽ áp dụng cho các đơn hàng chưa đạt điều kiện miễn phí ship.</p>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-6 flex justify-end border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:bg-green-400 transition-all shadow-lg shadow-green-200 flex items-center gap-2 active:scale-95 transform"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopSettings;