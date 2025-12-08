import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Simple marker clustering implementation
const MapMarkerCluster = ({ clinics, selectedClinic, onMarkerClick, userLocation, vetIcon, selectedVetIcon }) => {
  const map = useMap();
  const markerGroupRef = useRef(null);

  useEffect(() => {
    if (!map || clinics.length === 0) return;

    // Remove existing markers
    if (markerGroupRef.current) {
      map.removeLayer(markerGroupRef.current);
    }

    // Create marker group
    const markerGroup = L.layerGroup();

    clinics.forEach((clinic) => {
      const lat = clinic.coordinates?.lat || clinic.lat;
      const lng = clinic.coordinates?.lng || clinic.lon;
      
      if (!lat || !lng) return;

      const isSelected = selectedClinic && selectedClinic.id === clinic.id;
      const icon = isSelected ? selectedVetIcon : vetIcon;

      const marker = L.marker([lat, lng], { icon });

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px; padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #111827;">${clinic.name || 'Phòng khám'}</h3>
          <p style="font-size: 14px; color: #4b5563; margin-bottom: 8px;">${clinic.address || 'Chưa có địa chỉ'}</p>
          ${clinic.phone ? `<p style="font-size: 13px; color: #374151; margin-bottom: 4px;">📞 ${clinic.phone}</p>` : ''}
          ${clinic.rating ? `<p style="font-size: 13px; color: #374151;">⭐ ${clinic.rating}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(clinic);
      });

      markerGroup.addLayer(marker);
    });

    markerGroup.addTo(map);
    markerGroupRef.current = markerGroup;

    // Fit bounds to show all markers
    if (clinics.length > 0) {
      const bounds = markerGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    return () => {
      if (markerGroupRef.current) {
        map.removeLayer(markerGroupRef.current);
      }
    };
  }, [map, clinics, selectedClinic, onMarkerClick, vetIcon, selectedVetIcon]);

  return null;
};

export default MapMarkerCluster;

