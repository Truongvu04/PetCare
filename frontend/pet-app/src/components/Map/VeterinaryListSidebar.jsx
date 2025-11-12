import React from 'react';
import EnhancedSearchComponent from './EnhancedSearchComponent';
import VeterinaryClinicCard from './VeterinaryClinicCard';

const VeterinaryListSidebar = ({
  clinics = [],
  selectedClinic,
  onClinicSelect,
  onSearch,
  onLocationSelect,
  userLocation,
  loading = false,
  error = null,
  searchRadius = 15000,
  onRadiusChange,
  locationError = null,
  onLocationRequest,
  searchResults = null,
  selectedLocation = null
}) => {
  const handleRadiusChange = (e) => {
    if (onRadiusChange) {
      onRadiusChange(parseInt(e.target.value));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-green-600">
        <h1 className="text-xl font-bold text-white mb-2">
          Tìm Phòng Khám Thú Y
        </h1>
        <p className="text-blue-100 text-sm">
          Tìm kiếm phòng khám gần bạn với đánh giá cao
        </p>
      </div>

      {/* Search Section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <EnhancedSearchComponent
          onSearch={onSearch}
          onLocationSelect={onLocationSelect}
          userLocation={userLocation}
          loading={loading}
          searchRadius={searchRadius}
        />

        {/* Radius Control */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bán kính tìm kiếm: {searchRadius/1000}km
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="5000"
              max="50000"
              step="5000"
              value={searchRadius}
              onChange={handleRadiusChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <select
              value={searchRadius}
              onChange={handleRadiusChange}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Location Info */}
      {(selectedLocation || userLocation) && (
        <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-blue-600 text-lg">location_on</span>
            <div>
              <div className="font-medium text-blue-900">
                {selectedLocation ? 'Tìm kiếm tại:' : 'Vị trí hiện tại:'}
              </div>
              <div className="text-blue-700 text-xs">
                {selectedLocation 
                  ? selectedLocation.address 
                  : `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {locationError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
            <div>
              <div className="font-medium text-red-800 text-sm">Lỗi vị trí</div>
              <div className="text-red-700 text-xs mt-1">{locationError}</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
            <div>
              <div className="font-medium text-red-800 text-sm">Lỗi tìm kiếm</div>
              <div className="text-red-700 text-xs mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* No Location Warning */}
      {!userLocation && !selectedLocation && !loading && (
        <div className="mx-4 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-yellow-600 text-lg mt-0.5">warning</span>
              <div>
                <div className="font-medium text-yellow-800 text-sm">Cần quyền truy cập vị trí</div>
                <div className="text-yellow-700 text-xs mt-1">
                  Để tìm phòng khám gần bạn nhất
                </div>
              </div>
            </div>
            <button
              onClick={onLocationRequest}
              className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors whitespace-nowrap"
            >
              Cho phép
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Kết quả tìm kiếm
            {clinics.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {clinics.length}
              </span>
            )}
          </h2>
          
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tìm...</span>
            </div>
          )}
        </div>
      </div>

      {/* Clinic List */}
      <div className="flex-1 overflow-y-auto">
        {loading && clinics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-center">
              <div className="font-medium mb-1">Đang tìm kiếm...</div>
              <div className="text-sm">Vui lòng đợi trong giây lát</div>
            </div>
          </div>
        ) : clinics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
            <span className="material-symbols-outlined text-6xl mb-4 text-gray-300">search_off</span>
            <div className="text-center">
              <div className="font-medium mb-1">Không tìm thấy phòng khám</div>
              <div className="text-sm">Thử tìm kiếm với từ khóa khác hoặc mở rộng bán kính</div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {clinics.map((clinic, index) => (
              <VeterinaryClinicCard
                key={clinic.id || index}
                clinic={clinic}
                isSelected={selectedClinic?.id === clinic.id}
                onClick={() => onClinicSelect(clinic)}
                userLocation={userLocation || selectedLocation?.coordinates}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {clinics.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            Hiển thị {clinics.length} phòng khám trong bán kính {searchRadius/1000}km
            {searchResults?.sources && (
              <div className="mt-1">
                Nguồn: {searchResults.sources.geoapify > 0 && 'Geoapify'}
                {searchResults.sources.local > 0 && searchResults.sources.geoapify > 0 && ' + '}
                {searchResults.sources.local > 0 && 'Local'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VeterinaryListSidebar;