import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GoongMapComponent from './GoongMapComponent';
import { useGeolocation } from '../../hooks/useGeolocation';
import { goongService } from '../../services/goongService';

const GoongVetMapPage = () => {
  const navigate = useNavigate();
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [customLocation, setCustomLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const debounceTimeout = React.useRef(null);

  const currentLocation = customLocation || location;

  const fetchClinics = useCallback(async (lat, lng, query = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await goongService.getVeterinaryClinics(lat, lng, searchRadius, query);
      
      if (result.success) {
        setClinics(result.data || []);
        console.log(`Tìm thấy ${result.data?.length || 0} phòng khám`);
      } else {
        setError(result.message || 'Không thể tải danh sách phòng khám');
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
    if (currentLocation) {
      fetchClinics(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation, searchRadius, fetchClinics]);

  const handleSearch = () => {
    if (currentLocation) {
      fetchClinics(currentLocation.latitude, currentLocation.longitude, searchQuery);
    } else {
      setError('Vui lòng cho phép truy cập vị trí để tìm kiếm');
    }
  };

  const handleAddressInputChange = (value) => {
    setAddressInput(value);
    
    if (value.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const response = await fetch(
          `https://rsapi.goong.io/Place/AutoComplete?api_key=${import.meta.env.VITE_GOONG_API_KEY}&input=${encodeURIComponent(value)}&limit=5`
        );
        const data = await response.json();
        
        if (data.predictions) {
          const suggestions = data.predictions.map(p => ({
            name: p.structured_formatting?.main_text || p.description,
            address: p.description,
            place_id: p.place_id
          }));
          setAddressSuggestions(suggestions);
        }
      } catch (err) {
        console.error('Error searching address:', err);
      } finally {
        setSearchingAddress(false);
      }
    }, 500);
  };

  const handleSelectAddress = async (suggestion) => {
    setSearchingAddress(true);
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/Detail?api_key=${import.meta.env.VITE_GOONG_API_KEY}&place_id=${suggestion.place_id}`
      );
      const data = await response.json();
      
      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        setCustomLocation({
          latitude: lat,
          longitude: lng,
          isCustom: true,
          address: suggestion.address || suggestion.name
        });
        setShowLocationModal(false);
        setAddressInput('');
        setAddressSuggestions([]);
        setError(null);
      } else {
        setError('Không thể lấy tọa độ của địa điểm này');
      }
    } catch (err) {
      console.error('Error getting place details:', err);
      setError('Lỗi khi lấy thông tin địa điểm');
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleResetLocation = () => {
    setCustomLocation(null);
    getCurrentLocation();
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleLocationRequest = () => {
    getCurrentLocation();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
  };

  const getRadiusText = (radius) => {
    return radius >= 1000 ? `${radius / 1000}km` : `${radius}m`;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </button>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                <span className="text-3xl">🏥</span>
                Tìm Phòng Khám Thú Y
              </h1>
              <p className="text-blue-100 text-sm mt-1">Tìm kiếm phòng khám gần bạn với Goong Map</p>
            </div>
            <div className="w-24"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-2 items-center">
              <div className="relative flex-grow w-full lg:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-lg border-0 bg-white/90 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white text-sm"
                  placeholder="Tìm kiếm phòng khám thú y..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              <div className="flex gap-2 w-full lg:w-auto">
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all text-sm"
                  title="Đổi vị trí"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Đổi vị trí
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Bộ lọc
                </button>
                
                <button
                  onClick={handleSearch}
                  disabled={loading || !currentLocation}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-medium disabled:opacity-50 text-sm"
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

            {showFilters && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">Bán kính tìm kiếm</label>
                    <select
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg bg-white/90 text-gray-900 text-sm"
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

      <div className="px-4 py-2">
        <div className="max-w-7xl mx-auto">
          {locationError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg shadow-sm mb-2">
              <p className="text-sm text-red-700">
                <strong>Lỗi vị trí:</strong> {locationError}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg shadow-sm mb-2">
              <p className="text-sm text-red-700">
                <strong>Lỗi:</strong> {error}
              </p>
            </div>
          )}

          {!currentLocation && !locationLoading && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg shadow-sm mb-2">
              <div className="flex items-center justify-between">
                <p className="text-amber-700 font-medium text-sm">
                  Cần quyền truy cập vị trí để tìm phòng khám gần bạn
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm"
                  >
                    Nhập địa chỉ
                  </button>
                  <button
                    onClick={handleLocationRequest}
                    className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-sm"
                  >
                    Cho phép vị trí
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentLocation && (
            <div className={`${customLocation ? 'bg-blue-50 border-blue-400' : 'bg-green-50 border-green-400'} border-l-4 p-3 rounded-r-lg shadow-sm mb-2`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`${customLocation ? 'text-blue-700' : 'text-green-700'} font-medium text-sm`}>
                    {customLocation ? `📍 ${customLocation.address || 'Vị trí tùy chỉnh'}` : '✅ Vị trí hiện tại'} • Hiển thị {clinics.length} phòng khám trong bán kính {getRadiusText(searchRadius)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-xs ${customLocation ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100'} px-2 py-1 rounded-full`}>
                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                  </div>
                  {customLocation && (
                    <button
                      onClick={handleResetLocation}
                      className="text-xs px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      title="Về vị trí hiện tại"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden px-4 pb-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          {isSidebarOpen ? 'Ẩn danh sách' : 'Hiện danh sách'}
        </button>

        <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0 bg-white rounded-lg shadow-lg mr-0 lg:mr-4 mb-4 lg:mb-0 overflow-hidden`}>
          <div className="p-3 bg-gray-50 border-b">
            <h2 className="font-semibold text-gray-800 text-sm">Danh sách phòng khám ({clinics.length})</h2>
          </div>
          <div className="overflow-y-auto h-64 lg:h-full">
            {clinics.map((clinic, index) => (
              <div
                key={clinic.id || index}
                onClick={() => handleClinicSelect(clinic)}
                className={`p-3 border-b cursor-pointer hover:bg-blue-50 transition ${
                  selectedClinic?.id === clinic.id ? 'bg-blue-100' : ''
                }`}
              >
                <h3 className="font-semibold text-gray-900 text-sm">{clinic.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{clinic.address}</p>
                {clinic.distance && (
                  <p className="text-xs text-blue-600 mt-1">📏 {(clinic.distance / 1000).toFixed(1)} km</p>
                )}
              </div>
            ))}
            {clinics.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Không tìm thấy phòng khám nào
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <GoongMapComponent
            clinics={clinics}
            userLocation={currentLocation}
            zoomLevel={13}
            onLocationRequest={handleLocationRequest}
            loading={locationLoading}
            selectedClinic={selectedClinic}
            onMarkerClick={handleClinicSelect}
            onClinicSelect={handleClinicSelect}
            showUserMarker={true}
            autoFitBounds={false}
          />
        </div>
      </div>

      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Đổi vị trí tìm kiếm</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập địa chỉ hoặc tên địa điểm
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => handleAddressInputChange(e.target.value)}
                    placeholder="VD: Quận 1, TP.HCM hoặc Bến Thành"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchingAddress && (
                    <div className="absolute right-3 top-2.5">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectAddress(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900 text-sm">{suggestion.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{suggestion.address}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  💡 Gõ ít nhất 3 ký tự để xem gợi ý địa chỉ
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    setAddressInput('');
                    setAddressSuggestions([]);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Hủy
                </button>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    handleLocationRequest();
                    setShowLocationModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Dùng vị trí hiện tại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoongVetMapPage;
