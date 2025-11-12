import React, { useState, useEffect, useCallback } from 'react';
import GeoapifyMapComponent from './GeoapifyMapComponent';
import { useGeolocation } from '../../hooks/useGeolocation';
import { geoapifyService } from '../../services/geoapifyService';

const EnhancedVeterinaryMapApp = () => {
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15000);
  const [zoomLevel] = useState(13);
  const [dataSource, setDataSource] = useState('combined');
  const [showFilters, setShowFilters] = useState(false);

  const fetchClinics = useCallback(async (lat, lng, query = '') => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (dataSource) {
        case 'geoapify':
          result = await geoapifyService.getVeterinaryClinics(lat, lng, searchRadius, query);
          break;
        case 'local':
          result = await geoapifyService.getLocalVets(lat, lng, searchRadius / 1000, query);
          break;
        case 'combined':
        default:
          result = await geoapifyService.getCombinedResults(lat, lng, searchRadius, query);
          break;
      }
      
      if (result.success) {
        setClinics(result.data || []);
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
  }, [searchRadius, dataSource]);

  useEffect(() => {
    if (location) {
      fetchClinics(location.latitude, location.longitude);
    }
  }, [location, searchRadius, dataSource, fetchClinics]);

  const handleSearch = () => {
    if (location) {
      fetchClinics(location.latitude, location.longitude, searchQuery);
    } else {
      setError('Vui lòng cho phép truy cập vị trí để tìm kiếm');
    }
  };

  const handleLocationRequest = () => {
    getCurrentLocation();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRadiusText = (radius) => {
    return radius >= 1000 ? `${radius / 1000}km` : `${radius}m`;
  };

  const getDataSourceText = (source) => {
    switch (source) {
      case 'geoapify': return 'Geoapify';
      case 'local': return 'Dữ liệu local';
      case 'combined': return 'Tất cả nguồn';
      default: return 'Tất cả nguồn';
    }
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

          {/* Search Controls với design đẹp */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-grow w-full lg:w-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:bg-white transition-all duration-200 shadow-lg"
                  placeholder="Tìm kiếm phòng khám thú y..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm border border-white/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Bộ lọc
                </button>
                
                <button
                  onClick={handleSearch}
                  disabled={loading || !location}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tìm...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Tìm kiếm
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Nguồn dữ liệu</label>
                    <select
                      value={dataSource}
                      onChange={(e) => setDataSource(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-900 border-0 focus:ring-2 focus:ring-white"
                    >
                      <option value="combined">Tất cả nguồn</option>
                      <option value="geoapify">Geoapify</option>
                      <option value="local">Dữ liệu local</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bán kính tìm kiếm</label>
                    <select
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-900 border-0 focus:ring-2 focus:ring-white"
                    >
                      <option value="5000">5km</option>
                      <option value="10000">10km</option>
                      <option value="15000">15km</option>
                      <option value="25000">25km</option>
                      <option value="50000">50km</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages với design đẹp */}
      <div className="px-6 py-4 space-y-3">
        <div className="max-w-7xl mx-auto">
          {locationError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Lỗi vị trí:</strong> {locationError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Lỗi:</strong> {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!location && !locationLoading && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 rounded-r-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-amber-700 font-medium">
                      Cần quyền truy cập vị trí để tìm phòng khám gần bạn
                    </p>
                    <p className="text-amber-600 text-sm mt-1">
                      Ứng dụng sẽ sử dụng vị trí của bạn để tìm các phòng khám thú y gần nhất
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLocationRequest}
                  className="ml-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Cho phép vị trí
                  </div>
                </button>
              </div>
            </div>
          )}

          {location && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-green-700 font-medium">
                      ✅ Đã xác định vị trí của bạn
                    </p>
                    <p className="text-green-600 text-sm">
                      Hiển thị {clinics.length} phòng khám trong bán kính {getRadiusText(searchRadius)} • 
                      Nguồn: {getDataSourceText(dataSource)}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container với shadow đẹp */}
      <div className="flex-1 px-6 pb-6">
        <div className="max-w-7xl mx-auto h-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full border border-gray-200">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🗺️</span>
                Bản đồ phòng khám ({clinics.length} kết quả)
              </h2>
              {location && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Vị trí của bạn</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Phòng khám</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-full relative">
              <GeoapifyMapComponent
                clinics={clinics}
                userLocation={location}
                zoomLevel={zoomLevel}
                onLocationRequest={handleLocationRequest}
                loading={locationLoading}
              />
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
};

export default EnhancedVeterinaryMapApp;