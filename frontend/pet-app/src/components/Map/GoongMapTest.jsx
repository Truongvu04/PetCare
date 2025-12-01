import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

const GoongMapTest = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const GOONG_MAPTILES_KEY = "RtbRUAKL7yWvee1MvafHRtPxLdbxaY27UkI5BCb4";

  useEffect(() => {
    if (map.current) return;

    console.log("🗺️ Khởi tạo Goong Map...");
    console.log("Map Tiles Key:", GOONG_MAPTILES_KEY);

    goongjs.accessToken = GOONG_MAPTILES_KEY;

    try {
      map.current = new goongjs.Map({
        container: mapContainer.current,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: [108.2261, 15.6696],
        zoom: 13,
      });

      map.current.on('load', () => {
        console.log("✅ Goong Map loaded successfully!");
      });

      map.current.on('error', (e) => {
        console.error("❌ Goong Map error:", e);
      });

      map.current.addControl(new goongjs.NavigationControl(), "top-right");

    } catch (error) {
      console.error("❌ Error creating Goong Map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <h2 style={{ padding: "20px", textAlign: "center" }}>
        Test Goong Map JS
      </h2>
      <div 
        ref={mapContainer} 
        style={{ 
          width: "100%", 
          height: "500px",
          border: "2px solid #ccc"
        }} 
      />
    </div>
  );
};

export default GoongMapTest;
