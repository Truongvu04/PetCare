import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    apiGetDashboardStats,
    apiGetVendorOrders,
    apiGetVendorProfile,
    apiGetNotifications,
    apiGetRevenueChart
} from '../../api/vendorApi';
import { Package, ShoppingCart, DollarSign, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';

// Helper: Định dạng tiền tệ VND
const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount || 0);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericAmount);
};

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
);

const renderStatus = (status) => {
    let classes = 'bg-gray-100 text-gray-700';
    let label = status || 'Chờ xác nhận';
    if (status === 'shipped') { classes = 'bg-blue-100 text-blue-700'; label = 'Đang giao'; }
    else if (status === 'delivered') { classes = 'bg-green-100 text-green-700'; label = 'Giao thành công'; }
    else if (status === 'processing') { classes = 'bg-yellow-100 text-yellow-700'; label = 'Đang xử lý'; }
    else if (status === 'cancelled') { classes = 'bg-red-100 text-red-700'; label = 'Đã hủy'; }
    else if (status === 'paid') { classes = 'bg-green-100 text-green-700'; label = 'Đã thanh toán'; }
    else if (status === 'pending') { classes = 'bg-yellow-100 text-yellow-700'; label = 'Chờ xử lý'; }
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${classes}`}>{label}</span>;
};

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                <p className="text-sm font-semibold">{`Ngày: ${label}`}</p>
                <p className="text-sm text-green-600">{`Doanh thu: ${formatCurrency(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const VendorDashboard = () => {
    const [stats, setStats] = useState({ productCount: 0, newOrders: 0, totalRevenue: 0 });
    const [orders, setOrders] = useState([]);
    const [vendorName, setVendorName] = useState('Vendor');
    const [notifications, setNotifications] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    // Define fetchData outside useEffect so it can be called from event listener
    const fetchData = useCallback(async () => {
        // Wait for auth to finish loading before making API calls
        if (authLoading) {
            console.log("⏳ VendorDashboard: Waiting for auth to load...");
            return;
        }

        // Check if user is authenticated and has vendor access
        // Allow access if:
        // 1. User has vendor role, OR
        // 2. User has admin role AND has vendor record (admin can access vendor dashboard)
        const hasVendorAccess = user && (
            user.role === 'vendor' || 
            (user.role === 'admin' && (user.vendor || localStorage.getItem('vendor')))
        );
        
        if (!user || !hasVendorAccess) {
            console.warn("⚠️ VendorDashboard: User not authenticated or doesn't have vendor access. User:", user?.email, "Role:", user?.role, "Has vendor:", !!user?.vendor);
            setLoading(false);
            return;
        }

        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("⚠️ VendorDashboard: No token found");
            setLoading(false);
            return;
        }

        console.log("✅ VendorDashboard: Auth ready, user:", user.email, "role:", user.role);

        const storedVendor = localStorage.getItem('vendor');
        if (storedVendor) {
            try {
                const parsedData = JSON.parse(storedVendor);
                const nameToShow = parsedData.shopName || parsedData.store_name || parsedData.full_name || parsedData.email;
                if (nameToShow) setVendorName(nameToShow);
            } catch (err) {
                console.error("Lỗi đọc LocalStorage:", err);
            }
        }

        try {
            setLoading(true);
            console.log("🚀 Bắt đầu gọi API Dashboard..."); // LOG 1

            // Add a small delay to ensure token is fully validated
            await new Promise(resolve => setTimeout(resolve, 100));

            const [statsRes, ordersRes, profileRes, chartRes] = await Promise.all([
                apiGetDashboardStats().catch(err => {
                    console.error("❌ Lỗi API Stats:", err.response?.status, err.response?.data?.message);
                    // Don't throw 401/403 - just return null to prevent logout
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        console.warn("⚠️ Stats API returned 401/403 - skipping");
                        return { data: null };
                    }
                    return { data: null };
                }),
                apiGetVendorOrders().catch(err => {
                    console.error("❌ Lỗi API Orders:", err.response?.status, err.response?.data?.message);
                    // Don't throw 401/403 - just return empty array
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        console.warn("⚠️ Orders API returned 401/403 - skipping");
                        return { data: [] };
                    }
                    return { data: [] };
                }),
                apiGetVendorProfile().catch(err => {
                    console.error("❌ Lỗi API Profile:", err.response?.status, err.response?.data?.message);
                    // Don't throw 401/403 - just return empty object
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        console.warn("⚠️ Profile API returned 401/403 - skipping");
                        return { data: {} };
                    }
                    return { data: {} };
                }),
                apiGetRevenueChart().catch((err) => {
                    console.error("❌ Lỗi API Biểu đồ:", err.response?.status, err.response?.data?.message);
                    // Don't throw 401/403 - just return empty array
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        console.warn("⚠️ Chart API returned 401/403 - skipping");
                        return { data: [] };
                    }
                    return { data: [] };
                })
            ]);

            // --- DEBUG QUAN TRỌNG: Kiểm tra dữ liệu biểu đồ ---
            console.log("📊 Dữ liệu Biểu đồ nhận được:", chartRes.data);
            
            if (Array.isArray(chartRes.data) && chartRes.data.length > 0) {
                console.log("✅ Có dữ liệu để vẽ!");
                setChartData(chartRes.data);
            } else {
                console.log("⚠️ Dữ liệu biểu đồ RỖNG hoặc KHÔNG PHẢI MẢNG.");
                setChartData([]); 
            }
            // -------------------------------------------------

            if (statsRes.data) {
                setStats({
                    productCount: statsRes.data.productCount || 0,
                    newOrders: statsRes.data.newOrders || 0,
                    totalRevenue: Number(statsRes.data.totalRevenue || 0),
                });
            }

            setOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : []);

            const profile = profileRes.data;
            if (profile) {
                const apiName = profile.store_name || profile.shopName || profile.full_name || profile.name;
                if (apiName) setVendorName(apiName);
            }

            try {
                const notifRes = await apiGetNotifications();
                setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
            } catch (error) {
                setNotifications([]);
            }

        } catch (err) {
            console.error("Lỗi tải dữ liệu chính Dashboard:", err);
        } finally {
            setLoading(false);
        }
    }, [authLoading, user]);

    useEffect(() => {
        fetchData();
        
        // Listen for product update events to refresh stats
        const handleProductUpdate = () => {
            console.log("🔄 Product updated event received, refreshing dashboard stats...");
            fetchData();
        };
        
        window.addEventListener('productUpdated', handleProductUpdate);
        
        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('productUpdated', handleProductUpdate);
        };
    }, [fetchData]);

    // Refresh stats when navigating back to dashboard
    useEffect(() => {
        if (location.pathname === '/vendor/dashboard') {
            console.log("🔄 Dashboard page focused, refreshing stats...");
            fetchData();
        }
    }, [location.pathname, fetchData]);

    if (loading) return <div className="p-10 text-center text-gray-600 font-medium">Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="mt-1 text-gray-600">Xin chào, <span className="font-semibold text-green-600">{vendorName}</span></p>
                </div>
                {/* Notification button hidden as requested */}
                {/* <button onClick={() => navigate('/vendor/notifications')} className="relative p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition">
                    <Bell className="w-6 h-6 text-gray-600" />
                    {notifications.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                </button> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <StatCard title="Tổng sản phẩm" value={stats.productCount} icon={Package} colorClass="bg-blue-500" />
                <StatCard title="Tổng đơn hàng" value={stats.newOrders} icon={ShoppingCart} colorClass="bg-yellow-500" />
                <StatCard title="Doanh thu" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} colorClass="bg-green-500" />
            </div>

            {/* Orders & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full">
                        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-800">Đơn hàng mới nhất</div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Mã</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-left">Trạng thái</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.length === 0 ? (
                                    <tr><td colSpan="3" className="p-4 text-center text-gray-500">Chưa có đơn hàng</td></tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.order_id} onClick={() => navigate('/vendor/orders')} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 text-sm text-gray-700">#{order.order_id}</td>
                                            <td className="px-6 py-4">{renderStatus(order.status)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 text-right">{formatCurrency(order.total)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-h-[200px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Thông báo</h3>
                            {notifications.length > 0 && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                    {notifications.length}
                                </span>
                            )}
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Không có thông báo mới</p>
                                </div>
                            ) : (
                                // Notifications are already sorted by backend (newest first)
                                // Just display them in order
                                notifications.map((notif) => {
                                    const getIconColor = () => {
                                        switch (notif.color || notif.type) {
                                            case 'green':
                                            case 'order_delivered':
                                                return 'bg-green-500';
                                            case 'red':
                                            case 'cancelled':
                                                return 'bg-red-500';
                                            case 'blue':
                                            case 'new_order':
                                            case 'status_update':
                                            default:
                                                return 'bg-blue-500';
                                        }
                                    };
                                    
                                    const getIcon = () => {
                                        switch (notif.icon || notif.type) {
                                            case 'check-circle':
                                            case 'order_delivered':
                                                return '✓';
                                            case 'truck':
                                            case 'shipped':
                                                return '🚚';
                                            case 'x-circle':
                                            case 'cancelled':
                                                return '✕';
                                            case 'shopping-cart':
                                            case 'new_order':
                                            default:
                                                return '🛒';
                                        }
                                    };
                                    
                                    return (
                                        <div 
                                            key={notif.id || notif.orderId} 
                                            className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                                            onClick={() => notif.orderId && navigate('/vendor/orders')}
                                        >
                                            <div className={`w-8 h-8 rounded-full ${getIconColor()} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                                {getIcon()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 mb-1">{notif.title || 'Thông báo mới'}</p>
                                                <p className="text-sm text-gray-600 line-clamp-2">{notif.message || notif.content || 'Thông báo mới'}</p>
                                                {notif.timeAgo && (
                                                    <p className="text-xs text-gray-400 mt-1">{notif.timeAgo}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu (7 Ngày)</h3>
                    <p className="text-sm text-gray-500">Theo dõi xu hướng doanh thu gần nhất</p>
                </div>
                <div className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `${formatCurrency(value)}`.split('₫')[0].trim()} />
                                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <DollarSign className="w-10 h-10 mb-2 opacity-50" />
                            <p>Chưa có dữ liệu doanh thu để hiển thị</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;