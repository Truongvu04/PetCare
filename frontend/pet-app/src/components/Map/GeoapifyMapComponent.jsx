import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationFeedbackModal from "./LocationFeedbackModal";

// --- Leaflet marker setup ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const iconBase = (color) =>
  new L.Icon({
    iconUrl: `/leaflet/marker-icon-2x-${color}.png`,
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

const icons = {
  user: iconBase("blue"),
  fallback: iconBase("yellow"),
  vet: iconBase("red"),
  selectedVet: new L.Icon({
    iconUrl: "/leaflet/marker-icon-2x-green.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -34],
    shadowSize: [49, 49]
  })
};

// --- Helper components ---
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function AutoFitBounds({ clinics, userLocation, enabled }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !clinics?.length || clinics.every(c => !c.coordinates)) return;

    const bounds = L.latLngBounds();
    let valid = false;

    if (userLocation?.latitude && userLocation?.longitude) {
      bounds.extend([userLocation.latitude, userLocation.longitude]);
      valid = true;
    }

    clinics.forEach((c) => {
      if (c.coordinates?.lat && c.coordinates?.lng) {
        bounds.extend([c.coordinates.lat, c.coordinates.lng]);
        valid = true;
      }
    });

    if (valid) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
  }, [clinics, userLocation, enabled, map]);
  return null;
}

// --- Main Map Component ---
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
  const defaultCenter = [15.6696, 108.2261];
  const GEOAPIFY_API_KEY =
    import.meta.env.VITE_GEOAPIFY_API_KEY ||
    "ddc30e8d91ed4bd0bf4d47a0e83bb315";

  // --- Validate coordinate helper ---
  const validateCoordinates = (lat, lng) => {
    const la = parseFloat(lat),
      lo = parseFloat(lng);
    if (!lat || !lng || isNaN(la) || isNaN(lo)) return null;
    if (la < -90 || la > 90 || lo < -180 || lo > 180) return null;
    return { lat: la, lng: lo };
  };

  // --- Determine center position ---
  const mapCenter = useMemo(() => {
    const valid = userLocation
      ? validateCoordinates(userLocation.latitude, userLocation.longitude)
      : null;
    return valid ? [valid.lat, valid.lng] : defaultCenter;
  }, [userLocation]);

  // --- Handle feedback modal ---
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, clinic: null });

  const handleReportLocation = (clinic) =>
    setFeedbackModal({ isOpen: true, clinic });

  const handleSubmitFeedback = async (feedback) => {
    try {
      const list = JSON.parse(localStorage.getItem("location-feedbacks") || "[]");
      list.push(feedback);
      localStorage.setItem("location-feedbacks", JSON.stringify(list));
      console.log("Feedback saved:", feedback);
    } catch (err) {
      console.error("Feedback save error:", err);
    }
  };

  // --- Filter valid clinics only ---
  const validClinics = useMemo(() => {
    const valid = clinics.filter((c) => {
      const validCoords = validateCoordinates(
        c.coordinates?.lat,
        c.coordinates?.lng
      );
      return validCoords;
    });
    const invalidCount = clinics.length - valid.length;
    if (invalidCount > 0)
      console.debug(`[Map] Skipped ${invalidCount} clinics due to invalid coordinates.`);
    return valid;
  }, [clinics]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: "100%", width: "100%" }}>
        <ChangeView center={mapCenter} zoom={zoomLevel} />
        <AutoFitBounds
          clinics={validClinics}
          userLocation={userLocation}
          enabled={autoFitBounds}/>

        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
          attribution='&copy; OpenStreetMap contributors | Geoapify'/>

        {/* --- User Marker --- */}
        {showUserMarker && userLocation && (() => {
          const valid = validateCoordinates(userLocation.latitude, userLocation.longitude);
          if (!valid) return null;
          const icon = userLocation.isFallback
            ? icons.fallback
            : icons.user;

          return (
            <Marker position={[valid.lat, valid.lng]} icon={icon}>
              <Popup>
                <div className="text-center text-sm">
                  <strong>
                    {userLocation.isFallback
                      ? "Vị trí mặc định"
                      : userLocation.isSearchLocation
                      ? "Vị trí tìm kiếm"
                      : "Vị trí của bạn"}
                  </strong>
                  <br />
                  <small>
                    {userLocation.isFallback
                      ? "Vui lòng bật truy cập vị trí để chính xác hơn"
                      : `Độ chính xác: ${userLocation.accuracy?.toFixed(0)}m`}
                  </small>
                </div>
              </Popup>
            </Marker>
          );
        })()}

        {/* --- Clinic Markers --- */}
        {validClinics.map((clinic, idx) => {
          const { lat, lng } = validateCoordinates(
            clinic.coordinates?.lat,
            clinic.coordinates?.lng
          );
          const isSelected = selectedClinic?.id === clinic.id;

          return (
            <Marker
              key={clinic.id || idx}
              position={[lat, lng]}
              icon={isSelected ? icons.selectedVet : icons.vet}
              eventHandlers={{
                click: () => {
                  onMarkerClick?.(clinic);
                  onClinicSelect?.(clinic);
                }
              }}
            >
              {showPopup && (
                <Popup autoPan keepInView>
                  <div style={{ padding: "10px", maxWidth: "250px" }}>
                    <h3 className="font-bold text-gray-800 text-base mb-1">
                      {clinic.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {clinic.address || "Chưa có địa chỉ"}
                    </p>

                    {clinic.phone && (
                      <p className="text-sm mb-1">
                        📞 <b>{clinic.phone}</b>
                      </p>
                    )}

                    {clinic.openingHours && (
                      <p className="text-sm mb-1">
                        🕒 {clinic.openingHours}
                      </p>
                    )}

                    <button
                      className="mt-2 w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300 rounded-md text-xs p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportLocation(clinic);
                      }}
                    >
                      🚩 Báo cáo vị trí sai
                    </button>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {/* --- Location Button --- */}
      <button
        onClick={onLocationRequest}
        disabled={loading}
        title="Lấy vị trí hiện tại"
        className={`absolute top-4 right-4 z-10 p-3 rounded-lg shadow-md border bg-white/90 hover:bg-white transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
          </svg>
        )}
      </button>

      {/* --- Feedback Modal --- */}
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
