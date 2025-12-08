import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig.js";

// Bilingual Search Dictionary (same as Shop.jsx)
const SEARCH_DICTIONARY = {
  "dog": ["chó", "cún"],
  "chó": ["dog", "puppy"],
  "cat": ["mèo", "miu"],
  "mèo": ["cat", "kitten"],
  "bird": ["chim", "vẹt"],
  "chim": ["bird", "parrot"],
  "fish": ["cá"],
  "cá": ["fish"],
  "reptile": ["bò sát", "rùa", "trăn"],
  "bò sát": ["reptile", "turtle", "snake"],
};

/**
 * Remove Vietnamese accents
 */
const removeVietnameseAccents = (str) => {
  if (!str) return "";
  const accents = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
  };
  return str.split('').map(char => accents[char] || char).join('').toLowerCase();
};

const SuggestedProducts = ({ petId, petSpecies }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!petSpecies || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    const speciesLower = petSpecies.toLowerCase();
    const normalizedSpecies = removeVietnameseAccents(speciesLower);
    const synonyms = SEARCH_DICTIONARY[speciesLower] || [];
    const allSearchTerms = [speciesLower, normalizedSpecies, ...synonyms];

    const filtered = products.filter((product) => {
      const category = (product.category || "").toLowerCase();
      const name = (product.name || "").toLowerCase();
      const description = (product.description || "").toLowerCase();

      const normalizedCategory = removeVietnameseAccents(category);
      const normalizedName = removeVietnameseAccents(name);
      const normalizedDescription = removeVietnameseAccents(description);

      return allSearchTerms.some((term) => {
        return (
          normalizedCategory.includes(term) ||
          normalizedName.includes(term) ||
          normalizedDescription.includes(term) ||
          category.includes(term) ||
          name.includes(term) ||
          description.includes(term)
        );
      });
    });

    setFilteredProducts(filtered.slice(0, 10));
  }, [petSpecies, products]);

  if (!petId || !petSpecies) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-white rounded-lg border border-gray-200 min-h-0 flex-shrink-0">
        <p className="text-gray-500 text-sm text-center">
          Chọn thú cưng để xem gợi ý sản phẩm phù hợp
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-white rounded-lg border border-gray-200 min-h-0 flex-shrink-0">
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-white rounded-lg border border-gray-200 min-h-0 flex-shrink-0">
        <p className="text-gray-500 text-sm text-center">
          Không có sản phẩm phù hợp
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 min-h-0 flex-shrink-0 w-96">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800">Sản phẩm gợi ý</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredProducts.map((product) => {
          const priceInVND = parseFloat(product.price || 0).toLocaleString("vi-VN");
          
          // Get image URL from product_images array (API returns product_images, not images)
          let imageUrl = null;
          if (product.product_images && product.product_images.length > 0) {
            // Find thumbnail first, or use first image
            const thumbnail = product.product_images.find(img => img.is_thumbnail);
            imageUrl = thumbnail ? thumbnail.image_url : product.product_images[0].image_url;
          }
          
          // Construct full image URL - images are stored as /uploads/filename.jpg
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const fullImageUrl = imageUrl 
            ? (imageUrl.startsWith('http') 
                ? imageUrl 
                : `${baseURL}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`)
            : null;

          return (
            <div
              key={product.product_id}
              onClick={() => navigate(`/shop/${product.product_id}`)}
              className="flex space-x-3 p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {fullImageUrl ? (
                  <img
                    src={fullImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide image and show placeholder text if image fails to load
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="image-placeholder w-full h-full flex items-center justify-center text-gray-400 text-xs" style={{ display: fullImageUrl ? 'none' : 'flex' }}>
                  No Image
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {product.name}
                </h4>
                <p className="text-green-600 font-semibold text-sm mt-1">
                  {priceInVND} VND
                </p>
                {product.vendors?.store_name && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {product.vendors.store_name}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedProducts;

