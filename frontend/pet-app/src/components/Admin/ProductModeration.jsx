import React, { useState, useEffect } from 'react';
import { Package, Loader2, CheckCircle, XCircle, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiGetPendingProducts, apiApproveProduct, apiRejectProduct } from '../../api/adminApi';
import { showError, showSuccess, showConfirm } from '../../utils/notifications';

const ProductModeration = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            const response = await apiGetPendingProducts();
            if (response.data) {
                setProducts(response.data.products || []);
            }
        } catch (err) {
            console.error("Error fetching pending products:", err);
            showError("Error", "Failed to load pending products list");
        } finally {
            setLoading(false);
        }
    };

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setCurrentImageIndex(0);
        setShowModal(true);
    };

    const handleApprove = async (productId) => {
        const result = await showConfirm(
            'Approve Product?',
            'Are you sure you want to approve this product?',
            'Approve',
            'Cancel'
        );

        if (!result.isConfirmed) return;

        try {
            setProcessing(productId);
            await apiApproveProduct(productId);
            showSuccess("Success", "Product approved successfully");
            fetchPendingProducts(); // Refresh list
            if (selectedProduct?.product_id === productId) {
                setShowModal(false);
                setSelectedProduct(null);
            }
        } catch (err) {
            console.error("Error approving product:", err);
            showError("Error", err.response?.data?.message || "Failed to approve product");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            showError("Error", "Please enter rejection reason");
            return;
        }

        try {
            setProcessing(selectedProduct.product_id);
            await apiRejectProduct(selectedProduct.product_id, rejectionReason);
            showSuccess("Success", "Product rejected successfully");
            setShowRejectModal(false);
            setRejectionReason('');
            fetchPendingProducts(); // Refresh list
            setShowModal(false);
            setSelectedProduct(null);
        } catch (err) {
            console.error("Error rejecting product:", err);
            showError("Error", err.response?.data?.message || "Failed to reject product");
        } finally {
            setProcessing(null);
        }
    };

    const openRejectModal = () => {
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setRejectionReason('');
    };

    const nextImage = () => {
        if (selectedProduct?.product_images && selectedProduct.product_images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.product_images.length);
        }
    };

    const prevImage = () => {
        if (selectedProduct?.product_images && selectedProduct.product_images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + selectedProduct.product_images.length) % selectedProduct.product_images.length);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span>Loading pending products list...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="text-blue-600" /> Product Moderation
                </h1>
                <p className="text-gray-600 text-sm mt-1">View and approve products awaiting moderation</p>
            </div>

            {/* Products List */}
            {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <Package size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No pending products</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => {
                        const thumbnail = product.product_images?.find(img => img.is_thumbnail) || product.product_images?.[0];
                        const imageUrl = thumbnail ? `http://localhost:5000${thumbnail.image_url}` : null;

                        return (
                            <div
                                key={product.product_id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                                onClick={() => handleViewProduct(product)}
                            >
                                {imageUrl && (
                                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                                        <img
                                            src={imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                                    <p className="text-lg font-bold text-blue-600 mb-2">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(product.price)}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>Vendor: {product.vendors?.store_name || 'N/A'}</span>
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Product Detail Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex justify-between items-start z-10">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                                <p className="text-blue-100 text-sm mt-1">Pending product details</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedProduct(null);
                                    setCurrentImageIndex(0);
                                }}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Images Carousel */}
                            {selectedProduct.product_images && selectedProduct.product_images.length > 0 && (
                                <div className="mb-6 relative">
                                    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden relative">
                                        <img
                                            src={`http://localhost:5000${selectedProduct.product_images[currentImageIndex].image_url}`}
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {selectedProduct.product_images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                                    {currentImageIndex + 1} / {selectedProduct.product_images.length}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Product Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</label>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(selectedProduct.price)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</label>
                                    <p className="text-gray-900 font-medium mt-1">{selectedProduct.stock || 0} items</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                                    <p className="text-gray-900 font-medium mt-1">{selectedProduct.category || 'Uncategorized'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</label>
                                    <p className="text-gray-900 font-medium mt-1">{selectedProduct.vendors?.store_name || 'N/A'}</p>
                                </div>
                            </div>

                            {selectedProduct.description && (
                                <div className="mb-6">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                                    <p className="text-gray-700 mt-1 leading-relaxed">{selectedProduct.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={openRejectModal}
                                disabled={processing === selectedProduct.product_id}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <XCircle size={20} /> Reject
                            </button>
                            <button
                                onClick={() => handleApprove(selectedProduct.product_id)}
                                disabled={processing === selectedProduct.product_id}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {processing === selectedProduct.product_id ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} /> Approve
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">Reject Product</h3>
                            <p className="text-gray-600 text-sm mt-1">Please enter rejection reason</p>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter product rejection reason..."
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                                required
                            />
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={closeRejectModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || processing === selectedProduct?.product_id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing === selectedProduct?.product_id ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductModeration;

