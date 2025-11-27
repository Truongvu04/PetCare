import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Store, Filter } from "lucide-react";
import api from "../../api/axiosConfig.js";

const VendorListings = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vendors, searchQuery, locationFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (locationFilter) params.append("location", locationFilter);

      const res = await api.get(`/v1/vendor/list?${params.toString()}`);
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vendors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.store_name?.toLowerCase().includes(query) ||
          v.description?.toLowerCase().includes(query)
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((v) =>
        v.address?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredVendors(filtered);
  };

  const handleSearch = () => {
    fetchVendors();
  };

  const handleViewShop = (vendorId) => {
    navigate(`/shop?vendor=${vendorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách cửa hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Danh sách Cửa hàng
          </h1>
          <p className="text-sm text-green-700">
            Khám phá các cửa hàng thú cưng uy tín trong khu vực của bạn
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm cửa hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Lọc theo địa điểm..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Vendor Grid */}
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Store className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg mb-2">
              {vendors.length === 0
                ? "Chưa có cửa hàng nào"
                : "Không tìm thấy cửa hàng phù hợp"}
            </p>
            <p className="text-gray-500 text-sm">
              {vendors.length === 0
                ? "Hãy thử lại sau"
                : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.vendor_id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Vendor Logo/Image */}
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={vendor.store_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="text-green-600" size={64} />
                  )}
                </div>

                {/* Vendor Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {vendor.store_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {vendor.description || "Chưa có mô tả"}
                  </p>

                  {/* Rating */}
                  {vendor.rating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                      <span className="text-sm font-medium text-gray-900">
                        {vendor.rating}
                      </span>
                      {vendor.reviewCount > 0 && (
                        <span className="text-xs text-gray-500">
                          ({vendor.reviewCount})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  {vendor.address && (
                    <div className="flex items-start gap-2 mb-3 text-sm text-gray-600">
                      <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                      <span className="line-clamp-1">{vendor.address}</span>
                    </div>
                  )}

                  {/* Products Preview */}
                  {vendor.products && vendor.products.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">
                        {vendor.products.length} sản phẩm
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {vendor.products.slice(0, 3).map((product) => (
                          <span
                            key={product.product_id}
                            className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
                          >
                            {product.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Shop Button */}
                  <button
                    onClick={() => handleViewShop(vendor.vendor_id)}
                    className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                  >
                    Xem cửa hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorListings;

