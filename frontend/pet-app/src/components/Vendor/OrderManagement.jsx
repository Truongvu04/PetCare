import React, { useState, useEffect } from 'react';
import { apiGetVendorOrders, apiUpdateOrderStatus } from '../../api/vendorApi';
import { Package, Layers, Search, Calendar, Loader2, Eye, X, Filter } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../../utils/notifications';

// --- Helper: Format Tiền ---
const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- Helper: Lấy URL ảnh sản phẩm (đảm bảo consistency) ---
const getProductImageUrl = (product) => {
    if (!product) {
        console.warn("⚠️ getProductImageUrl: product is null/undefined");
        return null;
    }
    
    // Debug: Log product structure
    if (!product.product_images || product.product_images.length === 0) {
        console.warn("⚠️ getProductImageUrl: No product_images found for product:", {
            product_id: product.product_id,
            product_name: product.name,
            hasProductImages: !!product.product_images,
            productImagesLength: product.product_images?.length || 0,
            productKeys: Object.keys(product)
        });
        return null;
    }
    
    // Ưu tiên thumbnail (is_thumbnail = true)
    const thumbnail = product.product_images?.find(img => img.is_thumbnail === true || img.is_thumbnail === 1);
    if (thumbnail?.image_url) {
        const url = thumbnail.image_url.startsWith('http') 
            ? thumbnail.image_url 
            : `http://localhost:5000${thumbnail.image_url}`;
        console.log("✅ getProductImageUrl: Using thumbnail:", url);
        return url;
    }
    
    // Nếu không có thumbnail, lấy ảnh đầu tiên
    const firstImage = product.product_images?.[0]?.image_url;
    if (firstImage) {
        const url = firstImage.startsWith('http') 
            ? firstImage 
            : `http://localhost:5000${firstImage}`;
        console.log("✅ getProductImageUrl: Using first image:", url);
        return url;
    }
    
    console.warn("⚠️ getProductImageUrl: No valid image URL found");
    return null;
};

// --- Helper: Badge Trạng Thái ---
const renderStatus = (status) => {
    let classes = '';
    let label = status;
    // Chuẩn hóa status về chữ thường để so sánh
    const normalizedStatus = status?.toLowerCase() || 'pending';

    switch (normalizedStatus) {
        case 'paid': 
            classes = 'bg-green-100 text-green-700 border-green-200'; 
            label = 'Đã thanh toán'; 
            break;
        case 'delivered': 
            classes = 'bg-green-100 text-green-700 border-green-200'; 
            label = 'Giao thành công'; 
            break;
        case 'shipped': 
            classes = 'bg-blue-100 text-blue-700 border-blue-200'; 
            label = 'Đang giao'; 
            break;
        case 'processing': 
            classes = 'bg-yellow-100 text-yellow-700 border-yellow-200'; 
            label = 'Đang xử lý'; 
            break;
        case 'cancelled': 
            classes = 'bg-red-100 text-red-700 border-red-200'; 
            label = 'Đã hủy'; 
            break;
        case 'pending': 
        default: 
            classes = 'bg-gray-100 text-gray-700 border-gray-200'; 
            label = 'Chờ xử lý';
    }
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${classes}`}>{label}</span>;
};

// --- Component: Modal Chi Tiết Đơn Hàng ---
const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
                {/* Header Modal */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng #{order.order_id}</h3>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body Modal */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Thông tin khách hàng */}
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <Package size={18}/> Thông tin giao hàng
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <p className="text-gray-500 text-xs">Khách hàng</p>
                                <p className="font-medium">{order.users?.full_name || order.user_name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Email</p>
                                <p className="font-medium">{order.users?.email || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Số điện thoại</p>
                                <p className="font-medium">{order.users?.phone || order.user?.phone || "Chưa cập nhật"}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-gray-500 text-xs">Địa chỉ nhận hàng</p>
                                <p className="font-medium">{order.shipping_address || "Nhận tại cửa hàng"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Phương thức thanh toán</p>
                                <p className="font-medium uppercase">{order.payment_method || "Tiền mặt"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Layers size={18}/> Sản phẩm ({order.order_items?.length || 0})
                    </h4>
                    <div className="space-y-3">
                        {order.order_items?.map((item, idx) => {
                            // Debug: Log structure để kiểm tra
                            if (idx === 0) {
                                console.log("🔍 OrderDetailModal - First item structure:", {
                                    item,
                                    hasProducts: !!item.products,
                                    hasProduct: !!item.product,
                                    productImages: item.products?.product_images,
                                    productKeys: item.products ? Object.keys(item.products) : [],
                                    itemKeys: Object.keys(item)
                                });
                            }
                            
                            // Try both 'products' (plural) and 'product' (singular) for compatibility
                            const product = item.products || item.product;
                            const imageUrl = getProductImageUrl(product);
                            
                            return (
                                <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product?.name || "Product"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.error("❌ Image load error:", imageUrl, e);
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<span class="text-xs text-gray-400">IMG</span>';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400">IMG</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{product?.name || "Sản phẩm đã xóa"}</p>
                                            <p className="text-xs text-gray-500">Đơn giá: {formatVND(item.price)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">x{item.quantity}</p>
                                        <p className="text-sm text-green-600 font-medium">{formatVND(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <span className="text-gray-600 font-medium">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-green-600">{formatVND(order.total)}</span>
                </div>
            </div>
        </div>
    );
};

// --- Component Chính: OrderManagement ---
const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("pending"); // Tabs: pending, paid, shipped, history

    // Hàm lấy dữ liệu đơn hàng từ API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await apiGetVendorOrders();
            // Đảm bảo dữ liệu luôn là mảng để tránh lỗi .map()
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi tải đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    // Xử lý cập nhật trạng thái
    const handleStatusUpdate = async (orderId, newStatus, actionName) => {
        // Xác nhận trước khi đổi (tránh bấm nhầm)
        const result = await showConfirm(
            actionName || "Cập nhật trạng thái",
            `Bạn có chắc muốn ${actionName?.toLowerCase() || `chuyển trạng thái đơn hàng #${orderId} sang "${newStatus}"`}?`
        );
        if (!result.isConfirmed) return;

        try {
            // Optimistic Update: Cập nhật giao diện ngay lập tức cho mượt
            setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
            
            // Gọi API cập nhật thật trong DB
            await apiUpdateOrderStatus(orderId, newStatus);
            showSuccess("Thành công", `Đã ${actionName?.toLowerCase() || 'cập nhật trạng thái'} đơn hàng #${orderId} thành công!`);
            fetchOrders(); // Refresh để đảm bảo dữ liệu đồng bộ
        } catch (err) {
            showError("Lỗi", "Lỗi cập nhật: " + (err.response?.data?.message || err.message));
            fetchOrders(); // Nếu lỗi thì tải lại dữ liệu cũ
        }
    };

    // Logic Lọc & Tìm kiếm theo tab
    const filteredOrders = orders.filter(o => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
            o.order_id?.toString().includes(term) ||
            o.user_name?.toLowerCase().includes(term) ||
            o.users?.full_name?.toLowerCase().includes(term) ||
            o.users?.email?.toLowerCase().includes(term);
        
        // Filter theo tab
        let matchesTab = false;
        switch (activeTab) {
            case 'pending':
                matchesTab = o.status?.toLowerCase() === 'pending';
                break;
            case 'paid':
                matchesTab = o.status?.toLowerCase() === 'paid';
                break;
            case 'shipped':
                matchesTab = o.status?.toLowerCase() === 'shipped';
                break;
            case 'history':
                matchesTab = ['delivered', 'cancelled', 'refunded'].includes(o.status?.toLowerCase());
                break;
            default:
                matchesTab = true;
        }

        return matchesSearch && matchesTab;
    });

    if (loading) return (
        <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span>Đang tải danh sách đơn hàng...</span>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-green-600" /> Quản lý Đơn hàng
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">Xem và xử lý các đơn hàng mới nhất từ khách hàng</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-500">Tổng đơn hàng: </span>
                    <span className="font-bold text-gray-800">{orders.length}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'pending'
                                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        Chờ xác nhận ({orders.filter(o => o.status?.toLowerCase() === 'pending').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('paid')}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'paid'
                                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        Đang xử lý ({orders.filter(o => o.status?.toLowerCase() === 'paid').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('shipped')}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'shipped'
                                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        Đang giao ({orders.filter(o => o.status?.toLowerCase() === 'shipped').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'history'
                                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        Lịch sử ({orders.filter(o => ['delivered', 'cancelled', 'refunded'].includes(o.status?.toLowerCase())).length})
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center transition-all focus-within:ring-2 focus-within:ring-green-500">
                <Search className="text-gray-400 ml-2" size={20} />
                <input
                    type="text"
                    placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                    className="w-full ml-3 outline-none text-gray-700 bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 px-2">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã Đơn</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">SL</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-500 flex flex-col items-center justify-center w-full">
                                        <Package size={48} className="text-gray-300 mb-3" />
                                        <p>Không tìm thấy đơn hàng nào phù hợp.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.order_id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 font-medium text-gray-900">
                                            #{order.order_id}
                                        </td>
                                        <td className="p-4 text-gray-600 font-medium">
                                            {order.users?.full_name || order.user_name || "N/A"}
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-medium text-gray-700">
                                            {order.order_items?.length || 0}
                                        </td>
                                        <td className="p-4 font-bold text-green-600">
                                            {formatVND(order.total)}
                                        </td>
                                        <td className="p-4">
                                            {renderStatus(order.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Action buttons theo status */}
                                                {order.status?.toLowerCase() === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.order_id, 'paid', 'Xác nhận đơn hàng')}
                                                        className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-1 font-medium"
                                                    >
                                                        Xác nhận
                                                    </button>
                                                )}
                                                {order.status?.toLowerCase() === 'paid' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.order_id, 'shipped', 'Gửi hàng')}
                                                        className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 font-medium"
                                                    >
                                                        Gửi hàng
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center gap-1 font-medium"
                                                >
                                                    <Eye size={16} /> Xem
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Chi Tiết */}
            {selectedOrder && (
                <OrderDetailModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
};

export default OrderManagement;