import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VeterinaryListSidebar from './VeterinaryListSidebar';
import VeterinaryMapView from './VeterinaryMapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { geoapifyService } from '../../services/geoapifyService';

const VeterinaryMapPage = () => {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15000);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // =============================
  // Fetch clinics function
  // =============================
  const fetchClinics = useCallback(async (lat, lng, query = 'veterinary clinic') => {
    setLoading(true);
    setError(null);
    try {
      const result = await geoapifyService.enhancedSearch({
        query,
        latitude: lat,
        longitude: lng,
        radius: searchRadius
      });

      if (result.success) {
        // Map Geoapify data to use lat/lon keys
        const mappedData = result.data.map(c => ({
          ...c,
          coordinates: { lat: c.lat, lng: c.lon }
        }));

        setClinics(mappedData);
        setSearchResults(result);
        console.log(`Tìm thấy ${mappedData.length} phòng khám`, mappedData);
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

  // =============================
  // Enhanced search handler
  // =============================
  const handleEnhancedSearch = async (searchOptions) => {
    setLoading(true);
    setError(null);
    try {
      const result = await geoapifyService.enhancedSearch({
        ...searchOptions,
        radius: searchRadius,
        query: searchOptions.query || 'veterinary clinic'
      });

      if (result.success) {
        const mappedData = result.data.map(c => ({
          ...c,
          coordinates: { lat: c.lat, lng: c.lon }
        }));

        setClinics(mappedData);
        setSearchResults(result);

        if (result.location) {
          setSelectedLocation(result.location);
          setMapCenter({
            lat: result.location.coordinates.lat,
            lng: result.location.coordinates.lng
          });
          setZoomLevel(14);
        }

        console.log(`Tìm thấy ${mappedData.length} phòng khám`, mappedData);
      } else {
        setError(result.message || 'Không thể tải danh sách phòng khám');
        setClinics([]);
      }
    } catch (err) {
      console.error('Error in enhanced search:', err);
      setError(err.message || 'Có lỗi xảy ra khi tìm kiếm');
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Clinic selection
  // =============================
  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
    setMapCenter({
      lat: clinic.coordinates.lat,
      lng: clinic.coordinates.lng
    });
    setZoomLevel(16);

    if (clinic.id) {
      navigate(`/vet-map/${clinic.id}`, { replace: true });
    }
  };

  // =============================
  // Location selection from search
  // =============================
  const handleLocationSelect = (coordinates, address) => {
    setSelectedLocation({ coordinates, address });
    setMapCenter({ lat: coordinates.lat, lng: coordinates.lng });
    setZoomLevel(14);
    fetchClinics(coordinates.lat, coordinates.lng);
  };

  // =============================
  // Map marker click
  // =============================
  const handleMapMarkerClick = (clinic) => {
    setSelectedClinic(clinic);
    if (clinic.id) {
      navigate(`/vet-map/${clinic.id}`, { replace: true });
    }
  };

  // =============================
  // Handle location request
  // =============================
  const handleLocationRequest = async () => {
    await getCurrentLocation();
    setSelectedLocation(null);
    setZoomLevel(13);
    setSelectedClinic(null);
    navigate('/vet-map', { replace: true });
  };

  // =============================
  // Toggle sidebar
  // =============================
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // =============================
  // Load initial data
  // =============================
  useEffect(() => {
    if (location) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      fetchClinics(location.latitude, location.longitude);
    }
  }, [location, fetchClinics]);

  // =============================
  // Handle clinicId from URL
  // =============================
  useEffect(() => {
    if (clinicId && clinics.length > 0) {
      const clinic = clinics.find(c => c.id.toString() === clinicId);
      if (clinic) {
        setSelectedClinic(clinic);
        setMapCenter({ lat: clinic.coordinates.lat, lng: clinic.coordinates.lng });
        setZoomLevel(16);
      }
    }
  }, [clinicId, clinics]);

  // =============================
  // Determine current map center
  // =============================
  const currentMapCenter = mapCenter ||
    (selectedLocation?.coordinates ? {
      lat: selectedLocation.coordinates.lat,
      lng: selectedLocation.coordinates.lng
    } : location ? {
      lat: location.latitude,
      lng: location.longitude
    } : { lat: 15.6696, lng: 108.2261 });

  const currentUserLocation = selectedLocation?.coordinates ? {
    latitude: selectedLocation.coordinates.lat,
    longitude: selectedLocation.coordinates.lng,
    isSearchLocation: true
  } : location;

  // =============================
  // Render
  // =============================
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Tìm Phòng Khám Thú Y</h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <span className="material-symbols-outlined">
            {isSidebarOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          fixed lg:relative z-30 lg:z-0
          w-full sm:w-96 lg:w-[400px] xl:w-[450px]
          h-full bg-white border-r border-gray-200
          flex flex-col
        `}>
          <VeterinaryListSidebar
            clinics={clinics}
            selectedClinic={selectedClinic}
            onClinicSelect={handleClinicSelect}
            onSearch={handleEnhancedSearch}
            onLocationSelect={handleLocationSelect}
            userLocation={location}
            loading={loading}
            error={error}
            searchRadius={searchRadius}
            onRadiusChange={setSearchRadius}
            locationError={locationError}
            onLocationRequest={handleLocationRequest}
            searchResults={searchResults}
            selectedLocation={selectedLocation} />
        </div>

        {/* Map View */}
        <div className="flex-1 relative">
          <VeterinaryMapView
            clinics={clinics}
            selectedClinic={selectedClinic}
            userLocation={currentUserLocation}
            mapCenter={currentMapCenter}
            zoomLevel={zoomLevel}
            onMarkerClick={handleMapMarkerClick}
            onLocationRequest={handleLocationRequest}
            loading={locationLoading} />

          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div
              className="lg:hidden absolute inset-0 bg-black bg-opacity-50 z-20"
              onClick={toggleSidebar} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VeterinaryMapPage;
