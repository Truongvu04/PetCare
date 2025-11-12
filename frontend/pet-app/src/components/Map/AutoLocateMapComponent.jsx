import React, { useState, useEffect, useCallback } from 'react';
import GeoapifyMapComponent from './GeoapifyMapComponent';
import VeterinaryListSidebar from './VeterinaryListSidebar';
import { useGeolocation } from '../../hooks/useGeolocation';

const AutoLocateMapComponent = () => {
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15000);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const autoLocateVeterinaryClinics = useCallback(async (lat, lng, radius = 15000) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/geoapify/auto-locate?lat=${lat}&lon=${lng}&radius=${radius}`);
      const result = await response.json();
      
      if (result.success) {
        setClinics(result.data || []);
        setSearchResults({
          total: result.total,
          source: result.source,
          userLocation: result.userLocation,
          radius: result.radius
        });
        console.log(`Auto-locate: Tìm thấy ${result.data?.length || 0} phòng khám`, result);
      } else {
        setError(result.message || 'Không thể tải danh sách phòng khám');
        setClinics([]);
      }
    } catch (err) {
      console.error('Error auto-locating clinics:', err);
      setError('Có lỗi xảy ra khi tự động tìm phòng khám');
      setClinics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location && !selectedLocation) {
      autoLocateVeterinaryClinics(location.latitude, location.longitude, searchRadius);
    }
  }, [location, searchRadius, autoLocateVeterinaryClinics, selectedLocation]);

  const handleSearch = async (searchOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchPayload = {
        query: searchOptions.query,
        latitude: searchOptions.latitude || location?.latitude,
        longitude: searchOptions.longitude || location?.longitude,
        radius: searchOptions.radius || searchRadius,
        prioritizeLocal: true
      };

      const response = await fetch('/api/geoapify/smart-search-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload)
      });

      const result = await response.json();
      
      if (result.success) {
        setClinics(result.data || []);
        setSearchResults({
          total: result.total,
          source: result.source,
          searchIntent: result.searchIntent,
          prioritizedLocal: result.prioritizedLocal,
          expanded: result.expanded
        });
      } else {
        setError(result.error || 'Không thể tìm kiếm');
        setClinics([]);
      }
    } catch (err) {
      console.error('Error searching:', err);
      setError('Có lỗi xảy ra khi tìm kiếm');
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (coordinates, address) => {
    setSelectedLocation({
      coordinates,
      address
    });
    
    if (coordinates) {
      await autoLocateVeterinaryClinics(coordinates.lat, coordinates.lng, searchRadius);
    }
  };

  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
  };

  const handleLocationRequest = () => {
    setSelectedLocation(null);
    getCurrentLocation();
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    const currentLat = selectedLocation?.coordinates?.lat || location?.latitude;
    const currentLng = selectedLocation?.coordinates?.lng || location?.longitude;
    
    if (currentLat && currentLng) {
      autoLocateVeterinaryClinics(currentLat, currentLng, newRadius);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
        <h1 className="text-lg font-bold">Tìm Phòng Khám Thú Y</h1>
        <p className="text-sm text-blue-100">
          {clinics.length > 0 ? `${clinics.length} phòng khám trong ${searchRadius/1000}km` : 'Đang tìm kiếm...'}
        </p>
      </div>

      {/* Sidebar */}
      <div className="lg:w-1/3 lg:min-w-96 lg:max-w-md border-r border-gray-200 bg-white shadow-lg 
                      max-h-96 lg:max-h-none overflow-y-auto lg:overflow-visible">
        <VeterinaryListSidebar
          clinics={clinics}
          selectedClinic={selectedClinic}
          onClinicSelect={handleClinicSelect}
          onSearch={handleSearch}
          onLocationSelect={handleLocationSelect}
          userLocation={location}
          loading={loading}
          error={error}
          searchRadius={searchRadius}
          onRadiusChange={handleRadiusChange}
          locationError={locationError}
          onLocationRequest={handleLocationRequest}
          searchResults={searchResults}
          selectedLocation={selectedLocation}
        />
      </div>
      
      {/* Map Container */}
      <div className="flex-1 relative min-h-96">
        <GeoapifyMapComponent
          clinics={clinics}
          userLocation={selectedLocation?.coordinates || location}
          selectedClinic={selectedClinic}
          onClinicSelect={handleClinicSelect}
          zoomLevel={13}
          onLocationRequest={handleLocationRequest}
          loading={locationLoading}
          showUserMarker={true}
          autoFitBounds={true}
        />
        
        {/* Loading Indicator */}
        {loading && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 lg:p-4 flex items-center gap-2 lg:gap-3 z-10">
            <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs lg:text-sm font-medium text-gray-700">Đang tìm kiếm...</span>
          </div>
        )}
        
        {/* Results Summary */}
        {clinics.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 lg:p-3 z-10">
            <div className="text-xs lg:text-sm text-gray-600">
              <div className="font-semibold text-gray-800">
                {clinics.length} phòng khám
              </div>
              <div className="text-xs mt-1">
                Bán kính {searchRadius/1000}km
                {searchResults?.prioritizedLocal && (
                  <span className="ml-1 lg:ml-2 px-1 lg:px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                    Local
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Toggle Button */}
        <button 
          className="lg:hidden absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10"
          onClick={() => {
            const sidebar = document.querySelector('.lg\\:w-1\\/3');
            sidebar.classList.toggle('max-h-96');
            sidebar.classList.toggle('max-h-screen');
          }}>
          <span className="material-symbols-outlined text-gray-600">menu</span>
        </button>
      </div>
    </div>
  );
};

export default AutoLocateMapComponent;