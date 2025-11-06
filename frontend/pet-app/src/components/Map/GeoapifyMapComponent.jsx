import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import LocationFeedbackModal from './LocationFeedbackModal';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom CSS cho popup - Approach mới cho Leaflet
const popupStyles = `
  .leaflet-popup-content-wrapper {
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
  .leaflet-popup-content {
    margin: 0 !important;
    line-height: 1.4;
    max-height: none !important;
    overflow: visible !important;
  }
  .leaflet-popup-scrolled {
    overflow: auto !important;
    border-bottom: 1px solid #ccc;
    border-top: 1px solid #ccc;
  }
  .popup-container {
    width: 300px;
    max-height: 350px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .popup-container::-webkit-scrollbar {
    width: 8px;
  }
  .popup-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .popup-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  .popup-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

function AutoFitBounds({ clinics, userLocation, autoFitBounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (!autoFitBounds || !clinics || clinics.length === 0) return;
    
    const bounds = L.latLngBounds();
    let hasValidBounds = false;
    
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      bounds.extend([userLocation.latitude, userLocation.longitude]);
      hasValidBounds = true;
    }
    
    clinics.forEach(clinic => {
      if (clinic.coordinates && clinic.coordinates.lat && clinic.coordinates.lng) {
        bounds.extend([clinic.coordinates.lat, clinic.coordinates.lng]);
        hasValidBounds = true;
      }
    });
    
    if (hasValidBounds) {
      map.fitBounds(bounds, { 
        padding: [20, 20],
        maxZoom: 15
      });
    }
  }, [clinics, userLocation, autoFitBounds, map]);
  
  return null;
}

const GeoapifyMapComponent = ({ 
  clinics = [], 
  userLocation = null, 
  zoomLevel = 13,
  onLocationRequest,
  loading = false,
  selectedClinic = null,
  onMarkerClick,
  onClinicSelect,
  showPopup = true,
  showUserMarker = true,
  autoFitBounds = false
}) => {
  const defaultPosition = [15.6696, 108.2261];
  
  // Validate và sanitize coordinates
  const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return null;
    }
    
    // Kiểm tra phạm vi hợp lệ
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return null;
    }
    
    return { latitude, longitude };
  };

  const getValidPosition = () => {
    if (userLocation) {
      const validated = validateCoordinates(userLocation.latitude, userLocation.longitude);
      if (validated) {
        return [validated.latitude, validated.longitude];
      }
    }
    return defaultPosition;
  };

  const position = getValidPosition();
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, clinic: null });

  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || 'ddc30e8d91ed4bd0bf4d47a0e83bb315';

  const handleReportLocation = (clinic) => {
    setFeedbackModal({ isOpen: true, clinic });
  };

  const handleSubmitFeedback = async (feedbackData) => {
    // Lưu feedback vào localStorage hoặc gửi lên server
    try {
      const existingFeedbacks = JSON.parse(localStorage.getItem('location-feedbacks') || '[]');
      existingFeedbacks.push(feedbackData);
      localStorage.setItem('location-feedbacks', JSON.stringify(existingFeedbacks));
      
      console.log('Feedback submitted:', feedbackData);
      
      // TODO: Gửi lên server khi có API
      // await fetch('/api/feedback', { method: 'POST', body: JSON.stringify(feedbackData) });
      
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <style>{popupStyles}</style>
      <MapContainer 
        center={position} 
        zoom={zoomLevel} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <ChangeView center={position} zoom={zoomLevel} />
        <AutoFitBounds clinics={clinics} userLocation={userLocation} autoFitBounds={autoFitBounds} />
        
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://www.geoapify.com">Geoapify</a>'
        />
        
         {showUserMarker && userLocation && (() => {
           const validatedPos = validateCoordinates(userLocation.latitude, userLocation.longitude);
           if (!validatedPos) return null;
           
           return (
             <Marker 
               position={[validatedPos.latitude, validatedPos.longitude]}
               icon={userLocation.isFallback || userLocation.isSearchLocation ? fallbackUserIcon : userIcon}
             >
               <Popup>
                 <div className="text-center">
                   <strong>
                     {userLocation.isSearchLocation 
                       ? 'Vị trí tìm kiếm' 
                       : userLocation.isFallback 
                         ? 'Vị trí mặc định' 
                         : 'Vị trí của bạn'
                     }
                   </strong>
                   <br />
                   <small>
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
        
        {clinics.map((clinic, index) => {
          // Validate clinic coordinates
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
                  if (onClinicSelect) {
                    onClinicSelect(clinic);
                  }
                }
              }}
            >
              {showPopup && (
                <Popup 
                  maxWidth={320} 
                  maxHeight={400}
                  autoPan={true}
                  keepInView={true}
                >
                  <div className="popup-container">
                    <div style={{padding: '12px'}}>
                      <h3 style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', color: '#1f2937'}}>{clinic.name}</h3>
                      <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5'}}>{clinic.address}</p>
                      
                      {clinic.rating > 0 && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px', padding: '8px', backgroundColor: '#fefce8', borderRadius: '8px'}}>
                          <span>⭐</span>
                          <span style={{fontWeight: '600', color: '#1f2937'}}>{clinic.rating}</span>
                          <span style={{fontSize: '14px', color: '#6b7280'}}>({clinic.reviews} đánh giá)</span>
                        </div>
                      )}
                      
                      {clinic.phone && clinic.phone !== 'Chưa có thông tin' && (
                        <div style={{marginBottom: '12px', padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px'}}>
                          <p style={{fontSize: '14px', margin: 0}}>
                            <strong style={{color: '#1d4ed8'}}>📞 SĐT:</strong> 
                            <span style={{marginLeft: '4px', color: '#374151'}}>{clinic.phone}</span>
                          </p>
                        </div>
                      )}
                      
                      {clinic.openingHours && (
                        <div style={{marginBottom: '12px', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '8px'}}>
                          <p style={{fontSize: '14px', margin: 0}}>
                            <strong style={{color: '#15803d'}}>🕒 Giờ mở cửa:</strong> 
                            <span style={{marginLeft: '4px', color: '#374151'}}>{clinic.openingHours}</span>
                          </p>
                        </div>
                      )}
                      
                      {clinic.services && clinic.services.length > 0 && (
                        <div style={{marginBottom: '12px', padding: '8px', backgroundColor: '#faf5ff', borderRadius: '8px'}}>
                          <div style={{fontSize: '14px'}}>
                            <strong style={{color: '#7c3aed'}}>🏥 Dịch vụ:</strong>
                            <ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '8px', margin: 0}}>
                              {clinic.services.map((service, idx) => (
                                <li key={idx} style={{fontSize: '12px', color: '#4b5563', marginBottom: '4px'}}>{service}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {/* Report Location Button */}
                      <div style={{marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e5e7eb'}}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReportLocation(clinic);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fbbf24',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: '8px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#fde68a';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#fef3c7';
                          }}
                        >
                          🚩 Báo cáo vị trí sai
                        </button>
                        
                        {clinic.source && (
                          <div style={{fontSize: '12px', color: '#9ca3af', textAlign: 'center'}}>
                            Nguồn: {clinic.source}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
      
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
        <button
          onClick={onLocationRequest}
          disabled={loading}
          className={`group p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-white/50 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
          }`}
          title="Lấy vị trí hiện tại"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      
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

export default GeoapifyMapComponent;
