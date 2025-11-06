import React from "react";

const VeterinaryClinicCard = ({
  clinic,
  isSelected = false,
  onClick,
  userLocation = null,
  showDetailedInfo = false,
}) => {
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const distance =
    userLocation && clinic.coordinates
      ? calculateDistance(
          userLocation.lat || userLocation.latitude,
          userLocation.lng || userLocation.longitude,
          clinic.coordinates.lat,
          clinic.coordinates.lng
        )
      : null;

  const formatDistance = (dist) =>
    dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;

  const formatTravelTime = () => {
    if (clinic.travelInfo)
      return `${clinic.travelInfo.formatted} (${clinic.travelInfo.distance} km)`;
    if (clinic.distance) return `${clinic.distance.toFixed(1)} km`;
    if (distance) return formatDistance(distance);
    return null;
  };

  const handleClick = () => onClick && onClick(clinic);

  const handleOpenLink = (type, url) => {
    window.open(url, type === "website" ? "_blank" : undefined);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-4 cursor-pointer rounded-xl border transition-all duration-300 ease-out 
        transform hover:scale-[1.01] 
        ${
          isSelected
            ? "bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-300 ring-offset-1 animate-pulse-smooth"
            : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm"
        }
      `}
    >
      {/* Top Rated Badge */}
      {clinic.isTopRated && (
        <span className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          TOP
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm leading-tight mb-1 pr-2 ${
              isSelected ? "text-blue-900" : "text-gray-900"
            }`}
          >
            {clinic.name}
          </h3>

          {clinic.rating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${
                      i < Math.floor(clinic.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700">
                {clinic.rating}
              </span>
            </div>
          )}
        </div>

        {formatTravelTime() && (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
              isSelected
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {formatTravelTime()}
          </div>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-3">
        <span
          className={`material-symbols-outlined text-sm mt-0.5 flex-shrink-0 ${
            isSelected ? "text-blue-600" : "text-gray-400"
          }`}
        >
          location_on
        </span>
        <p className="text-xs text-gray-600 leading-relaxed truncate">
          {clinic.address}
        </p>
      </div>

      {/* Contact Buttons (compact) */}
      {showDetailedInfo && (
        <div className="flex flex-wrap gap-2 mb-3">
          {clinic.phone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLink("phone", `tel:${clinic.phone}`);
              }}
              className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition"
            >
              📞 Gọi
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenLink(
                "map",
                `https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates.lat},${clinic.coordinates.lng}`
              );
            }}
            className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
          >
            🗺️ Chỉ đường
          </button>
          {clinic.website && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLink("website", clinic.website);
              }}
              className="flex items-center gap-1 text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition"
            >
              🌐 Website
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
        {clinic.source && (
          <span className="capitalize">{clinic.source}</span>
        )}
        <div
          className={`flex items-center gap-1 ${
            isSelected ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {isSelected ? "visibility" : "touch_app"}
          </span>
          <span>{isSelected ? "Đang xem" : "Nhấn để xem"}</span>
        </div>
      </div>
    </div>
  );
};

// Tailwind custom animation (add to global.css if not present)
/* 
@keyframes pulse-smooth {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
  50% { box-shadow: 0 0 8px 2px rgba(59,130,246,0.2); }
}
.animate-pulse-smooth {
  animation: pulse-smooth 2s infinite;
}
*/

export default VeterinaryClinicCard;
