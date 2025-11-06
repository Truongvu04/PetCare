import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VeterinaryListSidebar from "./VeterinaryListSidebar";
import VeterinaryMapView from "./VeterinaryMapView";
import { useGeolocation } from "../../hooks/useGeolocation";
import { geoapifyService } from "../../services/geoapifyService";

const VeterinaryMapPage = () => {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const {
    location,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
  } = useGeolocation();

  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchRadius, setSearchRadius] = useState(15000);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const retryTimeoutRef = useRef(null);

  const fetchClinics = useCallback(
    async (lat, lng, query = "") => {
      setLoading(true);
      setError(null);
      try {
        const result = await geoapifyService.enhancedSearch({
          query,
          latitude: lat,
          longitude: lng,
          radius: searchRadius,
          searchType: "auto",
        });

        if (result.success) {
          setClinics(result.data || []);
          setSearchResults(result);
          setRetryCount(0);
          console.log(
            `✅ Tìm thấy ${result.data?.length || 0} phòng khám`,
            result
          );
        } else {
          throw new Error(result.message || "Không thể tải danh sách phòng khám");
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu, vui lòng thử lại.");
        setClinics([]);
        if (retryCount < 3) {
          retryTimeoutRef.current = setTimeout(() => {
            console.warn(`🔁 Đang thử lại lần ${retryCount + 1}`);
            setRetryCount((prev) => prev + 1);
            fetchClinics(lat, lng, query);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchRadius, retryCount]
  );

  const handleRetry = () => {
    if (location) {
      setRetryCount(0);
      fetchClinics(location.latitude, location.longitude);
    }
  };

  const handleEnhancedSearch = async (searchOptions) => {
    setLoading(true);
    setError(null);
    try {
      const result = await geoapifyService.enhancedSearch({
        ...searchOptions,
        radius: searchRadius,
      });

      if (result.success) {
        setClinics(result.data || []);
        setSearchResults(result);

        if (result.location) {
          setSelectedLocation(result.location);
          setMapCenter({
            lat: result.location.coordinates.lat,
            lng: result.location.coordinates.lng,
          });
          setZoomLevel(14);
        }

        console.log(`🔎 Kết quả tìm kiếm: ${result.data?.length || 0} phòng khám`);
      } else {
        throw new Error(result.message || "Không thể tải danh sách phòng khám");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tìm kiếm:", err);
      setError("Có lỗi khi tìm kiếm, vui lòng thử lại.");
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
    setMapCenter({
      lat: clinic.coordinates.lat,
      lng: clinic.coordinates.lng,
    });
    setZoomLevel(16);

    if (clinic.id) navigate(`/vet-map/${clinic.id}`, { replace: true });

    // Hiệu ứng chọn phòng khám (animation nhỏ)
    const marker = document.querySelector(`#marker-${clinic.id}`);
    if (marker) {
      marker.classList.add("animate-bounce");
      setTimeout(() => marker.classList.remove("animate-bounce"), 1200);
    }
  };

  const handleLocationSelect = (coordinates, address) => {
    setSelectedLocation({ coordinates, address });
    setMapCenter({
      lat: coordinates.lat,
      lng: coordinates.lng,
    });
    setZoomLevel(14);
    fetchClinics(coordinates.lat, coordinates.lng);
  };

  const handleMapMarkerClick = (clinic) => {
    setSelectedClinic(clinic);
    if (clinic.id) navigate(`/vet-map/${clinic.id}`, { replace: true });
  };

  const handleLocationRequest = () => {
    getCurrentLocation();
    setSelectedLocation(null);
    setZoomLevel(13);
    setSelectedClinic(null);
    navigate("/vet-map", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (location) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      fetchClinics(location.latitude, location.longitude);
    }
    return () => clearTimeout(retryTimeoutRef.current);
  }, [location, fetchClinics]);

  useEffect(() => {
    if (clinicId && clinics.length > 0) {
      const clinic = clinics.find((c) => c.id === clinicId);
      if (clinic) {
        setSelectedClinic(clinic);
        setMapCenter({
          lat: clinic.coordinates.lat,
          lng: clinic.coordinates.lng,
        });
        setZoomLevel(16);
      }
    }
  }, [clinicId, clinics]);

  const currentMapCenter =
    mapCenter ||
    (selectedLocation?.coordinates
      ? {
          lat: selectedLocation.coordinates.lat,
          lng: selectedLocation.coordinates.lng,
        }
      : location
      ? { lat: location.latitude, lng: location.longitude }
      : { lat: 15.6696, lng: 108.2261 });

  const currentUserLocation = selectedLocation?.coordinates
    ? {
        latitude: selectedLocation.coordinates.lat,
        longitude: selectedLocation.coordinates.lng,
        isSearchLocation: true,
      }
    : location;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          Tìm Phòng Khám Thú Y
        </h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined">
            {isSidebarOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:relative z-30 lg:z-0
          w-full sm:w-96 lg:w-[400px] xl:w-[450px]
          h-full bg-white border-r border-gray-200 flex flex-col`}
        >
          <VeterinaryListSidebar
            clinics={clinics}
            selectedClinic={selectedClinic}
            onClinicSelect={handleClinicSelect}
            onSearch={handleEnhancedSearch}
            onLocationSelect={handleLocationSelect}
            userLocation={location}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            searchRadius={searchRadius}
            onRadiusChange={setSearchRadius}
            locationError={locationError}
            onLocationRequest={handleLocationRequest}
            searchResults={searchResults}
            selectedLocation={selectedLocation}
          />
        </div>

        <div className="flex-1 relative">
          <VeterinaryMapView
            clinics={clinics}
            selectedClinic={selectedClinic}
            userLocation={currentUserLocation}
            mapCenter={currentMapCenter}
            zoomLevel={zoomLevel}
            onMarkerClick={handleMapMarkerClick}
            onLocationRequest={handleLocationRequest}
            loading={locationLoading}
          />

          {isSidebarOpen && (
            <div
              className="lg:hidden absolute inset-0 bg-black bg-opacity-50 z-20"
              onClick={toggleSidebar}
            />
          )}

          {error && !loading && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center z-50">
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-md flex items-center gap-3">
                <span>{error}</span>
                <button
                  onClick={handleRetry}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeterinaryMapPage;
