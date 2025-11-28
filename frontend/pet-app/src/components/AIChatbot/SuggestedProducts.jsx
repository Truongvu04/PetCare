import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig.js";
import { Package, Loader2 } from "lucide-react";

const SuggestedProducts = ({ petId, petSpecies }) => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bilingual Search Dictionary - same as Shop page
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
    "food": ["thức ăn", "đồ ăn"],
    "thức ăn": ["food", "meal"],
    "toy": ["đồ chơi"],
    "đồ chơi": ["toy"],
    "accessory": ["phụ kiện"],
    "phụ kiện": ["accessory"]
  };

  // Helper to remove Vietnamese accents (for accent-insensitive search)
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
      'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
      'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
      'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
      'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
      'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
      'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
      'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
      'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
      'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
      'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
      'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
      'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
      'Đ': 'D'
    };
    return str.split('').map(char => accents[char] || char).join('').toLowerCase();
  };

  // Helper to get expanded search terms
  const getExpandedSearchTerms = (query) => {
    const terms = query.toLowerCase().split(/\s+/);
    const expandedTerms = new Set(terms);

    terms.forEach(term => {
      if (SEARCH_DICTIONARY[term]) {
        SEARCH_DICTIONARY[term].forEach(t => expandedTerms.add(t));
      }
    });

    return Array.from(expandedTerms);
  };

  // Load all products once
  useEffect(() => {
    loadAllProducts();
  }, []);

  // Filter products when petId or petSpecies changes
  useEffect(() => {
    if (petId && petSpecies && allProducts.length > 0) {
      filterProducts();
    } else {
      setFilteredProducts([]);
    }
  }, [petId, petSpecies, allProducts]);

  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products");
      setAllProducts(response.data || []);
    } catch (err) {
      console.error("Error loading products:", err);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!petSpecies || allProducts.length === 0) {
      setFilteredProducts([]);
      return;
    }

    // Get expanded search terms for pet species
    const speciesLower = petSpecies.toLowerCase();
    const categorySynonyms = SEARCH_DICTIONARY[speciesLower] || [];
    const allCategoryForms = [speciesLower, ...categorySynonyms];

    // Filter products using same logic as Shop page
    const filtered = allProducts.filter((product) => {
      const catName = product.category?.name || product.category_name || product.category || "";
      const catNameLower = catName.toLowerCase();
      const productName = (product.name || "").toLowerCase();
      const productDesc = (product.description || "").toLowerCase();
      
      // Normalize for accent-insensitive search
      const catNameNormalized = removeVietnameseAccents(catNameLower);
      const productNameNormalized = removeVietnameseAccents(productName);
      const productDescNormalized = removeVietnameseAccents(productDesc);

      // Check if product matches any form of the pet species
      return allCategoryForms.some(form => {
        const formLower = form.toLowerCase();
        const formNormalized = removeVietnameseAccents(formLower);
        
        return (
          catNameLower === formLower ||
          catNameNormalized === formNormalized ||
          productName.includes(formLower) ||
          productNameNormalized.includes(formNormalized) ||
          productDesc.includes(formLower) ||
          productDescNormalized.includes(formNormalized)
        );
      });
    });

    // Limit to 10 products
    setFilteredProducts(filtered.slice(0, 10));
  };

  const handleProductClick = (productId) => {
    navigate(`/shop/${productId}`);
  };

  // Build image URL helper
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "https://via.placeholder.com/200?text=No+Image";
    const url = imageUrl.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    } else if (url.startsWith("/")) {
      return `http://localhost:5000${url}`;
    } else {
      return `http://localhost:5000/uploads/${url}`;
    }
  };

  if (!petId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-green-600" />
            Gợi ý sản phẩm
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 min-h-0 overflow-hidden">
          <div className="text-center">
            <Package size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Chọn thú cưng để xem gợi ý sản phẩm phù hợp
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col min-h-0 overflow-hidden w-full">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package size={20} className="text-green-600" />
          Gợi ý sản phẩm
        </h3>
        {petSpecies && (
          <p className="text-xs text-gray-500 mt-1">
            Cho {petSpecies}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 overflow-x-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-green-600 mb-3" />
            <p className="text-sm text-gray-500">Đang tải sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Package size={48} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 text-center">
              Không có sản phẩm gợi ý cho thú cưng này
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const thumbnail = product.product_images?.find(
                (img) => img.is_thumbnail === true || img.is_thumbnail === 1
              ) || product.product_images?.[0];

              return (
                <div
                  key={product.product_id}
                  onClick={() => handleProductClick(product.product_id)}
                  className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all hover:border-green-300 group"
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(thumbnail?.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          if (e.target.src !== "https://via.placeholder.com/200?text=No+Image") {
                            e.target.src = "https://via.placeholder.com/200?text=No+Image";
                          }
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-2 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors mb-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                        {product.vendors?.store_name || "PetCare Shop"}
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        {product.price ? `${product.price.toLocaleString("vi-VN")} VND` : "0 VND"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedProducts;
