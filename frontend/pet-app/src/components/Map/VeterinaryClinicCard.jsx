import React from 'react';

const VeterinaryClinicCard = ({ 
  clinic, 
  isSelected = false, 
  onClick, 
  userLocation = null,
  showDetailedInfo = false 
}) => {
  // Calculate distance if user location is available
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distance = userLocation && clinic.coordinates ? 
    calculateDistance(
      userLocation.lat || userLocation.latitude, 
      userLocation.lng || userLocation.longitude, 
      clinic.coordinates.lat, 
      clinic.coordinates.lng
    ) : null;

  const formatDistance = (dist) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(1)}km`;
  };

  const formatTravelTime = () => {
    if (clinic.travelInfo) {
      return `${clinic.travelInfo.formatted} (${clinic.travelInfo.distance} km)`;
    }
    if (clinic.distance) {
      return `${clinic.distance.toFixed(1)} km`;
    }
    if (distance) {
      return formatDistance(distance);
    }
    return null;
  };

  const handlePhoneClick = (e) => {
    e.stopPropagation();
    if (clinic.phone && clinic.phone !== 'Chưa có thông tin') {
      window.open(`tel:${clinic.phone}`);
    }
  };

  const handleEmailClick = (e) => {
    e.stopPropagation();
    if (clinic.email) {
      window.open(`mailto:${clinic.email}`);
    }
  };

  const handleWebsiteClick = (e) => {
    e.stopPropagation();
    if (clinic.website) {
      window.open(clinic.website, '_blank');
    }
  };

  const handleDirectionsClick = (e) => {
    e.stopPropagation();
    if (clinic.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates.lat},${clinic.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(clinic);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50
        ${isSelected 
          ? 'bg-blue-50 border-r-4 border-blue-500 shadow-sm' 
          : 'hover:shadow-sm'
        }
      `}
    >
      {/* Top Rated Badge */}
      {clinic.isTopRated && (
        <div className="mb-2">
          <span className="inline-block bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            TOP RATED
          </span>
        </div>
      )}

      {/* Clinic Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-sm leading-tight mb-1 pr-2
            ${isSelected ? 'text-blue-900' : 'text-gray-900'}
          `}>
            {clinic.name}
          </h3>
          
          {/* Rating */}
          {clinic.rating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-xs ${
                      i < Math.floor(clinic.rating) 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700">
                {clinic.rating}
              </span>
              {clinic.reviews > 0 && (
                <span className="text-xs text-gray-500">
                  ({clinic.reviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Distance/Travel Time Badge */}
        {formatTravelTime() && (
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2
            ${isSelected 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {formatTravelTime()}
          </div>
        )}

        {/* Business Status */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
          clinic.isOpen 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {clinic.businessStatus || (clinic.isOpen ? 'Mở cửa' : 'Đóng cửa')}
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-3">
        <span className={`
          material-symbols-outlined text-sm mt-0.5 flex-shrink-0
          ${isSelected ? 'text-blue-600' : 'text-gray-400'}
        `}>
          location_on
        </span>
        <p className="text-xs text-gray-600 leading-relaxed">
          {clinic.address}
        </p>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        {clinic.phone && clinic.phone !== 'Chưa có thông tin' && (
          <div className="flex items-center gap-2">
            <span className={`
              material-symbols-outlined text-sm
              ${isSelected ? 'text-blue-600' : 'text-gray-400'}
            `}>
              phone
            </span>
            <span className="text-xs text-gray-600">{clinic.phone}</span>
          </div>
        )}

        {clinic.email && showDetailedInfo && (
          <div className="flex items-center gap-2">
            <span className={`
              material-symbols-outlined text-sm
              ${isSelected ? 'text-blue-600' : 'text-gray-400'}
            `}>
              email
            </span>
            <span className="text-xs text-gray-600 truncate">{clinic.email}</span>
          </div>
        )}

        {clinic.website && showDetailedInfo && (
          <div className="flex items-center gap-2">
            <span className={`
              material-symbols-outlined text-sm
              ${isSelected ? 'text-blue-600' : 'text-gray-400'}
            `}>
              language
            </span>
            <span className="text-xs text-gray-600">Website có sẵn</span>
          </div>
        )}

        {clinic.openingHours && (
          <div className="flex items-center gap-2">
            <span className={`
              material-symbols-outlined text-sm
              ${isSelected ? 'text-blue-600' : 'text-gray-400'}
            `}>
              schedule
            </span>
            <span className="text-xs text-gray-600">{clinic.openingHours}</span>
          </div>
        )}
      </div>

      {/* Services */}
      {clinic.services && clinic.services.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {clinic.services.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className={`
                  px-2 py-1 rounded text-xs
                  ${isSelected 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {service}
              </span>
            ))}
            {clinic.services.length > 3 && (
              <span className="text-xs text-gray-500 px-1 py-1">
                +{clinic.services.length - 3} khác
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Only show if detailed info is enabled */}
      {showDetailedInfo && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {clinic.phone && clinic.phone !== 'Chưa có thông tin' && (
            <button
              onClick={handlePhoneClick}
              className="bg-green-600 text-white py-1 px-2 rounded text-xs font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">call</span>
              Gọi
            </button>
          )}
          
          <button
            onClick={handleDirectionsClick}
            className="bg-blue-600 text-white py-1 px-2 rounded text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">directions</span>
            Chỉ đường
          </button>

          {clinic.email && (
            <button
              onClick={handleEmailClick}
              className="bg-purple-600 text-white py-1 px-2 rounded text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">email</span>
              Email
            </button>
          )}

          {clinic.website && (
            <button
              onClick={handleWebsiteClick}
              className="bg-gray-600 text-white py-1 px-2 rounded text-xs font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">language</span>
              Website
            </button>
          )}
        </div>
      )}

      {/* Quality Score */}
      {clinic.score && showDetailedInfo && (
        <div className="mb-3 bg-gray-50 rounded p-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Điểm chất lượng:</span>
            <span className="font-semibold text-blue-600">{(clinic.score * 100).toFixed(0)}/100</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {/* Source */}
        {clinic.source && (
          <span className="text-xs text-gray-400 capitalize">
            {clinic.source}
          </span>
        )}

        {/* Action Hint */}
        <div className={`
          flex items-center gap-1 text-xs
          ${isSelected ? 'text-blue-600' : 'text-gray-400'}
        `}>
          {isSelected ? (
            <>
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>Đang xem</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">touch_app</span>
              <span>Nhấn để xem</span>
            </>
          )}
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
      )}
    </div>
  );
};

export default VeterinaryClinicCard;