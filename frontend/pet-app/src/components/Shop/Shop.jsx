import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CartIcon from "./CartIcon.jsx";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  X
} from "lucide-react";

const ITEMS_PER_PAGE = 15;

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize state from URL params or defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || null);
  const [sortOption, setSortOption] = useState(searchParams.get("sort") || "Recommended");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        console.log("📦 Products fetched:", response.data.length, "items");
        // Debug: Log first product structure
        if (response.data.length > 0) {
          console.log("🔍 First product structure:", {
            product_id: response.data[0].product_id,
            name: response.data[0].name,
            product_images: response.data[0].product_images,
            has_images: !!response.data[0].product_images?.length
          });
        }
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync state to URL params
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (sortOption !== "Recommended") params.sort = sortOption;
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, sortOption, currentPage, setSearchParams]);

  // Reset page when filters change (only if not triggered by URL change itself)
  // Actually, with URL sync, we need to be careful. 
  // If user changes filter, we set page to 1.
  // But we need to distinguish between initial load and user action.
  // For simplicity, let's handle page reset in the handlers themselves.

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  // Bilingual Search Dictionary
  const SEARCH_DICTIONARY = {
     "chó": ["dog", "puppy", "cún"],
     "cún": ["dog", "puppy", "chó"],
     "chó con": ["puppy", "dog"],
     "dog": ["chó", "cún", "puppy"],
     "puppy": ["chó con", "cún", "dog"],

     // --- Cats (Mèo) ---
     "mèo": ["cat", "kitten", "miu"],
     "miu": ["cat", "kitten", "mèo"],
     "mèo con": ["kitten", "cat"],
     "cat": ["mèo", "miu", "kitten"],
     "kitten": ["mèo con", "miu", "cat"],

     // --- Rodents & Small Mammals (Gặm nhấm & Thú nhỏ) ---
     "hamster": ["chuột hamster", "chuột"],
     "chuột": ["hamster", "mouse", "rat"],
     "bọ ú": ["guinea pig", "chuột lang"],
     "chuột lang": ["guinea pig", "bọ ú"],
     "thỏ": ["rabbit", "bunny"],
     "rabbit": ["thỏ", "bunny"],
     "nhím": ["hedgehog"],
     "hedgehog": ["nhím"],
     "sóc": ["squirrel", "chinchilla"],
     "chinchilla": ["sóc"],

     // ===============================================
     // BIRDS - CHIM CẢNH
     // ===============================================
     "chim": ["bird", "parrot", "vẹt"],
     "bird": ["chim", "vẹt", "parrot"],
     "vẹt": ["parrot", "chim", "bird"],
     "parrot": ["vẹt", "chim", "bird"],

     // ===============================================
     // REPTILES & AMPHIBIANS - BÒ SÁT & LƯỠNG CƯ
     // ===============================================
     "bò sát": ["reptile", "turtle", "snake", "lizard"],
     "reptile": ["bò sát", "rùa", "rắn", "thằn lằn"],
     "rùa": ["turtle", "tortoise"],
     "turtle": ["rùa"],
     "rắn": ["snake"],
     "snake": ["rắn", "trăn"],

     // ===============================================
     // FISH - CÁ CẢNH
     // ===============================================
     "cá": ["fish"],
     "fish": ["cá"],

     // ===============================================
     // PRODUCT & SERVICE CATEGORIES
     // ===============================================

     // --- Food (Thức ăn) ---
     "food": ["thức ăn", "hạt", "pate", "đồ ăn", "dinh dưỡng"],
     "thức ăn": ["food", "hạt", "pate", "đồ ăn"],
     "hạt": ["food", "kibble", "thức ăn khô"],
     "pate": ["food", "wet food", "thức ăn ướt"],

     // --- Toys (Đồ chơi) ---
     "toy": ["đồ chơi"],
     "đồ chơi": ["toy"],

     // --- Accessories (Phụ kiện) ---
     "accessories": ["phụ kiện", "vòng cổ", "dây dắt", "bát ăn"],
     "phụ kiện": ["accessories"],
     "vòng cổ": ["collar", "accessories"],
     "collar": ["vòng cổ"],
     "dây dắt": ["leash", "accessories"],
     "leash": ["dây dắt"],

     // --- Housing (Chuồng, Nệm) ---
     "bed": ["giường", "nệm", "chuồng", "lồng"],
     "giường": ["bed", "nệm"],
     "nệm": ["bed", "giường"],
     "chuồng": ["cage", "crate", "bed"],
     "lồng": ["cage", "chuồng"],
     "cage": ["lồng", "chuồng"],

     // --- Clothing (Quần áo) ---
     "clothes": ["quần áo", "áo", "váy", "trang phục"],
     "quần áo": ["clothes"],
     "áo": ["shirt", "clothes"],

     // --- Grooming (Chăm sóc lông) ---
     "grooming": ["tắm", "cắt tỉa", "làm đẹp", "spa", "dầu gội", "sữa tắm"],
     "tắm": ["grooming", "shampoo", "sữa tắm"],
     "cắt tỉa": ["grooming"],
     "spa": ["grooming"],
     "dầu gội": ["shampoo", "grooming"],
     "sữa tắm": ["shampoo", "grooming"],

     // --- Health & Wellness (Sức khỏe) ---
     "health": ["sức khỏe", "y tế", "thuốc", "vitamin", "thực phẩm chức năng"],
     "sức khỏe": ["health"],
     "y tế": ["health", "medicine"],
     "thuốc": ["medicine", "health"],
     "medicine": ["thuốc", "y tế"],
     "vitamin": ["vitamin"],
     "vaccine": ["vắc-xin", "tiêm phòng"],
     "tiêm phòng": ["vaccine"],

     // ===============================================
     // GENERAL MODIFIERS - TÍNH TỪ CHUNG
     // ===============================================
     "con": ["puppy", "kitten", "nhỏ", "baby"], // e.g., "chó con"
     "nhỏ": ["small", "con", "mini"],
     "lớn": ["big", "large", "adult"],
     "trưởng thành": ["adult", "lớn"],
     "già": ["senior", "old"],
     "senior": ["già", "lớn tuổi"],
     "cho": ["for"], // "cho chó", "for dogs"
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

  // Filtering Logic
  const filteredProducts = products
    .filter((product) => {
      // Search Filter
      const searchTerms = getExpandedSearchTerms(searchQuery);
      const productName = product.name.toLowerCase();
      const productDesc = product.description ? product.description.toLowerCase() : "";

      // Check if ANY of the expanded terms match
      // For multi-word queries, we might want ALL original words to match (in some form)
      // But for simple "dog" -> "chó" translation, checking if any expanded term exists is good.
      // Let's try a robust approach: The product must match the query concept.
      // If query is "dog food", expanded is "dog", "chó", "food", "thức ăn".
      // We want products containing ("dog" OR "chó") AND ("food" OR "thức ăn").

      const queryWords = searchQuery.toLowerCase().split(/\s+/);
      const matchesSearch = queryWords.every(word => {
        const synonyms = SEARCH_DICTIONARY[word] || [];
        const allForms = [word, ...synonyms];
        return allForms.some(form =>
          productName.includes(form) || productDesc.includes(form)
        );
      });

      // Category Filter
      let matchesCategory = true;
      if (selectedCategory) {
        const categoryLower = selectedCategory.toLowerCase();
        const categorySynonyms = SEARCH_DICTIONARY[categoryLower] || [];
        const allCategoryForms = [categoryLower, ...categorySynonyms];

        // Flexible check: category_name, category.name, or category_id mapping
        const catName = product.category?.name || product.category_name || "";
        const catNameLower = catName.toLowerCase();

        // Check if product category matches ANY form of the selected category (English or Vietnamese)
        // OR if the product name OR description contains ANY form of the selected category
        matchesCategory = allCategoryForms.some(form =>
          catNameLower === form ||
          product.name.toLowerCase().includes(form) ||
          (product.description && product.description.toLowerCase().includes(form))
        );
      }

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "Price: Low to High":
          return (a.price || 0) - (b.price || 0);
        case "Price: High to Low":
          return (b.price || 0) - (a.price || 0);
        case "Rating":
          return (b.rating || 0) - (a.rating || 0);
        default: // Recommended
          return 0;
      }
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const categories = ["Dog", "Cat", "Bird", "Fish", "Reptile"];
  const sortOptions = ["Recommended", "Price: Low to High", "Price: High to Low", "Rating"];

  return (
    <div className="relative">
      <CartIcon showFloating={true} />
      <CustomerLayout currentPage="shop">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative w-full sm:max-w-xl">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-full border border-gray-200 pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-1 focus:ring-green-500 focus:outline-none shadow-sm"/>
            <Search
              className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400"
              size={18}/>
          </div>

          {/* Nút My Orders (Căn phải) */}
          <button
            onClick={() => navigate("/orders")} 
            className="flex-shrink-0 px-6 py-3 text-green-600 font-medium focus:ring-1 focus:ring-green-500
                       rounded-full shadow-sm transition-colors whitespace-nowrap hover:border-green-600 hover:bg-green-100">           
            My Orders
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Results <span className="text-sm font-normal text-gray-500 ml-2">({filteredProducts.length} items)</span>
            </h2>
            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange(null)}
                className="text-sm text-red-500 flex items-center gap-1 hover:underline">
                <X size={14} /> Clear Filter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === null
                ? "bg-green-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}>
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat === selectedCategory ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === cat
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {sortOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSortChange(option)}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 transition-all ${sortOption === option
                  ? "bg-green-100 text-green-800 border border-green-200 font-medium"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}>
                {option}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-green-600 font-medium hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {paginatedProducts.map((product) => {
                  // Find thumbnail (check for both true and 1)
                  const thumbnail = product.product_images?.find(
                    (img) => img.is_thumbnail === true || img.is_thumbnail === 1
                  ) || product.product_images?.[0]; // Fallback to first image if no thumbnail

                  // Build image URL with proper handling
                  let imageUrl = "https://via.placeholder.com/200?text=No+Image";
                  if (thumbnail?.image_url) {
                    const url = String(thumbnail.image_url).trim();
                    // Remove any leading/trailing whitespace and ensure proper format
                    if (url) {
                      if (url.startsWith('http://') || url.startsWith('https://')) {
                        imageUrl = url;
                      } else if (url.startsWith('/')) {
                        // Ensure URL starts with /uploads/ if it's just /uploads
                        imageUrl = `http://localhost:5000${url}`;
                      } else {
                        // If no leading slash, assume it's a filename and add /uploads/
                        imageUrl = `http://localhost:5000/uploads/${url}`;
                      }
                    }
                  } else {
                    // Debug: Log when no image URL is found
                    if (process.env.NODE_ENV === 'development') {
                      console.warn(`⚠️ No image URL for product ${product.product_id} (${product.name}):`, {
                        has_product_images: !!product.product_images,
                        product_images_length: product.product_images?.length || 0,
                        product_images: product.product_images,
                        thumbnail: thumbnail
                      });
                    }
                  }

                  return (
                    <div
                      key={product.product_id}
                      onClick={() => navigate(`/shop/${product.product_id}`)}
                      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-2 sm:p-3 cursor-pointer group border border-transparent hover:border-green-100">
                      <div className="w-full h-32 sm:h-40 lg:h-48 bg-gray-100 rounded-lg mb-2 sm:mb-3 flex items-center justify-center overflow-hidden relative">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            console.error(`Failed to load image for product ${product.product_id}:`, {
                              attemptedUrl: e.target.src,
                              product_images: product.product_images,
                              thumbnail
                            });
                            if (e.target.src !== "https://via.placeholder.com/200?text=No+Image") {
                              e.target.src = "https://via.placeholder.com/200?text=No+Image";
                            }
                          }}
                          onLoad={() => {
                            // Debug: Log successful image loads
                            if (process.env.NODE_ENV === 'development') {
                              console.log(`✅ Image loaded for product ${product.product_id}:`, imageUrl);
                            }
                          }}/>
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-gray-800 line-clamp-2 h-8 sm:h-10 lg:h-12 mb-1 group-hover:text-green-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
                        {product.vendors?.store_name || "PetCare Shop"}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-green-700">
                          {product.price ? `${product.price.toLocaleString("vi-VN")} VND` : "0 VND"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${currentPage === page
                      ? "bg-green-600 text-white shadow-md font-bold"
                      : "border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600"
                      }`}>
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </CustomerLayout>
    </div>
  );
};

export default Shop;
