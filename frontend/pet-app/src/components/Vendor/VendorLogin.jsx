import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiLoginVendor } from '../../api/vendorApi';

const VendorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Gọi API đăng nhập
            const response = await apiLoginVendor({ email, password });

            // 2. Lấy token VÀ thông tin vendor từ phản hồi
            // (Backend trả về: { token: "...", vendor: { id, shopName, ... } })
            const { token, vendor } = response.data; 

            // 3. Lưu Token vào LocalStorage
            localStorage.setItem('vendorToken', token);

            // 4. [MỚI] Lưu thông tin Vendor vào LocalStorage
            // (Để Sidebar có thể lấy tên và avatar hiển thị)
            if (vendor) {
                localStorage.setItem('vendor', JSON.stringify(vendor));
            }

            // 5. Chuyển hướng và tải lại trang
            window.location.href = '/vendor/dashboard';

        } catch (err) {
            console.error(err);
            // Lấy thông báo lỗi chi tiết từ backend nếu có
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Vendor Login</h2>
                    <p className="text-gray-500 mt-2">Quản lý cửa hàng PetCare của bạn</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            placeholder="name@company.com"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium disabled:bg-green-300 transition-colors"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Chưa có tài khoản Vendor?{' '}
                    <Link to="/vendor/register" className="font-medium text-green-600 hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VendorLogin;