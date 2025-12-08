// VeterinaryMapPage.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import LocationFeedbackModal from './LocationFeedbackModal';
import MapMarkerCluster from './MapMarkerCluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Custom Icons
const userIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon-2x-blue.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const fallbackUserIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon-2x-yellow.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const vetIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon-2x-red.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedVetIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon-2x-green.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [49, 49]
});

// Map controller
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng && map?._mapPane) {
      map.setView([center.lat, center.lng], zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const VeterinaryMapView = ({
  clinics = [],
  selectedClinic = null,
  userLocation = null,
  mapCenter = null,
  zoomLevel = 13,
  onMarkerClick,
  onLocationRequest,
  loading = false
}) => {
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, clinic: null });
  const [mapInstance, setMapInstance] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);

  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || 'ddc30e8d91ed4bd0bf4d47a0e83bb315';

  const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) return null;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
    return { latitude, longitude };
  };

  const getValidMapCenter = () => {
    if (mapCenter && mapCenter.lat && mapCenter.lng) {
      const validated = validateCoordinates(mapCenter.lat, mapCenter.lng);
      if (validated) return [validated.latitude, validated.longitude];
    }
    if (userLocation) {
      const validated = validateCoordinates(userLocation.latitude, userLocation.longitude);
      if (validated) return [validated.latitude, validated.longitude];
    }
    return [15.6696, 108.2261]; // Default Da Nang
  };

  const position = getValidMapCenter();

  const handleReportLocation = (clinic) => {
    setFeedbackModal({ isOpen: true, clinic });
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      const existingFeedbacks = JSON.parse(localStorage.getItem('location-feedbacks') || '[]');
      existingFeedbacks.push(feedbackData);
      localStorage.setItem('location-feedbacks', JSON.stringify(existingFeedbacks));
      console.log('Feedback submitted:', feedbackData);
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  };

  // Cleanup routing on unmount
  useEffect(() => {
    return () => {
      if (routingControl && mapInstance) mapInstance.removeControl(routingControl);
    };
  }, [routingControl, mapInstance]);

  // Safe routing function
  const addRouting = (from, to) => {
    if (!mapInstance || !mapInstance._mapPane) return; // ✅ tránh lỗi _leaflet_pos
    if (!mapInstance) return;
    try {
      if (routingControl) mapInstance.removeControl(routingControl);

      const newRouting = L.Routing.control({
        waypoints: [L.latLng(...from), L.latLng(...to)],
        lineOptions: { styles: [{ color: 'blue', weight: 4, opacity: 0.6 }] },
        addWaypoints: false,
        draggableWaypoints: false,
        routeWhileDragging: false,
        show: false,
      }).addTo(mapInstance);

      setRoutingControl(newRouting);
    } catch (err) {
      console.warn('Routing error:', err);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={position}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        whenCreated={setMapInstance}
      >
        <MapController center={mapCenter} zoom={zoomLevel} />

        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
          attribution='&copy; OpenStreetMap contributors | <a href="https://www.geoapify.com">Geoapify</a>'
        />

        {/* User Marker */}
        {userLocation && (() => {
          const validatedPos = validateCoordinates(userLocation.latitude, userLocation.longitude);
          if (!validatedPos) return null;
          return (
            <Marker
              position={[validatedPos.latitude, validatedPos.longitude]}
              icon={userLocation.isFallback || userLocation.isSearchLocation ? fallbackUserIcon : userIcon}
            >
              <Popup>
                <div className="text-center p-2">
                  <strong className="text-sm">
                    {userLocation.isSearchLocation
                      ? 'Vị trí tìm kiếm'
                      : userLocation.isFallback
                        ? 'Vị trí mặc định'
                        : 'Vị trí của bạn'}
                  </strong>
                  <br />
                  <small className="text-xs text-gray-600">
                    {userLocation.isFallback
                      ? 'Vị trí ước tính - Cho phép truy cập vị trí để chính xác hơn'
                      : userLocation.isSearchLocation
                        ? 'Vị trí được chọn từ tìm kiếm'
                        : `Độ chính xác: ${userLocation.accuracy?.toFixed(0)}m`}
                  </small>
                </div>
              </Popup>
            </Marker>
          );
        })()}

        {/* Clinic Markers with Clustering */}
        {clinics.length > 0 && (
          <MapMarkerCluster
            clinics={clinics}
            selectedClinic={selectedClinic}
            onMarkerClick={(clinic) => {
              if (!mapInstance || !mapInstance._mapPane) return;
              if (onMarkerClick) onMarkerClick(clinic);
              if (userLocation) {
                const clinicPos = validateCoordinates(clinic.coordinates?.lat, clinic.coordinates?.lng);
                if (clinicPos) {
                  addRouting(
                    [userLocation.latitude, userLocation.longitude],
                    [clinicPos.latitude, clinicPos.longitude]
                  );
                }
              }
            }}
            userLocation={userLocation}
            vetIcon={vetIcon}
            selectedVetIcon={selectedVetIcon}
          />
        )}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
        <button
          onClick={onLocationRequest}
          disabled={loading}
          className={`group p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-white/50 ${loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
          title="Lấy vị trí hiện tại">
          {loading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-blue-600 group-hover:text-blue-700">my_location</span>
          )}
        </button>

        <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden">
          <button className="p-2 hover:bg-gray-100 transition-colors border-b border-gray-200" onClick={() => mapInstance?.zoomIn()}>
            <span className="material-symbols-outlined text-gray-600">add</span>
          </button>
          <button className="p-2 hover:bg-gray-100 transition-colors" onClick={() => mapInstance?.zoomOut()}>
            <span className="material-symbols-outlined text-gray-600">remove</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/50">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div className="font-semibold text-gray-800">Đang tìm vị trí...</div>
              <div className="text-sm text-gray-600">Vui lòng đợi trong giây lát</div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <LocationFeedbackModal
        isOpen={feedbackModal.isOpen}
        clinic={feedbackModal.clinic}
        onClose={() => setFeedbackModal({ isOpen: false, clinic: null })}
        onSubmitFeedback={handleSubmitFeedback}/>
    </div>
  );
};

export default VeterinaryMapView;
