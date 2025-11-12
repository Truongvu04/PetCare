import React, { useState, useEffect, useCallback } from 'react';
import GeoapifyMapComponent from './GeoapifyMapComponent';
import EnhancedSearchComponent from './EnhancedSearchComponent';
import { useGeolocation } from '../../hooks/useGeolocation';
import { geoapifyService } from '../../services/geoapifyService';

const VeterinaryMapApp = () => {
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15000);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const fetchClinics = useCallback(async (lat, lng, query = '') => {
    setLoading(true);
    setError(null);
    
    try {
      // Sử dụng enhanced search mới
      const result = await geoapifyService.enhancedSearch({
        query: query,
        latitude: lat,
        longitude: lng,
        radius: searchRadius,
        searchType: 'auto'
      });
      
      if (result.success) {
        setClinics(result.data || []);
        setSearchResults(result);
        console.log(`Tìm thấy ${result.data?.length || 0} phòng khám`, result);
      } else {
        setError('Không thể tải danh sách phòng khám');
        setClinics([]);
      }
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setClinics([]);
    } finally {
      setLoading(false);
    }
  }, [searchRadius]);

  useEffect(() => {
    if (location) {
      fetchClinics(location.latitude, location.longitude);
    }
  }, [location, searchRadius, fetchClinics]);

  const handleEnhancedSearch = async (searchOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geoapifyService.smartSearch({
        ...searchOptions,
        radius: searchRadius
      });
      
      if (result.success) {
        setClinics(result.data || []);
        setSearchResults(result);
        
        // Nếu có location từ search, cập nhật map center
        if (result.location) {
          setSelectedLocation(result.location);
          setZoomLevel(14);
        }
        
        console.log(`Tìm thấy ${result.data?.length || 0} phòng khám`, result);
        
        // Hiển thị thông tin về search intent và expansion
        if (result.searchIntent) {
          console.log('Search intent:', result.searchIntent);
        }
        if (result.expanded) {
          console.log('Search was expanded to find more results');
        }
      } else {
        setError(result.error || 'Không thể tải danh sách phòng khám');
        setClinics([]);
      }
    } catch (err) {
      console.error('Error in smart search:', err);
      setError(err.message || 'Có lỗi xảy ra khi tìm kiếm');
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (coordinates, address) => {
    setSelectedLocation({
      coordinates: coordinates,
      address: address
    });
    setZoomLevel(14);
    
    // Tìm phòng khám gần location được chọn
    fetchClinics(coordinates.lat, coordinates.lng);
  };

  const handleLocationRequest = () => {
    getCurrentLocation();
    setSelectedLocation(null);
    setZoomLevel(13);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header với gradient đẹp */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            {/* <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <span className="text-3xl">🏥</span>
              Tìm Phòng Khám Thú Y
            </h1> */}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col gap-6">

        {/* Enhanced Search Component */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="flex-grow">
            <EnhancedSearchComponent
              onSearch={handleEnhancedSearch}
              onLocationSelect={handleLocationSelect}
              userLocation={location}
              loading={loading}
              searchRadius={searchRadius}
            />
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="5000">5km</option>
              <option value="10000">10km</option>
              <option value="15000">15km</option>
              <option value="25000">25km</option>
            </select>
          </div>
        </div>

        {locationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <strong>Lỗi vị trí:</strong> {locationError}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {!location && !locationLoading && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Cần quyền truy cập vị trí để tìm phòng khám gần bạn</span>
              <button
                onClick={handleLocationRequest}
                className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Cho phép vị trí
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Bản đồ phòng khám ({clinics.length} kết quả)
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedLocation ? (
                <div>
                  <div className="font-medium">Tìm kiếm tại:</div>
                  <div>{selectedLocation.address}</div>
                </div>
              ) : location ? (
                <div>
                  <div className="font-medium">Vị trí hiện tại:</div>
                  <div>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</div>
                </div>
              ) : (
                <div>Chưa có vị trí</div>
              )}
            </div>
          </div>
          
          <GeoapifyMapComponent
            clinics={clinics}
            userLocation={selectedLocation?.coordinates ? {
              latitude: selectedLocation.coordinates.lat,
              longitude: selectedLocation.coordinates.lng,
              isSearchLocation: true
            } : location}
            zoomLevel={zoomLevel}
            onLocationRequest={handleLocationRequest}
            loading={locationLoading}
          />
        </div>

        {clinics.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Danh sách phòng khám ({clinics.length} kết quả)
              </h3>
              
              {/* Search Results Info */}
              {searchResults?.expanded && (
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Đã mở rộng tìm kiếm
                </div>
              )}
              
              {searchResults?.searchIntent && (
                <div className="text-xs text-gray-500">
                  Loại tìm kiếm: {searchResults.searchIntent.type === 'address' ? 'Địa chỉ' : 
                                 searchResults.searchIntent.type === 'business' ? 'Tên cửa hàng' : 'Từ khóa'}
                </div>
              )}
            </div>

            {/* Top Rated Clinics First */}
            {clinics.filter(c => c.isTopRated).length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3 text-yellow-600 flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  Phòng khám được đánh giá cao
                </h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clinics.filter(c => c.isTopRated).slice(0, 3).map((clinic, index) => (
                    <div key={clinic.id || index} className="border-2 border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-yellow-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg mb-2">{clinic.name}</h4>
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">TOP</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                      
                      {clinic.rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{clinic.rating}</span>
                          <span className="text-sm text-gray-500">({clinic.reviews})</span>
                        </div>
                      )}
                      
                      {clinic.travelInfo && (
                        <p className="text-sm mb-2 text-blue-600">🚗 {clinic.travelInfo.formatted}</p>
                      )}
                      
                      <div className={`inline-block px-2 py-1 text-xs rounded-full ${
                        clinic.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {clinic.businessStatus || (clinic.isOpen ? 'Mở cửa' : 'Đóng cửa')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Clinics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clinics.filter(c => !c.isTopRated).slice(0, 6).map((clinic, index) => (
                <div key={clinic.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-lg mb-2">{clinic.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                  
                  {clinic.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{clinic.rating}</span>
                      <span className="text-sm text-gray-500">({clinic.reviews})</span>
                    </div>
                  )}
                  
                  {clinic.phone && clinic.phone !== 'Chưa có thông tin' && (
                    <p className="text-sm mb-2">📞 {clinic.phone}</p>
                  )}
                  
                  {clinic.openingHours && (
                    <p className="text-sm mb-2">🕒 {clinic.openingHours}</p>
                  )}

                  {clinic.travelInfo && (
                    <p className="text-sm mb-2 text-blue-600">🚗 {clinic.travelInfo.formatted}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    {clinic.source && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                        {clinic.source}
                      </span>
                    )}
                    
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      clinic.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {clinic.businessStatus || (clinic.isOpen ? 'Mở cửa' : 'Đóng cửa')}
                    </div>
                  </div>

                  {clinic.score && (
                    <div className="mt-2 text-xs text-gray-500">
                      Điểm chất lượng: {(clinic.score * 100).toFixed(0)}/100
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {clinics.filter(c => !c.isTopRated).length > 6 && (
              <div className="text-center mt-4">
                <p className="text-gray-600">Và {clinics.filter(c => !c.isTopRated).length - 6} phòng khám khác trên bản đồ</p>
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">{clinics.length}</div>
                  <div className="text-xs text-gray-500">Tổng số</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {clinics.filter(c => c.isOpen).length}
                  </div>
                  <div className="text-xs text-gray-500">Đang mở cửa</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">
                    {clinics.filter(c => c.rating >= 4.5).length}
                  </div>
                  <div className="text-xs text-gray-500">Đánh giá cao</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {clinics.filter(c => c.distance && c.distance <= 5).length}
                  </div>
                  <div className="text-xs text-gray-500">Trong 5km</div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default VeterinaryMapApp;