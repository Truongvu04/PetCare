import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegisterVendor } from '../../api/vendorApi';
import { CheckCircle, XCircle } from 'lucide-react'; // Import icon thông báo

const VendorRegister = () => {
    // State cho form đăng ký
    const [formData, setFormData] = useState({
        name: '',       // Họ và tên chủ shop
        shopName: '',   // Tên cửa hàng
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // State thông báo thành công
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            setLoading(false);
            return;
        }

        try {
            // 1. Gọi API đăng ký
            const response = await apiRegisterVendor(formData);

            // 2. Lấy token và thông tin từ phản hồi
            const { token } = response.data;

            if (token) {
                // TRƯỜNG HỢP 1: TỰ ĐỘNG ĐĂNG NHẬP (Khuyến nghị)
                // 3. Lưu token vào LocalStorage
                localStorage.setItem('vendorToken', token);

                // 4. Thông báo và chuyển hướng cứng (Reload toàn trang)
                setMessage('Đăng ký thành công! Đang tự động đăng nhập...');

                // 💥 SỬA: Dùng window.location.href ngay lập tức để đảm bảo chuyển hướng và tải lại toàn bộ
                // Thay vì setTimeout, ta thực hiện ngay sau khi setMessage.
                window.location.href = '/vendor/login';

            } else {
                // TRƯỜNG HỢP 2: BẮT ĐĂNG NHẬP LẠI (Fallback)
                setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
                // 💥 SỬA: Giữ lại setTimeout để người dùng kịp đọc thông báo
                setTimeout(() => {
                    navigate('/vendor/login');
                }, 1500);
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Lỗi đăng ký. Vui lòng thử lại.');
        } finally {
            // CHỈ tắt loading nếu không có chuyển hướng cứng (window.location.href)
            if (!response?.data?.token) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-2xl border-t-4 border-green-600">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Vendor Register
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Đăng ký để bắt đầu bán hàng trên PetCare
                    </p>
                </div>

                {/* Khu vực thông báo */}
                {(error || message) && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {error ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                        <span className="text-sm font-medium">{error || message}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Họ tên */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Họ và Tên</label>
                            <input
                                name="name" type="text" required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Nguyễn Văn A"
                                value={formData.name} onChange={handleChange}
                            />
                        </div>

                        {/* Tên Shop */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Tên Shop (Vendor Name)</label>
                            <input
                                name="shopName" type="text" required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Pet Shop Sài Gòn"
                                value={formData.shopName} onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                name="email" type="email" required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="email@example.com"
                                value={formData.email} onChange={handleChange}
                            />
                        </div>

                        {/* Mật khẩu */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input
                                name="password" type="password" required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="••••••••"
                                value={formData.password} onChange={handleChange}
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input
                                name="phone" type="tel"
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="0909..."
                                value={formData.phone} onChange={handleChange}
                            />
                        </div>

                        {/* Địa chỉ (Mới thêm) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                            <input
                                name="address" type="text"
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Ví dụ: 123 Đường ABC"
                                value={formData.address} onChange={handleChange}
                            />
                        </div>

                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 transition"
                        >
                            {loading ? 'Đang xử lý...' : 'Register'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Đã có tài khoản? </span>
                    <Link to="/vendor/login" className="font-medium text-green-600 hover:text-green-500">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VendorRegister;