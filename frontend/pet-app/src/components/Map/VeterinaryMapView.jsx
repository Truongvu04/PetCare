// VeterinaryMapView.jsx (phiên bản tối ưu thực tế)
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import LocationFeedbackModal from './LocationFeedbackModal';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const icons = {
  user: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  fallbackUser: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  vet: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  selected: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 49], iconAnchor: [15, 49], popupAnchor: [1, -34],
  }),
};

// Map controller for smooth panning
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.setView([center.lat, center.lng], zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const VeterinaryMapView = ({
  clinics = [],
  selectedClinic,
  userLocation,
  mapCenter,
  zoomLevel = 13,
  onMarkerClick,
  onLocationRequest,
  loading = false,
  error = null,
  onRetry = null
}) => {
  const [feedbackModal, setFeedbackModal] = React.useState({ isOpen: false, clinic: null });
  const mapRef = useRef(null);
  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || 'ddc30e8d91ed4bd0bf4d47a0e83bb315';

  const getValidCenter = () => {
    if (mapCenter?.lat && mapCenter?.lng) return [mapCenter.lat, mapCenter.lng];
    if (userLocation?.latitude && userLocation?.longitude) return [userLocation.latitude, userLocation.longitude];
    return [15.6696, 108.2261]; // Default Da Nang
  };

  const handleReportLocation = (clinic) => setFeedbackModal({ isOpen: true, clinic });

  const handleSubmitFeedback = (data) => {
    const stored = JSON.parse(localStorage.getItem('location-feedbacks') || '[]');
    stored.push(data);
    localStorage.setItem('location-feedbacks', JSON.stringify(stored));
  };

  // Manual zoom controls
  const handleZoom = (type) => {
    const map = mapRef.current;
    if (map) {
      if (type === 'in') map.zoomIn();
      else map.zoomOut();
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={getValidCenter()}
        zoom={zoomLevel}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={mapCenter} zoom={zoomLevel} />

        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | Geoapify'
        />

        {/* User Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocation.isSearchLocation ? icons.fallbackUser : icons.user}
          >
            <Popup>📍 {userLocation.isSearchLocation ? 'Vị trí tìm kiếm' : 'Vị trí của bạn'}</Popup>
          </Marker>
        )}

        {/* Clinic Markers */}
        {clinics.map((clinic, i) => (
          <Marker
            key={clinic.id || i}
            position={[clinic.coordinates?.lat, clinic.coordinates?.lng]}
            icon={selectedClinic?.id === clinic.id ? icons.selected : icons.vet}
            eventHandlers={{ click: () => onMarkerClick?.(clinic) }}
          >
            {/* Tooltip hiển thị tên rõ ràng */}
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              {clinic.name}
            </Tooltip>
            <Popup maxWidth={320}>
              <div className="p-3">
                <h3 className="font-bold text-base text-gray-900">{clinic.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                {clinic.phone && <p className="text-sm text-blue-700">📞 {clinic.phone}</p>}
                {clinic.rating && <p className="text-sm text-yellow-600">⭐ {clinic.rating}/5</p>}
                <button
                  onClick={() => handleReportLocation(clinic)}
                  className="mt-3 w-full px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg border border-yellow-300 transition-colors"
                >
                  🚩 Báo cáo vị trí sai
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
        {/* Location Button */}
        <button
          onClick={onLocationRequest}
          disabled={loading}
          className={`p-3 rounded-xl bg-white/90 shadow-lg hover:bg-white transition ${loading && 'opacity-50 cursor-not-allowed'}`}
          title="Lấy vị trí hiện tại"
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            : <span className="material-symbols-outlined text-blue-600">my_location</span>}
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white/90 rounded-xl shadow-lg border border-white/50">
          <button onClick={() => handleZoom('in')} className="p-2 hover:bg-gray-100 border-b border-gray-200">
            <span className="material-symbols-outlined text-gray-600">add</span>
          </button>
          <button onClick={() => handleZoom('out')} className="p-2 hover:bg-gray-100">
            <span className="material-symbols-outlined text-gray-600">remove</span>
          </button>
        </div>
      </div>

      {/* Retry Overlay */}
      {error && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center p-6">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-3">error</span>
          <p className="text-gray-800 font-semibold mb-2">Không thể tải phòng khám</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white/95 p-6 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div className="font-semibold text-gray-800">Đang tải bản đồ...</div>
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
        onSubmitFeedback={handleSubmitFeedback}
      />
    </div>
  );
};

export default VeterinaryMapView;
