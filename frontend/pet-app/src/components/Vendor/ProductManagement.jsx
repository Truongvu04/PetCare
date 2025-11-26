import React, { useState, useEffect } from "react";
// ✅ 1. BỎ COMMENT DÒNG NÀY ĐỂ DÙNG API THẬT
import { 
    apiGetVendorProducts, 
    apiAddProduct, 
    apiUpdateProduct, 
    apiDeleteProduct 
} from "../../api/vendorApi";
import { Search, Plus, Edit, Trash2, X, Save, Loader2 } from "lucide-react";

// --- ❌ ĐÃ XÓA PHẦN API GIẢ LẬP (MOCK API) ---

// Hàm format tiền tệ Việt Nam
const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

// --- Component Modal (Thêm/Sửa) ---
const ProductModal = ({ product, onClose, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        name: product?.name || "",
        category: product?.category || "",
        price: product?.price || 0,
        stock: product?.stock || 0,
        description: product?.description || "", // Thêm description nếu cần
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            // Ép kiểu số cho price và stock để gửi lên backend đúng định dạng
            [name]: (name === 'price' || name === 'stock') ? Number(value) : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {product ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required
                            placeholder="Ví dụ: Thức ăn hạt Royal Canin"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                required
                                min="0"
                                step="1000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <input
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required
                            placeholder="VD: Food, Toy..."
                        />
                    </div>
                    
                    {/* Thêm trường mô tả nếu muốn đầy đủ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (Tùy chọn)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none"
                            placeholder="Mô tả chi tiết sản phẩm..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            disabled={isSaving}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-md shadow-green-200 disabled:opacity-70"
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {isSaving ? "Đang lưu..." : "Lưu sản phẩm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---
const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState("");
    const [modalData, setModalData] = useState({ show: false, product: null });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false); 

    // Hàm lấy danh sách sản phẩm từ Database
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await apiGetVendorProducts();
            // API trả về mảng trực tiếp hoặc { data: [...] } tùy backend
            setProducts(Array.isArray(res.data) ? res.data : []); 
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    // Hàm lưu (Thêm mới hoặc Cập nhật) vào Database
    const handleSave = async (data) => {
        setSaving(true);
        try {
            if (modalData.product) {
                // Cập nhật: Gọi API PUT với ID sản phẩm (product_id hoặc id)
                const productId = modalData.product.product_id || modalData.product.id;
                await apiUpdateProduct(productId, data);
            } else {
                // Thêm mới: Gọi API POST
                await apiAddProduct(data);
            }
            
            await fetchProducts(); // Tải lại danh sách mới nhất từ DB
            setModalData({ show: false, product: null });
            alert("Lưu sản phẩm thành công!");
        } catch (err) {
            console.error("Error saving product:", err);
            alert("Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    // Hàm xóa sản phẩm khỏi Database
    const handleDelete = async (product) => {
        if (window.confirm(`Bạn chắc chắn muốn xóa "${product.name}"?`)) {
            try {
                const productId = product.product_id || product.id;
                await apiDeleteProduct(productId);
                
                // Cập nhật UI ngay lập tức
                setProducts(prev => prev.filter(p => (p.product_id || p.id) !== productId));
            } catch (err) {
                console.error("Error deleting product:", err);
                alert("Không thể xóa sản phẩm.");
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(filter.toLowerCase()) ||
        p.category?.toLowerCase().includes(filter.toLowerCase())
    );

    // Render trạng thái (Logic này chỉ dùng để hiển thị, không cần gửi lên DB nếu DB chưa có cột status)
    const renderStatus = (stock) => {
        if (stock > 0) {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Đang bán</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">Hết hàng</span>;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
                    <p className="text-gray-600 text-sm mt-1">Quản lý danh sách sản phẩm và kho hàng của bạn</p>
                </div>
                <button
                    onClick={() => setModalData({ show: true, product: null })}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-md shadow-green-200 font-medium"
                >
                    <Plus size={20} /> Thêm sản phẩm
                </button>
            </div>

            <div className="mb-6 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    placeholder="Tìm kiếm theo tên hoặc danh mục..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Tên sản phẩm</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Danh mục</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Giá bán</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Kho</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-green-500" />
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500">
                                        Không tìm thấy sản phẩm nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(p => (
                                    <tr key={p.product_id || p.id} className="hover:bg-green-50 transition-colors group">
                                        <td className="p-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="p-4 text-gray-600">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-900 font-medium text-green-600">
                                            {formatVND(p.price)}
                                        </td>
                                        <td className="p-4 text-gray-600 text-center">
                                            {p.stock > 0 ? <span className="font-medium">{p.stock}</span> : <span className="text-red-500 text-xs font-bold">0</span>}
                                        </td>
                                        <td className="p-4 text-center">
                                            {renderStatus(p.stock)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setModalData({ show: true, product: p })}
                                                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p)}
                                                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
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

            {modalData.show && (
                <ProductModal
                    product={modalData.product}
                    onClose={() => setModalData({ show: false, product: null })}
                    onSave={handleSave}
                    isSaving={saving}
                />
            )}
        </div>
    );
};

export default ProductManagement;