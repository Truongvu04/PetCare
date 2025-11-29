import React, { useState, useEffect } from 'react';
import { Users, Store, ShoppingCart, DollarSign, Loader2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiGetAdminStats } from '../../api/adminApi';
import { showError, showSuccess } from '../../utils/notifications';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await apiGetAdminStats();
            if (response.data) {
                setStats(response.data.stats || {});
                setChartData(response.data.chartData || []);
            }
        } catch (err) {
            console.error("Error fetching admin stats:", err);
            showError("Lỗi", "Không thể tải thống kê");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span>Đang tải thống kê...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" /> Dashboard Admin
                </h1>
                <p className="text-gray-600 text-sm mt-1">Tổng quan hệ thống PetCare</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng người dùng</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Vendors */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng vendors</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalVendors}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Store className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng đơn hàng</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <ShoppingCart className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng doanh thu</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <DollarSign className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Doanh thu theo tháng (6 tháng gần nhất)</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="month" 
                                stroke="#6b7280"
                                tick={{ fill: '#6b7280' }}
                                tickFormatter={(value) => {
                                    const [year, month] = value.split('-');
                                    return `${month}/${year}`;
                                }}
                            />
                            <YAxis 
                                stroke="#6b7280"
                                tick={{ fill: '#6b7280' }}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) {
                                        return `${(value / 1000000).toFixed(1)}M`;
                                    }
                                    if (value >= 1000) {
                                        return `${(value / 1000).toFixed(0)}K`;
                                    }
                                    return value.toString();
                                }}
                            />
                            <Tooltip 
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={(label) => {
                                    const [year, month] = label.split('-');
                                    return `Tháng ${month}/${year}`;
                                }}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px'
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                name="Doanh thu"
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <p>Chưa có dữ liệu doanh thu</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
