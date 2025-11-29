import React, { useState, useEffect } from 'react';
import { Store, Loader2, CheckCircle, XCircle, AlertCircle, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { apiGetPendingVendors, apiApproveVendor, apiRejectVendor } from '../../api/adminApi';
import { showSuccess, showError, showConfirm } from '../../utils/notifications';

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(null); // vendor_id đang xử lý

    useEffect(() => {
        fetchPendingVendors();
    }, []);

    const fetchPendingVendors = async () => {
        try {
            setLoading(true);
            const res = await apiGetPendingVendors();
            setVendors(res.data.vendors || []);
        } catch (err) {
            console.error("Lỗi tải danh sách vendor:", err);
            showError("Lỗi", "Không thể tải danh sách vendor chờ duyệt");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (vendorId) => {
        const result = await showConfirm(
            'Duyệt Vendor',
            'Bạn có chắc chắn muốn duyệt vendor này?',
            'Duyệt',
            'Hủy'
        );

        if (!result.isConfirmed) return;

        try {
            setProcessing(vendorId);
            await apiApproveVendor(vendorId);
            showSuccess("Thành công", "Đã duyệt vendor thành công");
            await fetchPendingVendors();
        } catch (err) {
            showError("Lỗi", err.response?.data?.message || "Không thể duyệt vendor");
        } finally {
            setProcessing(null);
        }
    };

    const handleRejectClick = (vendor) => {
        setSelectedVendor(vendor);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason || rejectReason.trim().length === 0) {
            showError("Lỗi", "Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            setProcessing(selectedVendor.vendor_id);
            await apiRejectVendor(selectedVendor.vendor_id, rejectReason.trim());
            showSuccess("Thành công", "Đã từ chối vendor");
            setShowRejectModal(false);
            setSelectedVendor(null);
            setRejectReason('');
            await fetchPendingVendors();
        } catch (err) {
            showError("Lỗi", err.response?.data?.message || "Không thể từ chối vendor");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Store className="text-blue-600" size={28} />
                        Quản lý Vendor
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Duyệt các yêu cầu đăng ký làm vendor</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200">
                    {vendors.length} yêu cầu chờ duyệt
                </div>
            </div>

            {/* Vendor List */}
            {vendors.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không có yêu cầu nào chờ duyệt</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {vendors.map((vendor) => (
                        <div
                            key={vendor.vendor_id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Store className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{vendor.store_name}</h3>
                                            <p className="text-sm text-gray-500">ID: #{vendor.vendor_id}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User size={16} className="text-gray-400" />
                                            <span className="font-medium">Người đăng ký:</span>
                                            <span>{vendor.users?.full_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail size={16} className="text-gray-400" />
                                            <span className="font-medium">Email:</span>
                                            <span>{vendor.users?.email || 'N/A'}</span>
                                        </div>
                                        {vendor.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={16} className="text-gray-400" />
                                                <span className="font-medium">SĐT:</span>
                                                <span>{vendor.phone}</span>
                                            </div>
                                        )}
                                        {vendor.address && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span className="font-medium">Địa chỉ:</span>
                                                <span>{vendor.address}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="font-medium">Ngày đăng ký:</span>
                                            <span>{new Date(vendor.created_at).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-4">
                                    <button
                                        onClick={() => handleApprove(vendor.vendor_id)}
                                        disabled={processing === vendor.vendor_id}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 font-medium flex items-center gap-2 transition-all"
                                    >
                                        {processing === vendor.vendor_id ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <CheckCircle size={18} />
                                        )}
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={() => handleRejectClick(vendor)}
                                        disabled={processing === vendor.vendor_id}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 font-medium flex items-center gap-2 transition-all"
                                    >
                                        <XCircle size={18} />
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="text-red-600" size={24} />
                            <h3 className="text-lg font-bold text-gray-800">Từ chối Vendor</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Bạn đang từ chối yêu cầu đăng ký vendor từ <strong>{selectedVendor?.store_name}</strong>.
                            Vui lòng nhập lý do từ chối:
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                            rows="4"
                            placeholder="Nhập lý do từ chối..."
                            required
                        />
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectReason.trim() || processing === selectedVendor?.vendor_id}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 font-medium transition-all"
                            >
                                {processing === selectedVendor?.vendor_id ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        Đang xử lý...
                                    </span>
                                ) : (
                                    'Xác nhận từ chối'
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedVendor(null);
                                    setRejectReason('');
                                }}
                                disabled={processing === selectedVendor?.vendor_id}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorManagement;

