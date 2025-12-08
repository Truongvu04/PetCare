import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import api from "../../api/axiosConfig.js";
import { useCart } from "./CartContext.jsx";
import CartIcon from "./CartIcon.jsx";
import { showWarning, showToast } from "../../utils/notifications";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="max-w-[1280px] mx-auto p-8">Loading...</div>;
  }

  if (!product) {
    return <div className="max-w-[1280px] mx-auto p-8">Product not found</div>;
  }

  const images = product.product_images || [];
  const selectedImage = images[selectedImageIndex] || images[0];
  const averageRating =
    product.reviews?.reduce((sum, r) => sum + r.rating, 0) /
    product.reviews?.length || 0;

  // Helper function to build image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "https://via.placeholder.com/400?text=No+Image";
    const url = imageUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    } else if (url.startsWith('/')) {
      return `http://localhost:5000${url}`;
    } else {
      return `http://localhost:5000/uploads/${url}`;
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gray-50 min-h-screen relative">
      {/* Floating Cart Button */}
      <CartIcon showFloating={true} />

      {/* Header with Back Button */}
      <div className="flex items-center mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors font-medium text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          Back
        </button>
      </div>

      {/* Product Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-gray-900">{product.name}</h1>
        {product.description && (
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        {/* Image Section */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          {selectedImage ? (
            <>
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-lg mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={getImageUrl(selectedImage.image_url)}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    if (e.target.src !== "https://via.placeholder.com/400?text=No+Image") {
                      e.target.src = "https://via.placeholder.com/400?text=No+Image";
                    }
                  }}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => {
                    const imageUrl = getImageUrl(img.image_url);
                    return (
                      <img
                        key={idx}
                        src={imageUrl}
                        alt={`${product.name} ${idx + 1}`}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-20 h-20 object-cover rounded cursor-pointer border-2 flex-shrink-0 ${idx === selectedImageIndex
                          ? "border-green-600"
                          : "border-gray-200 hover:border-green-400"
                          }`}
                        onError={(e) => {
                          if (e.target.src !== "https://via.placeholder.com/80?text=No+Image") {
                            e.target.src = "https://via.placeholder.com/80?text=No+Image";
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <img
                src="https://via.placeholder.com/400?text=No+Image"
                alt="No image available"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <p className="text-3xl font-bold text-green-600 mb-4">
              {product.price ? `${product.price.toLocaleString("vi-VN")} VND` : "0 VND"}
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Shop:</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.vendors?.store_name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Stock:</span>
                <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>
              {product.category && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.category}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (product.stock > 0) {
                addToCart(product);
                showToast("Đã thêm vào giỏ hàng!", "success");
              } else {
                showWarning("Hết hàng", "Sản phẩm đã hết hàng!");
              }
            }}
            disabled={product.stock === 0}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${product.stock > 0
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            <ShoppingCart size={18} />
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>


      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
          <button
            onClick={() => navigate(`/review?productId=${product.product_id}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            Write a Review
          </button>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <>
            <div className="flex items-center gap-6 mb-6 pb-6 border-b">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                <div className="flex justify-center mb-2 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i <= Math.round(averageRating)
                          ? "text-green-600 fill-green-600"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.review_id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={
                        review.users?.avatar_url ||
                        "https://randomuser.me/api/portraits/women/44.jpg"
                      }
                      alt="user"
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.src = "https://randomuser.me/api/portraits/women/44.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">
                          {review.users?.full_name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i <= review.rating
                                  ? "text-green-600 fill-green-600"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No reviews yet</p>
            <p className="text-sm">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
