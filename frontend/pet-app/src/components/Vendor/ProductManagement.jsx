import React, { useState, useEffect } from "react";
// ✅ 1. BỎ COMMENT DÒNG NÀY ĐỂ DÙNG API THẬT
import { 
    apiGetVendorProducts, 
    apiAddProduct, 
    apiUpdateProduct, 
    apiDeleteProduct,
    VENDOR_API
} from "../../api/vendorApi";
import api from "../../api/axiosConfig.js";
import { Search, Plus, Edit, Trash2, X, Save, Loader2 } from "lucide-react";
import { showSuccess, showError, showConfirm } from "../../utils/notifications";

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
        description: product?.description || "",
    });
    const [images, setImages] = useState([]); // New images to upload
    const [existingImages, setExistingImages] = useState([]); // Existing images from product (current state)
    const [originalImages, setOriginalImages] = useState([]); // Original images when product was loaded (to track deletions)
    const [imagePreviews, setImagePreviews] = useState([]); // All previews (existing + new)
    const [loadingProduct, setLoadingProduct] = useState(false);

    // Helper function to format image URL
    const formatImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // If it's a relative path, prepend backend URL
        return `http://localhost:5000${url.startsWith('/') ? url : '/' + url}`;
    };

    // Load existing images when product changes
    useEffect(() => {
        const loadProductData = async () => {
            console.log("🖼️ ProductModal useEffect - Product:", product);
            console.log("🖼️ Product images in product object:", product?.product_images);
            console.log("🖼️ Product images type:", typeof product?.product_images);
            console.log("🖼️ Product images is array?", Array.isArray(product?.product_images));
            
            // Reset form data when product changes
            if (product) {
                setFormData({
                    name: product.name || "",
                    category: product.category || "",
                    price: product.price || 0,
                    stock: product.stock || 0,
                    description: product.description || "",
                });

                // If editing and product_images is missing or empty, try to fetch full product data
                const productId = product.product_id || product.id;
                if (productId && (!product.product_images || !Array.isArray(product.product_images) || product.product_images.length === 0)) {
                    console.log("⚠️ Product images missing, fetching full product data...");
                    setLoadingProduct(true);
                    try {
                        const response = await api.get(`/products/${productId}`);
                        const fullProduct = response.data;
                        console.log("✅ Fetched full product:", fullProduct);
                        console.log("✅ Full product images:", fullProduct.product_images);
                        
                        if (fullProduct.product_images && Array.isArray(fullProduct.product_images) && fullProduct.product_images.length > 0) {
                            const formattedImages = fullProduct.product_images
                                .filter(img => img && img.image_url)
                                .map(img => ({
                                    id: img.image_id || img.id,
                                    url: formatImageUrl(img.image_url),
                                    is_thumbnail: img.is_thumbnail || false
                                }));
                            
                            console.log("✅ Formatted images from API:", formattedImages);
                            setExistingImages(formattedImages);
                            setOriginalImages(formattedImages); // Store original for comparison
                            setImagePreviews(formattedImages.map(img => img.url));
                        } else {
                            console.log("⚠️ No images in fetched product");
                            setExistingImages([]);
                            setOriginalImages([]);
                            setImagePreviews([]);
                        }
                    } catch (err) {
                        console.error("❌ Error fetching product details:", err);
                        setExistingImages([]);
                        setImagePreviews([]);
                    } finally {
                        setLoadingProduct(false);
                    }
                } else {
                    // Product has images, use them directly
                    if (product.product_images && Array.isArray(product.product_images) && product.product_images.length > 0) {
                        console.log("✅ Found product_images in product object:", product.product_images.length);
                        const formattedImages = product.product_images
                            .filter(img => img && img.image_url)
                            .map(img => ({
                                id: img.image_id || img.id,
                                url: formatImageUrl(img.image_url),
                                is_thumbnail: img.is_thumbnail || false
                            }));
                        
                        console.log("✅ Formatted images:", formattedImages);
                        setExistingImages(formattedImages);
                        setOriginalImages(formattedImages); // Store original for comparison
                        setImagePreviews(formattedImages.map(img => img.url));
                    } else {
                        console.log("⚠️ No product_images found or empty array");
                        setExistingImages([]);
                        setOriginalImages([]);
                        setImagePreviews([]);
                    }
                }
            } else {
                // New product, no images
                setExistingImages([]);
                setOriginalImages([]);
                setImagePreviews([]);
            }
            // Reset new images when switching products
            setImages([]);
        };

        loadProductData();
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            // Ép kiểu số cho price và stock để gửi lên backend đúng định dạng
            [name]: (name === 'price' || name === 'stock') ? Number(value) : value
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const currentTotal = existingImages.length + images.length;
        const maxImages = 5;
        
        if (currentTotal >= maxImages) {
            showError("Error", `Maximum ${maxImages} images allowed`);
            e.target.value = ''; // Reset input
            return;
        }

        // Calculate how many more images can be added
        const remainingSlots = maxImages - currentTotal;
        const filesToProcess = files.slice(0, remainingSlots);
        
        if (files.length > remainingSlots) {
            showError("Error", `Can only add ${remainingSlots} more images (total ${maxImages} images)`);
        }

        const newImages = filesToProcess.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
            if (!isValidType) {
                showError("Error", "Only image files are accepted");
                return false;
            }
            if (!isValidSize) {
                showError("Error", "File size must not exceed 5MB");
                return false;
            }
            return true;
        });

        if (newImages.length === 0) {
            e.target.value = ''; // Reset input
            return;
        }

        // Add new images to state
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);

        // Create previews for new images
        const newPreviews = [];
        let loadedCount = 0;
        newImages.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                loadedCount++;
                if (loadedCount === newImages.length) {
                    // Update previews with all new images at once
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
        
        e.target.value = ''; // Reset input to allow selecting same file again
    };

    const removeImage = (index) => {
        // Check if removing existing image or new image
        if (index < existingImages.length) {
            // Removing existing image
            setExistingImages(prev => prev.filter((_, i) => i !== index));
            setImagePreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            // Removing new image
            const newImageIndex = index - existingImages.length;
            setImages(prev => prev.filter((_, i) => i !== newImageIndex));
            setImagePreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Calculate which images were deleted by comparing originalImages with existingImages
        const deletedImageIds = originalImages
            .filter(originalImg => !existingImages.find(existingImg => existingImg.id === originalImg.id))
            .map(img => img.id)
            .filter(id => id); // Filter out null/undefined IDs
        
        console.log("🗑️ Deleted image IDs:", deletedImageIds);
        console.log("📸 Remaining existing images:", existingImages.map(img => img.id));
        console.log("➕ New images to upload:", images.length);
        
        // Pass: formData, new images, remaining existing images, deleted image IDs
        onSave(formData, images, existingImages, deletedImageIds);
    };

    if (loadingProduct) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-xl shadow-2xl">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-green-600" size={32} />
                        <p className="text-gray-600 font-medium">Loading product information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {product ? "Update Product" : "Add New Product"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required
                            placeholder="e.g., Royal Canin Dry Food"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (VND)</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required
                            placeholder="e.g., Food, Toy..."
                        />
                    </div>
                    
                    {/* Thêm trường mô tả nếu muốn đầy đủ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none"
                            placeholder="Detailed product description..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Images (Optional, max 5 images)
                        </label>
                        <div className="mt-2">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                                disabled={(existingImages.length + images.length) >= 5}
                            />
                            <label
                                htmlFor="image-upload"
                                className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                                    (existingImages.length + images.length) >= 5 
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <Plus size={16} className="mr-2" />
                                Select Images
                            </label>
                            <p className={`text-xs mt-1 ${
                                (existingImages.length + images.length) >= 5 ? "text-red-500 font-medium" : "text-gray-500"
                            }`}>
                                {existingImages.length + images.length}/5 images selected
                            </p>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 ? (
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={`preview-${index}-${preview}`} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                console.error("❌ Image load error:", preview);
                                                e.target.src = 'https://via.placeholder.com/200x200?text=Image+Error';
                                            }}
                                            onLoad={() => {
                                                console.log("✅ Image loaded successfully:", preview);
                                            }}
                                        />
                                        <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                            {index < existingImages.length ? 'Existing' : 'New'}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            title={index < existingImages.length ? 'Remove existing image' : 'Remove new image'}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4 text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                                {product ? 'No images yet. Please add images for the product.' : 'No images yet. Please select images to upload.'}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-md shadow-green-200 disabled:opacity-70"
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {isSaving ? "Saving..." : "Save Product"}
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
            const productsList = Array.isArray(res.data) ? res.data : [];
            console.log("📦 Fetched products:", productsList.length);
            console.log("📦 First product sample:", productsList[0]);
            if (productsList[0]) {
                console.log("📦 First product images:", productsList[0].product_images);
            }
            setProducts(productsList); 
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    // Hàm lưu (Thêm mới hoặc Cập nhật) vào Database
    const handleSave = async (data, images = [], existingImages = [], deletedImageIds = []) => {
        setSaving(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('category', data.category);
            formData.append('price', data.price);
            formData.append('stock', data.stock);
            if (data.description) {
                formData.append('description', data.description);
            }

            // Append new images
            images.forEach((image) => {
                formData.append('images', image);
            });

            // Append remaining existing image IDs (to keep them)
            if (existingImages && existingImages.length > 0) {
                const existingIds = existingImages.map(img => img.id).filter(id => id);
                if (existingIds.length > 0) {
                    formData.append('existingImageIds', JSON.stringify(existingIds));
                }
            }

            // Append deleted image IDs (to delete them)
            // Send each ID as a separate field with array notation so multer can parse it
            if (deletedImageIds && deletedImageIds.length > 0) {
                deletedImageIds.forEach(id => {
                    formData.append('deletedImageIds[]', id.toString());
                });
                console.log("📤 Sending deleted image IDs to backend:", deletedImageIds);
            }

            let response;
            if (modalData.product) {
                // Cập nhật: Gọi API PUT với ID sản phẩm (product_id hoặc id)
                const productId = modalData.product.product_id || modalData.product.id;
                
                // If we have deletedImageIds, append them as query params
                let url = `/products/${productId}`;
                if (deletedImageIds && deletedImageIds.length > 0) {
                    const deletedIdsParam = deletedImageIds.join(',');
                    url += `?deletedImageIds=${deletedIdsParam}`;
                    console.log("📤 Sending deletedImageIds via query param:", deletedIdsParam);
                }
                
                // Use custom axios call instead of apiUpdateProduct to include query params
                const token = localStorage.getItem("token");
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                };
                // Remove Content-Type header for FormData (browser will set it with boundary)
                if (formData instanceof FormData) {
                    delete config.headers['Content-Type'];
                }
                
                response = await VENDOR_API.put(url, formData, config);
                console.log("✅ Update product response:", response.data);
            } else {
                // Thêm mới: Gọi API POST
                response = await apiAddProduct(formData);
                console.log("✅ Add product response:", response.data);
            }
            
            // Wait a bit to ensure database operations complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await fetchProducts(); // Tải lại danh sách mới nhất từ DB
            setModalData({ show: false, product: null });
            showSuccess("Success", "Product saved successfully!");
            
            // Dispatch event để VendorDashboard refresh stats
            window.dispatchEvent(new CustomEvent('productUpdated'));
        } catch (err) {
            console.error("Error saving product:", err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "An error occurred while saving the product. Please try again.";
            showError("Error", errorMsg);
        } finally {
            setSaving(false);
        }
    };

    // Hàm xóa sản phẩm khỏi Database
    const handleDelete = async (product) => {
        const result = await showConfirm("Delete Product", `Are you sure you want to delete "${product.name}"?`);
        if (!result.isConfirmed) return;
        
            try {
                const productId = product.product_id || product.id;
                await apiDeleteProduct(productId);
                
                // Cập nhật UI ngay lập tức
                setProducts(prev => prev.filter(p => (p.product_id || p.id) !== productId));
            showSuccess("Success", "Product deleted successfully!");
            
            // Dispatch event để VendorDashboard refresh stats
            window.dispatchEvent(new CustomEvent('productUpdated'));
            } catch (err) {
                console.error("Error deleting product:", err);
            showError("Error", "Failed to delete product.");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(filter.toLowerCase()) ||
        p.category?.toLowerCase().includes(filter.toLowerCase())
    );

    // Render trạng thái sản phẩm (status từ DB)
    const renderStatus = (product) => {
        const status = product.status || 'PENDING';
        const stock = product.stock || 0;
        
        // Status badge
        let statusBadge = null;
        switch (status) {
            case 'APPROVED':
                statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        Approved
                    </span>
                );
                break;
            case 'REJECTED':
                statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        Rejected
                    </span>
                );
                break;
            case 'PENDING':
            default:
                statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                        Pending
                    </span>
                );
                break;
        }
        
        // Stock badge
        const stockBadge = stock > 0 ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 ml-2">
                In Stock
            </span>
        ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 ml-2">
                Out of Stock
            </span>
        );
        
        return (
            <div className="flex flex-col gap-1 items-center">
                {statusBadge}
                {stockBadge}
                {status === 'REJECTED' && product.rejection_reason && (
                    <span className="text-xs text-red-600 mt-1 max-w-xs text-center" title={product.rejection_reason}>
                        Reason: {product.rejection_reason.length > 30 ? product.rejection_reason.substring(0, 30) + '...' : product.rejection_reason}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                    <p className="text-gray-600 text-sm mt-1">Manage your product list and inventory</p>
                </div>
                <button
                    onClick={() => setModalData({ show: true, product: null })}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-md shadow-green-200 font-medium"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            <div className="mb-6 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    placeholder="Search by name or category..."
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
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Product Name</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Category</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Price</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Stock</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-green-500" />
                                            <span>Loading data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500">
                                        No products found.
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
                                            {renderStatus(p)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        console.log("✏️ Edit button clicked for product:", p);
                                                        console.log("✏️ Product images:", p.product_images);
                                                        setModalData({ show: true, product: p });
                                                    }}
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
                    key={modalData.product?.product_id || modalData.product?.id || 'new'}
                    product={modalData.product}
                    onClose={() => {
                        setModalData({ show: false, product: null });
                    }}
                    onSave={handleSave}
                    isSaving={saving}
                />
            )}
        </div>
    );
};

export default ProductManagement;