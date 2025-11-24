import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiLoginVendor } from '../../api/vendorApi';

// Icon SVG đơn giản để không cần cài thêm thư viện
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

const VendorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Thêm state để ẩn/hiện password giống hình

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Gọi API đăng nhập
            const response = await apiLoginVendor({ email, password });

            // 2. Lấy token VÀ thông tin vendor
            const { token, vendor } = response.data;

            // 3. Lưu Token
            localStorage.setItem('vendorToken', token);

            // 4. Lưu thông tin Vendor
            if (vendor) {
                localStorage.setItem('vendor', JSON.stringify(vendor));
            }

            // 5. Chuyển hướng
            window.location.href = '/vendor/dashboard';

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Wrapper nền tối giống modal popup
        <div className="flex items-center justify-center min-h-screen bg-gray-900/50 backdrop-blur-sm">
            
            {/* Modal Container: Bo tròn nhiều (rounded-3xl) */}
            <div className="relative w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
                
                {/* Nút X đóng form */}
                <button 
                    onClick={() => navigate('/')} 
                    className="absolute top-4 right-4 p-1 text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                    <CloseIcon />
                </button>

                {/* Header: Logo và Welcome text */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-green-600 mb-1">PetCare+</h1>
                    <p className="text-sm text-gray-500">Welcome back! Sign in to continue.</p>
                </div>

                {/* Tabs: Login / Register Button Toggle */}
                <div className="flex p-1 mb-8 bg-gray-100 rounded-full">
                    <button className="flex-1 py-2 text-sm font-semibold text-white bg-green-600 rounded-full shadow-sm transition-all">
                        Login
                    </button>
                    <Link to="/vendor/register" className="flex-1 py-2 text-sm font-semibold text-gray-500 text-center rounded-full hover:text-gray-700 transition-all">
                        Register
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 text-sm text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-3 text-sm bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                            placeholder="Email"
                        />
                    </div>

                    {/* Password Input with Eye Icon */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-5 py-3 text-sm bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none"
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-white bg-green-600 rounded-2xl hover:bg-green-700 font-bold shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                        {loading ? 'Processing...' : 'Login'}
                    </button>
                </form>

                {/* Phần Social (Google/Facebook) đã bị xóa theo yêu cầu */}
                
                {/* Footer Link (nếu cần thiết, hoặc để trống như hình ảnh không nhấn mạnh phần này) */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        Don't have an account? <Link to="/vendor/register" className="text-green-600 hover:underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;