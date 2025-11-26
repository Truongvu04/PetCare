import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, EyeOff, X } from 'lucide-react';

// --- MOCK API (Giữ nguyên như yêu cầu) ---
const apiRegisterVendor = async (formData) => {
    console.log("Đang gọi API Register với dữ liệu:", formData);
    // Giả lập độ trễ mạng 1.5 giây
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Giả lập phản hồi thành công từ Server
    return { 
        data: { 
            token: "mock_vendor_jwt_token_123456" 
        } 
    };
    // Để test lỗi, bỏ comment dòng dưới:
    // throw { response: { data: { message: "Email này đã được sử dụng!" } } };
};
// -----------------------------------------------------------

const VendorRegister = () => {
    // State cho form đăng ký (Giữ nguyên)
    const [formData, setFormData] = useState({
        name: '',       
        shopName: '',   
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    
    // State hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
            const response = await apiRegisterVendor(formData);
            const { token } = response.data;

            if (token) {
                localStorage.setItem('vendorToken', token);
                setMessage('Đăng ký thành công! Đang tự động đăng nhập...');
                setTimeout(() => {
                   navigate('/vendor/login');
                }, 1000);
            } else {
                setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
                setTimeout(() => {
                    navigate('/vendor/login');
                }, 1500);
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Lỗi đăng ký. Vui lòng thử lại.');
        } finally {
             setLoading(false);
        }
    };

    // Style cho ô Input: Đổi màu focus sang green-500 để khớp với Login
    const inputClass = "w-full bg-gray-50 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block p-4 outline-none border border-gray-100 focus:bg-white transition-all placeholder-gray-400";

    return (
        // Nền tối mờ giống như đang mở Modal
        <div className="min-h-screen flex items-center justify-center bg-gray-900/50 backdrop-blur-sm py-10 px-4">
            
            {/* Main Card */}
            <div className="bg-white w-full max-w-[480px] rounded-[32px] shadow-2xl p-8 relative animate-fade-in-up">
                
                {/* Nút đóng (X) ở góc phải */}
                <button onClick={() => navigate('/')} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                    <X size={24} />
                </button>

                {/* Header Logo: Đổi màu text thành text-green-600 */}
                <div className="text-center mb-6 mt-2">
                    <h1 className="text-3xl font-extrabold text-green-600 mb-2 tracking-tight">PetCare+</h1>
                    <p className="text-gray-500 text-sm font-medium">Create an account to get started.</p>
                </div>

                {/* Tab Switcher (Login / Register): Đổi bg thành bg-green-600 */}
                <div className="bg-gray-100 p-1.5 rounded-full flex mb-8">
                    <Link 
                        to="/vendor/login"
                        className="flex-1 py-3 text-center text-sm font-bold text-gray-500 rounded-full hover:bg-gray-200 transition-all"
                    >
                        Login
                    </Link>
                    <div className="flex-1 py-3 text-center text-sm font-bold text-white bg-green-600 rounded-full shadow-md cursor-default">
                        Register
                    </div>
                </div>

                {/* Notification Area */}
                {(error || message) && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                        {error ? <XCircle size={20} className="shrink-0" /> : <CheckCircle size={20} className="shrink-0" />}
                        <span className="font-medium">{error || message}</span>
                    </div>
                )}

                {/* Form Inputs */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    
                    {/* Name */}
                    <div>
                        <input
                            name="name"
                            type="text"
                            required
                            className={inputClass}
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Shop Name */}
                    <div>
                        <input
                            name="shopName"
                            type="text"
                            required
                            className={inputClass}
                            placeholder="Shop Name"
                            value={formData.shopName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            name="email"
                            type="email"
                            required
                            className={inputClass}
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className={inputClass}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Phone */}
                    <div>
                        <input
                            name="phone"
                            type="tel"
                            className={inputClass}
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <input
                            name="address"
                            type="text"
                            className={inputClass}
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Register Button: Đổi màu nền button thành green-600 và hover green-700 */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-lg py-4 transition-all shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : 'Register'}
                    </button>
                </form>

                {/* Footer Link: Đổi màu text link thành text-green-600 */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm font-medium">
                        Already have an account?{' '}
                        <Link to="/vendor/login" className="text-green-600 font-bold hover:underline ml-1">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorRegister;