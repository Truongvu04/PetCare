import React, { useState, useEffect } from 'react';
import { Users, Tag, Search, Eye, Loader2, X, Store, User, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import api from '../../api/axiosConfig.js';
import { showError } from '../../utils/notifications';

const AdminDashboard = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await api.get('/v1/vendor/list');
            setVendors(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching vendors:", err);
            showError("Lỗi", "Không thể tải danh sách vendors");
        } finally {
            setLoading(false);
        }
    };

    const filteredVendors = vendors.filter(vendor => {
        const term = searchTerm.toLowerCase();
        return (
            vendor.store_name?.toLowerCase().includes(term) ||
            vendor.users?.email?.toLowerCase().includes(term) ||
            vendor.users?.full_name?.toLowerCase().includes(term) ||
            vendor.address?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span>Đang tải danh sách vendors...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> Quản lý Vendors
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">Xem và quản lý tất cả các vendors trong hệ thống</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-500">Tổng vendors: </span>
                    <span className="font-bold text-gray-800">{vendors.length}</span>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center transition-all focus-within:ring-2 focus-within:ring-blue-500">
                <Search className="text-gray-400 ml-2" size={20} />
                <input
                    type="text"
                    placeholder="Tìm theo tên cửa hàng, email, hoặc địa chỉ..."
                    className="w-full ml-3 outline-none text-gray-700 bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Vendors Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cửa hàng</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chủ sở hữu</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500 flex flex-col items-center justify-center w-full">
                                        <Users size={48} className="text-gray-300 mb-3" />
                                        <p>Không tìm thấy vendor nào phù hợp.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map(vendor => (
                                    <tr key={vendor.vendor_id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 font-medium text-gray-900">
                                            {vendor.store_name}
                                        </td>
                                        <td className="p-4 text-gray-600 font-medium">
                                            {vendor.users?.full_name || 'N/A'}
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {vendor.users?.email || 'N/A'}
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {vendor.address || 'Chưa cập nhật'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                                vendor.status === 'approved' 
                                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                                    : vendor.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                {vendor.status === 'approved' ? 'Đã duyệt' : vendor.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => {
                                                    setSelectedVendor(vendor);
                                                    setShowModal(true);
                                                }}
                                                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center gap-1 ml-auto font-medium"
                                            >
                                                <Eye size={16} /> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vendor Detail Modal */}
            {showModal && selectedVendor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedVendor.store_name}</h2>
                                    <p className="text-blue-100 text-sm mt-1">Thông tin chi tiết vendor</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedVendor(null);
                                }}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Store Information */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Store size={20} className="text-blue-600" />
                                    Thông tin cửa hàng
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên cửa hàng</label>
                                        <p className="text-gray-900 font-medium mt-1">{selectedVendor.store_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Địa chỉ</label>
                                        <p className="text-gray-900 mt-1 flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            {selectedVendor.address || 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                                        <p className="text-gray-900 mt-1 flex items-center gap-2">
                                            <Phone size={16} className="text-gray-400" />
                                            {selectedVendor.phone || 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</label>
                                        <div className="mt-1">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                                selectedVendor.status === 'approved' 
                                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                                    : selectedVendor.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                                {selectedVendor.status === 'approved' ? 'Đã duyệt' : selectedVendor.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedVendor.description && (
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả</label>
                                            <p className="text-gray-700 mt-1 text-sm leading-relaxed">{selectedVendor.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Information */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <User size={20} className="text-green-600" />
                                    Thông tin chủ sở hữu
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Họ và tên</label>
                                        <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            {selectedVendor.users?.full_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                                        <p className="text-gray-900 mt-1 flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            {selectedVendor.users?.email || 'N/A'}
                                        </p>
                                    </div>
                                    {selectedVendor.users?.phone && (
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                                            <p className="text-gray-900 mt-1 flex items-center gap-2">
                                                <Phone size={16} className="text-gray-400" />
                                                {selectedVendor.users.phone}
                                            </p>
                                        </div>
                                    )}
                                    {selectedVendor.created_at && (
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày tạo</label>
                                            <p className="text-gray-900 mt-1 flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                {new Date(selectedVendor.created_at).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Info */}
                            {selectedVendor.vendor_id && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">Vendor ID:</span> {selectedVendor.vendor_id}
                                    </p>
                                    {selectedVendor.users?.user_id && (
                                        <p className="text-sm text-blue-800 mt-1">
                                            <span className="font-semibold">User ID:</span> {selectedVendor.users.user_id}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedVendor(null);
                                }}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

