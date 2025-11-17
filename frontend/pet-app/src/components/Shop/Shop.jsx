import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import CartIcon from "./CartIcon.jsx";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import {
  ChevronDown,
  Search,
} from "lucide-react";

const Shop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="relative">
      <CartIcon showFloating={true} />
      <CustomerLayout currentPage="shop">
          <div className="mb-8 flex items-center gap-4">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 pl-12 pr-10 py-3 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
              <Search
                className="absolute left-4 top-3 text-gray-400 mt-[2px]"
                size={20}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Results</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {["Dog", "Cat", "Bird", "Fish", "Reptile"].map((cat) => (
                <button
                  key={cat}
                  className="bg-green-50 text-green-700 border border-green-100 px-4 py-1.5 rounded-full text-sm hover:bg-green-100"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {["Sort: Recommended", "Price", "Rating", "Delivery"].map((filter) => (
                <button
                  key={filter}
                  className="bg-green-50 text-green-700 border border-green-100 px-4 py-1.5 rounded-full text-sm flex items-center gap-1 hover:bg-green-100">
                  {filter} <ChevronDown size={18} className="text-gray-500" />
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <div className="grid grid-cols-5 gap-6">
              {products
                .filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((product) => {
                  // Find thumbnail (check for both true and 1)
                  const thumbnail = product.product_images?.find(
                    (img) => img.is_thumbnail === true || img.is_thumbnail === 1
                  ) || product.product_images?.[0]; // Fallback to first image if no thumbnail
                  
                  // Build image URL with proper handling
                  let imageUrl = "https://via.placeholder.com/200?text=No+Image";
                  if (thumbnail?.image_url) {
                    const url = thumbnail.image_url.trim();
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                      imageUrl = url;
                    } else if (url.startsWith('/')) {
                      imageUrl = `http://localhost:5000${url}`;
                    } else {
                      imageUrl = `http://localhost:5000/uploads/${url}`;
                    }
                  }
                  
                  return (
                    <div
                      key={product.product_id}
                      onClick={() => navigate(`/shop/${product.product_id}`)}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-3 cursor-pointer"
                    >
                      <div className="w-full h-40 bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (e.target.src !== "https://via.placeholder.com/200?text=No+Image") {
                              e.target.src = "https://via.placeholder.com/200?text=No+Image";
                            }
                          }}
                        />
                      </div>
                      <h3 className="font-medium text-gray-800">
                        {product.name}
                      </h3>
                      <p className="text-sm text-green-600">
                        {product.vendors?.store_name || "PetCare Shop"}
                      </p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        ${(product.price / 1000).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-3 text-sm">
            <button className="text-gray-400 hover:text-gray-600">‹</button>
            <button className="text-green-700 font-semibold">1</button>
            <button className="text-gray-500 hover:text-green-600">2</button>
            <button className="text-gray-500 hover:text-green-600">3</button>
            <button className="text-gray-500 hover:text-green-600">›</button>
          </div>
      </CustomerLayout>
    </div>
  );
};

export default Shop;
