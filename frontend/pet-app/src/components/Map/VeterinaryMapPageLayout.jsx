import React, { useState, useEffect, useCallback } from 'react';
import GeoapifyMapComponent from './GeoapifyMapComponent';
import VeterinaryListSidebar from './VeterinaryListSidebar';
import LocationDebugInfo from './LocationDebugInfo';
import { useGeolocation } from '../../hooks/useGeolocation';
import { geoapifyService } from '../../services/geoapifyService';

const VeterinaryMapPageLayout = () => {
  const { location, loading: locationLoading, error: locationError, forceGetLocation } = useGeolocation();
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15000);
  const [zoomLevel] = useState(13);
  const [dataSource, setDataSource] = useState('combined');
  const [selectedClinic, setSelectedClinic] = useState(null);
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

  // Calculate distance for clinics when location is available
  useEffect(() => {
    if (location && clinics.length > 0 && !clinics[0]?.distance) {
      const clinicsWithDistance = clinics.map(clinic => ({
        ...clinic,
        distance: geoapifyService.calculateDistance(
          location.latitude,
          location.longitude,
          clinic.coordinates.lat,
          clinic.coordinates.lng
        )
      }));
      
      // Sort by distance
      clinicsWithDistance.sort((a, b) => a.distance - b.distance);
      setClinics(clinicsWithDistance);
    }
  }, [location, clinics]);

  const handleSearch = () => {
    if (location) {
      fetchClinics(location.latitude, location.longitude, searchQuery);
    } else {
      setError('Vui lòng cho phép truy cập vị trí để tìm kiếm');
    }
  };

  const handleLocationRequest = () => {
    forceGetLocation();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
  };

  const handleMarkerClick = (clinic) => {
    setSelectedClinic(clinic);
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <span className="text-3xl">🏥</span>
              Liên kết Hồ sơ Thú y của bạn
            </h1>
            <p className="text-blue-100">Tìm kiếm phòng khám trên bản đồ hoặc chọn từ danh sách để liên kết hồ sơ của bạn</p>
          </div>

          {/* Search Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-3 items-center">
              {/* Search Input */}
              <div className="relative flex-grow w-full lg:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-0 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:bg-white transition-all duration-200 shadow-lg text-sm"
                  placeholder="Tìm kiếm phòng khám thú y..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 w-full lg:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/30 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Bộ lọc
                </button>
                
                <button
                  onClick={handleSearch}
                  disabled={loading || !location}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-105 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tìm...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Nguồn dữ liệu</label>
                    <select
                      value={dataSource}
                      onChange={(e) => setDataSource(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/90 text-gray-900 border-0 focus:ring-2 focus:ring-white text-sm"
                    >
                      <option value="combined">Tất cả nguồn</option>
                      <option value="geoapify">Geoapify</option>
                      <option value="local">Dữ liệu local</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Bán kính tìm kiếm</label>
                    <select
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white/90 text-gray-900 border-0 focus:ring-2 focus:ring-white text-sm"
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

      {/* Status Messages */}
      <div className="px-4 py-2">
        <div className="max-w-7xl mx-auto">
          {locationError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg shadow-sm mb-2">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-red-700">
                    <strong>Lỗi vị trí:</strong> {locationError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg shadow-sm mb-2">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-red-700">
                    <strong>Lỗi:</strong> {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!location && !locationLoading && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <p className="text-amber-700 font-medium text-sm">
                      Cần quyền truy cập vị trí để tìm phòng khám gần bạn
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLocationRequest}
                  className="ml-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 font-medium transition-all duration-200 shadow-lg transform hover:scale-105 text-sm"
                >
                  Cho phép vị trí
                </button>
              </div>
            </div>
          )}

           {location && (
             <div className={`bg-gradient-to-r ${location.isFallback ? 'from-yellow-50 to-orange-50 border-yellow-400' : 'from-green-50 to-blue-50 border-green-400'} border-l-4 p-3 rounded-r-lg shadow-sm mb-2`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center">
                   <div className="flex-shrink-0">
                     <svg className={`h-4 w-4 ${location.isFallback ? 'text-yellow-400' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                   </div>
                   <div className="ml-2">
                     <p className={`${location.isFallback ? 'text-yellow-700' : 'text-green-700'} font-medium text-sm`}>
                       {location.isFallback ? '📍 Sử dụng vị trí mặc định' : '✅ Đã xác định vị trí của bạn'} • 
                       Hiển thị {clinics.length} phòng khám trong bán kính {getRadiusText(searchRadius)} • 
                       Nguồn: {getDataSourceText(dataSource)}
                     </p>
                     {location.isFallback && (
                       <p className="text-yellow-600 text-xs mt-1">
                         Nhấn "Cho phép vị trí" để tìm phòng khám gần bạn chính xác hơn
                       </p>
                     )}
                   </div>
                 </div>
                 <div className={`text-xs ${location.isFallback ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100'} px-2 py-1 rounded-full`}>
                   {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Clinic List */}
        <div className="w-full lg:w-96 h-64 lg:h-full flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white">
          <VeterinaryListSidebar
            clinics={clinics}
            selectedClinic={selectedClinic}
            onClinicSelect={handleClinicSelect}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 relative min-h-0">
          <GeoapifyMapComponent
            clinics={clinics}
            userLocation={location}
            zoomLevel={zoomLevel}
            onLocationRequest={handleLocationRequest}
            loading={locationLoading}
            selectedClinic={selectedClinic}
            onMarkerClick={handleMarkerClick}
            showPopup={false}
          />
         </div>
       </div>

       {/* Debug Info - Only in development */}
       <LocationDebugInfo 
         location={location}
         error={locationError}
         loading={locationLoading}
       />
     </div>
   );
 };
 
 export default VeterinaryMapPageLayout;
