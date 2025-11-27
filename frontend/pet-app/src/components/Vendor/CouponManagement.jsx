import React, { useState, useEffect } from 'react';
import { Trash2, Tag, Search, Plus, Edit, X, Save, Loader2, Calendar, DollarSign, Percent } from 'lucide-react';
// ✅ 1. SỬ DỤNG API THẬT
import { 
    apiGetVendorCoupons, 
    apiCreateCoupon, 
    // Lưu ý: Backend hiện tại chưa có apiUpdateCoupon, ta sẽ dùng logic Xóa -> Tạo mới hoặc bổ sung sau
    apiDeleteCoupon 
} from '../../api/vendorApi';
import { showSuccess, showError, showConfirm } from '../../utils/notifications'; 

// Hàm format tiền tệ
const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- Modal Component ---
const CouponModal = ({ coupon, onClose, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        code: coupon?.code || '',
        discountType: coupon?.discount_percent ? 'PERCENTAGE' : 'FIXED', // Tự động detect loại dựa trên dữ liệu
        discountValue: coupon?.discount_percent || 0,
        minOrderValue: 0, // Backend hiện tại lưu rule_condition dạng string "Min: ...", cần xử lý tách chuỗi nếu muốn hiện lại
        expiryDate: coupon?.end_date ? new Date(coupon.end_date).toISOString().split('T')[0] : '',
    });

    // Khi mở modal, nếu là sửa thì load dữ liệu vào
    useEffect(() => {
        if (coupon) {
            // Xử lý tách số tiền từ rule_condition "Min: 100000"
            let minVal = 0;
            if (coupon.rule_condition && coupon.rule_condition.includes("Min:")) {
                minVal = parseInt(coupon.rule_condition.split(":")[1].trim());
            }

            setFormData({
                code: coupon.code,
                discountType: coupon.discount_percent ? 'PERCENTAGE' : 'FIXED', // Tạm thời backend chỉ hỗ trợ % qua discount_percent
                discountValue: coupon.discount_percent || 0,
                minOrderValue: minVal,
                expiryDate: coupon.end_date ? new Date(coupon.end_date).toISOString().split('T')[0] : '',
            });
        }
    }, [coupon]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'discountValue' || name === 'minOrderValue') ? Number(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">{coupon ? 'Chi tiết Mã Giảm Giá' : 'Tạo Mã Mới'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã Coupon (Code)</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text" name="code" required
                                placeholder="VD: SUMMER2025"
                                value={formData.code} onChange={handleChange}
                                className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none uppercase font-bold tracking-wide"
                                disabled={!!coupon} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                            <select
                                name="discountType" value={formData.discountType} onChange={handleChange}
                                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                            >
                                <option value="PERCENTAGE">Phần trăm (%)</option>
                                {/* Backend hiện tại ưu tiên % (discount_percent), nên Fixed tạm thời chưa hỗ trợ sâu */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="number" name="discountValue" required min="0" max="100"
                                    value={formData.discountValue} onChange={handleChange}
                                    className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu (VNĐ)</label>
                            <input
                                type="number" name="minOrderValue" min="0"
                                value={formData.minOrderValue} onChange={handleChange}
                                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date" name="expiryDate" required
                                value={formData.expiryDate} onChange={handleChange}
                                className="w-full pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            disabled={isSaving}
                        >
                            Hủy
                        </button>
                        {/* Chỉ hiện nút Lưu khi tạo mới, vì backend chưa có API update coupon hoàn chỉnh */}
                        {!coupon && (
                            <button
                                type="submit"
                                className="px-5 py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 shadow-md shadow-green-200 transition-colors"
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {isSaving ? 'Đang lưu...' : 'Tạo mới'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---
const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [modalData, setModalData] = useState({ show: false, coupon: null });
    const [saving, setSaving] = useState(false);

    // Hàm lấy dữ liệu thật
    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const res = await apiGetVendorCoupons();
            setCoupons(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi tải coupons:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleSave = async (data) => {
        setSaving(true);
        try {
            // Backend chỉ có API create, chưa có update nên ta chỉ xử lý create
            await apiCreateCoupon(data);
            await fetchCoupons();
            setModalData({ show: false, coupon: null });
            showSuccess("Thành công", "Tạo mã giảm giá thành công!");
        } catch (err) {
            showError("Lỗi", err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await showConfirm("Xóa mã giảm giá", "Bạn có chắc chắn muốn xóa mã giảm giá này?");
        if (!result.isConfirmed) return;
        try {
            // Gọi API xóa thật (dựa vào coupon_id)
            await apiDeleteCoupon(id);
            setCoupons(prev => prev.filter(c => c.coupon_id !== id)); // Lưu ý: Database dùng coupon_id
            showSuccess("Thành công", "Đã xóa mã giảm giá thành công!");
        } catch (err) {
            showError("Lỗi", "Không thể xóa: " + err.message);
        }
    };

    const getStatus = (coupon) => {
        const now = new Date();
        const expiry = new Date(coupon.end_date); // DB dùng end_date
        const isExpired = expiry < now;
        if (isExpired) return { label: 'Hết hạn', class: 'bg-red-100 text-red-700 border-red-200' };
        return { label: 'Đang chạy', class: 'bg-green-100 text-green-700 border-green-200' };
    };

    const filteredCoupons = coupons.filter(c => c.code?.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Tag className="text-green-600" size={24} />
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Mã Giảm Giá</h1>
                    </div>
                    <p className="mt-1 text-gray-600 text-sm">Tạo và quản lý các chương trình khuyến mãi cho khách hàng</p>
                </div>
                <button
                    onClick={() => setModalData({ show: true, coupon: null })}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-green-200 transition-colors"
                >
                    <Plus size={20} /> Tạo Mã Mới
                </button>
            </div>

            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Tìm kiếm mã coupon..."
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm transition-all"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã Code</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Giảm giá</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Điều kiện</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hạn dùng</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-green-500" />Đang tải dữ liệu...</td></tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr><td colSpan="6" className="p-12 text-center text-gray-500 italic">Chưa có mã giảm giá nào.</td></tr>
                            ) : (
                                filteredCoupons.map(coupon => {
                                    const status = getStatus(coupon);
                                    return (
                                        <tr key={coupon.coupon_id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                                                {coupon.code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">-{coupon.discount_percent}%</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                                {coupon.rule_condition || "Không có"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                                {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('vi-VN') : "Vô thời hạn"}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${status.class}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Chỉ xem chi tiết, không sửa code */}
                                                    <button
                                                        onClick={() => setModalData({ show: true, coupon: coupon })}
                                                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.coupon_id)}
                                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalData.show && (
                <CouponModal
                    coupon={modalData.coupon}
                    onClose={() => setModalData({ show: false, coupon: null })}
                    onSave={handleSave}
                    isSaving={saving}
                />
            )}
        </div>
    );
};

export default CouponManagement;