import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import LocationFeedbackModal from './LocationFeedbackModal';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const fallbackUserIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const vetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedVetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [49, 49]
});

// Map controller component
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom, {
        animate: true,
        duration: 0.5
      });
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
  const [feedbackModal, setFeedbackModal] = React.useState({ isOpen: false, clinic: null });

  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || 'ddc30e8d91ed4bd0bf4d47a0e83bb315';

  // Validate coordinates
  const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return null;
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return null;
    }
    
    return { latitude, longitude };
  };

  // Get valid map center
  const getValidMapCenter = () => {
    if (mapCenter && mapCenter.lat && mapCenter.lng) {
      const validated = validateCoordinates(mapCenter.lat, mapCenter.lng);
      if (validated) {
        return [validated.latitude, validated.longitude];
      }
    }
    
    if (userLocation) {
      const validated = validateCoordinates(userLocation.latitude, userLocation.longitude);
      if (validated) {
        return [validated.latitude, validated.longitude];
      }
    }
    
    return [15.6696, 108.2261]; // Default to Da Nang
  };

  const position = getValidMapCenter();

  // Handle report location
  const handleReportLocation = (clinic) => {
    setFeedbackModal({ isOpen: true, clinic });
  };

  // Handle submit feedback
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

  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={position} 
        zoom={zoomLevel} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapController center={mapCenter} zoom={zoomLevel} />
        
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://www.geoapify.com">Geoapify</a>'
        />
        
        {/* User Location Marker */}
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
                        : 'Vị trí của bạn'
                    }
                  </strong>
                  <br />
                  <small className="text-xs text-gray-600">
                    {userLocation.isFallback 
                      ? 'Vị trí ước tính - Cho phép truy cập vị trí để chính xác hơn' 
                      : userLocation.isSearchLocation
                        ? 'Vị trí được chọn từ tìm kiếm'
                        : `Độ chính xác: ${userLocation.accuracy?.toFixed(0)}m`
                    }
                  </small>
                </div>
              </Popup>
            </Marker>
          );
        })()}
        
        {/* Clinic Markers */}
        {clinics.map((clinic, index) => {
          const validatedClinicPos = validateCoordinates(
            clinic.coordinates?.lat, 
            clinic.coordinates?.lng
          );
          
          if (!validatedClinicPos) {
            console.warn(`Invalid coordinates for clinic: ${clinic.name}`, clinic.coordinates);
            return null;
          }

          const isSelected = selectedClinic && selectedClinic.id === clinic.id;
          const markerIcon = isSelected ? selectedVetIcon : vetIcon;
          
          return (
            <Marker 
              key={clinic.id || index} 
              position={[validatedClinicPos.latitude, validatedClinicPos.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(clinic);
                  }
                }
              }}
            >
              <Popup 
                maxWidth={320} 
                maxHeight={400}
                autoPan={true}
                keepInView={true}
              >
                <div className="p-3 max-w-sm">
                  <h3 className="font-bold text-base mb-2 text-gray-900">{clinic.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{clinic.address}</p>
                  
                  {clinic.rating > 0 && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`text-sm ${
                              i < Math.floor(clinic.rating) 
                                ? 'text-yellow-500' 
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold text-gray-800">{clinic.rating}</span>
                      <span className="text-sm text-gray-500">({clinic.reviews} đánh giá)</span>
                    </div>
                  )}
                  
                  {clinic.phone && clinic.phone !== 'Chưa có thông tin' && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600 text-lg">phone</span>
                        <span className="text-sm text-gray-800">{clinic.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {clinic.openingHours && (
                    <div className="mb-3 p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 text-lg">schedule</span>
                        <span className="text-sm text-gray-800">{clinic.openingHours}</span>
                      </div>
                    </div>
                  )}
                  
                  {clinic.services && clinic.services.length > 0 && (
                    <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 text-lg">medical_services</span>
                        <div>
                          <div className="text-sm font-medium text-purple-800 mb-1">Dịch vụ:</div>
                          <div className="flex flex-wrap gap-1">
                            {clinic.services.slice(0, 3).map((service, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                {service}
                              </span>
                            ))}
                            {clinic.services.length > 3 && (
                              <span className="text-xs text-purple-600">+{clinic.services.length - 3} khác</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Report Location Button */}
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportLocation(clinic);
                      }}
                      className="w-full px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm rounded-lg transition-colors border border-yellow-300"
                    >
                      🚩 Báo cáo vị trí sai
                    </button>
                    
                    {clinic.source && (
                      <div className="text-xs text-gray-500 text-center mt-2">
                        Nguồn: {clinic.source}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
        {/* Location Button */}
        <button
          onClick={onLocationRequest}
          disabled={loading}
          className={`
            group p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl 
            transition-all duration-200 border border-white/50
            ${loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}
          `}
          title="Lấy vị trí hiện tại"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-blue-600 group-hover:text-blue-700">my_location</span>
          )}
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden">
          <button 
            className="p-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
            onClick={() => {
              // Zoom in functionality would be handled by map instance
            }}
          >
            <span className="material-symbols-outlined text-gray-600">add</span>
          </button>
          <button 
            className="p-2 hover:bg-gray-100 transition-colors"
            onClick={() => {
              // Zoom out functionality would be handled by map instance
            }}
          >
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

      {/* Location Feedback Modal */}
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
