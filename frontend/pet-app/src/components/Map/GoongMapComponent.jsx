import React, { useEffect, useRef, useState } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import polyline from "@mapbox/polyline";
import LocationFeedbackModal from "./LocationFeedbackModal";

const GoongMapComponent = ({
  clinics = [],
  userLocation = null,
  zoomLevel = 13,
  onLocationRequest,
  loading = false,
  selectedClinic = null,
  onMarkerClick,
  onClinicSelect,
  showUserMarker = true,
  autoFitBounds = false,
  routeData = null
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const userMarker = useRef(null);
  const routeLayer = useRef(null);
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, clinic: null });

  // Goong cần Map Tiles Key riêng để hiển thị bản đồ
  // Nếu không có VITE_GOONG_MAP_TILES_KEY, sẽ fallback về VITE_GOONG_API_KEY
  const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;
  const defaultCenter = [108.2261, 15.6696];

  useEffect(() => {
    if (map.current) {
      console.log("⚠️ Map đã được khởi tạo trước đó, bỏ qua...");
      return;
    }

    if (!mapContainer.current) {
      console.error("❌ mapContainer.current không tồn tại!");
      return;
    }

    if (!GOONG_MAPTILES_KEY) {
      console.error("❌ VITE_GOONG_MAPTILES_KEY không được cấu hình!");
      return;
    }

    goongjs.accessToken = GOONG_MAPTILES_KEY;
    
    const center = userLocation 
      ? [userLocation.longitude, userLocation.latitude]
      : defaultCenter;

    try {
      console.log("🚀 Tạo Goong Map instance...");
      // Goong JS SDK tự động sử dụng accessToken đã set ở trên
      map.current = new goongjs.Map({
        container: mapContainer.current,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: center,
        zoom: zoomLevel,
      });

      console.log("✅ Map instance đã được tạo:", map.current);

      map.current.on('load', () => {
        console.log("✅ Goong Map đã load thành công!");
        console.log("🗺️ Map state:", {
          loaded: map.current?.loaded(),
          style: map.current?.getStyle()?.name,
          center: map.current?.getCenter(),
          zoom: map.current?.getZoom()
        });
      });

      map.current.on('error', (e) => {
        console.error("❌ Goong Map error:", e);
        console.error("Error details:", {
          error: e.error,
          status: e.error?.status,
          url: e.error?.url,
          message: e.error?.message
        });
        
        // Kiểm tra lỗi 403 - Forbidden
        if (e.error?.status === 403) {
          console.error("🚫 Lỗi 403: API key không có quyền truy cập Map Tiles!");
          console.error("💡 Giải pháp:");
          console.error("   1. Vào https://account.goong.io/");
          console.error("   2. Kiểm tra API key có được ENABLE 'Map Tiles' service không");
          console.error("   3. Nếu chưa, hãy tạo API key mới và enable Map Tiles");
          console.error("   4. Thêm vào .env: VITE_GOONG_MAP_TILES_KEY=your_new_key_here");
          console.error("   5. Restart dev server");
        }
      });

      map.current.on('style.load', () => {
        console.log("✅ Map style đã load!");
      });

      map.current.on('style.error', (e) => {
        console.error("❌ Map style error:", e);
        console.error("Style error details:", {
          error: e.error,
          status: e.error?.status,
          url: e.error?.url
        });
      });

      map.current.on('data', (e) => {
        if (e.dataType === 'style') {
          console.log("📊 Style data loaded");
        }
      });

      map.current.addControl(new goongjs.NavigationControl(), "top-right");
      console.log("✅ Navigation control đã được thêm");
    } catch (error) {
      console.error("❌ Lỗi khi khởi tạo Goong Map:", error);
      console.error("Chi tiết lỗi:", error.message);
      console.error("Stack trace:", error.stack);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !routeData) {
      if (map.current && routeLayer.current) {
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
        routeLayer.current = null;
      }
      return;
    }

    const drawRoute = () => {
      if (!map.current.loaded()) {
        map.current.once('load', drawRoute);
        return;
      }

      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }

      const coordinates = polyline.decode(routeData.geometry);
      const geojson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates.map(coord => [coord[1], coord[0]])
        }
      };

      map.current.addSource('route', {
        type: 'geojson',
        data: geojson
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 4
        }
      });

      routeLayer.current = true;
    };

    drawRoute();
  }, [routeData]);

  useEffect(() => {
    if (!map.current || !userLocation) return;

    const center = [userLocation.longitude, userLocation.latitude];
    map.current.flyTo({ center, zoom: zoomLevel });

    if (userMarker.current) {
      userMarker.current.remove();
    }

    if (showUserMarker) {
      const el = document.createElement("div");
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = userLocation.isFallback ? "#FFA500" : "#4A90E2";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

      const popup = new goongjs.Popup({ offset: 25 }).setHTML(`
        <div style="text-align: center; font-size: 12px;">
          <strong>${userLocation.isFallback ? "Vị trí mặc định" : "Vị trí của bạn"}</strong><br/>
          <small>${userLocation.isFallback ? "Vui lòng bật truy cập vị trí" : `Độ chính xác: ${userLocation.accuracy?.toFixed(0)}m`}</small>
        </div>
      `);

      userMarker.current = new goongjs.Marker({ element: el })
        .setLngLat(center)
        .setPopup(popup)
        .addTo(map.current);
    }
  }, [userLocation, showUserMarker, zoomLevel]);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    let addedMarkers = 0;

    clinics.forEach((clinic, index) => {
      if (!clinic.coordinates?.lat || !clinic.coordinates?.lng) {
        return;
      }

      addedMarkers++;

      const el = document.createElement("div");
      el.style.width = selectedClinic?.id === clinic.id ? "35px" : "28px";
      el.style.height = selectedClinic?.id === clinic.id ? "35px" : "28px";
      el.style.backgroundColor = selectedClinic?.id === clinic.id ? "#10B981" : "#EF4444";
      el.style.borderRadius = "50% 50% 50% 0";
      el.style.transform = "rotate(-45deg)";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";

      const popupContent = `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">${clinic.name}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${clinic.address || "Chưa có địa chỉ"}</p>
          ${clinic.phone ? `<p style="font-size: 12px; margin-bottom: 4px;">📞 <b>${clinic.phone}</b></p>` : ""}
          ${clinic.distance ? `<p style="font-size: 12px; margin-bottom: 4px; color: #3B82F6;">📏 Cách bạn: ${(clinic.distance / 1000).toFixed(1)} km</p>` : ""}
        </div>
      `;

      const popup = new goongjs.Popup({ offset: 25 }).setHTML(popupContent);

      const marker = new goongjs.Marker({ element: el })
        .setLngLat([clinic.coordinates.lng, clinic.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener("click", () => {
        onMarkerClick?.(clinic);
        onClinicSelect?.(clinic);
      });

      markers.current.push(marker);
    });

    if (autoFitBounds && clinics.length > 0) {
      const bounds = new goongjs.LngLatBounds();
      
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude]);
      }

      clinics.forEach(c => {
        if (c.coordinates?.lat && c.coordinates?.lng) {
          bounds.extend([c.coordinates.lng, c.coordinates.lat]);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      }
    }
  }, [clinics, selectedClinic, autoFitBounds, userLocation, onMarkerClick, onClinicSelect]);

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

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

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

      <LocationFeedbackModal
        isOpen={feedbackModal.isOpen}
        clinic={feedbackModal.clinic}
        onClose={() => setFeedbackModal({ isOpen: false, clinic: null })}
        onSubmitFeedback={handleSubmitFeedback}
      />
    </div>
  );
};

export default GoongMapComponent;
