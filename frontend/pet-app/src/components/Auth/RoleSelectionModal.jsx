// src/components/Auth/RoleSelectionModal.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Store, X } from 'lucide-react'; // Icons

const RoleSelectionModal = ({ onClose }) => {
    const navigate = useNavigate();

    const handleSelect = (role) => {
        onClose(); // Đóng Modal
        
        if (role === 'owner') {
            // Chuyển hướng đến form Login/Register Owner chung
            navigate('/login'); 
        } else {
            // Chuyển hướng đến form Login/Register Vendor riêng
            navigate('/vendor/login'); 
        }
    };

    return (
        // ✅ Popup nằm giữa màn hình
        <div 
            className="fixed inset-0 flex justify-center items-center bg-gray-900/60 backdrop-blur-sm p-4 z-[100]" 
            onClick={onClose} // Nhấn ra ngoài để đóng
        >
            <div 
                className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative transform transition-all"
                onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng khi click vào nội dung
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                >
                    <X size={20} />
                </button>

                <h2 className="text-3xl font-bold text-center text-green-600 mb-2">
                    Chào mừng bạn!
                </h2>
                <p className="text-gray-600 text-center mb-8">
                    Vui lòng chọn cổng đăng nhập để tiếp tục.
                </p>

                {/* --- Options --- */}
                <div className="grid grid-cols-2 gap-6">
                    
                    {/* 1. OWNER/USER OPTION */}
                    <button
                        onClick={() => handleSelect('owner')}
                        className="flex flex-col items-center p-8 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                        <PawPrint className="text-green-600 mb-3" size={32} />
                        <span className="font-bold text-lg text-gray-800">Pet Owner</span>
                        <span className="text-sm text-gray-500 mt-1">Đăng nhập/Đăng ký User</span>
                    </button>

                    {/* 2. VENDOR OPTION */}
                    <button
                        onClick={() => handleSelect('vendor')}
                        className="flex flex-col items-center p-8 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                        <Store className="text-indigo-600 mb-3" size={32} />
                        <span className="font-bold text-lg text-gray-800">Nhà bán hàng</span>
                        <span className="text-sm text-gray-500 mt-1">Đăng nhập cổng Vendor</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RoleSelectionModal;