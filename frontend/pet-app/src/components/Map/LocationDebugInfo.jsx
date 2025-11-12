import React from 'react';

const LocationDebugInfo = ({ location, error, loading }) => {
  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔧 Debug Info (Dev Only)</div>
      
      <div className="space-y-1">
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        
        {error && (
          <div className="text-red-300">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {location && (
          <>
            <div>
              <strong>Location:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
            <div>
              <strong>Accuracy:</strong> {location.accuracy?.toFixed(0)}m
            </div>
            <div>
              <strong>Fallback:</strong> {location.isFallback ? 'Yes' : 'No'}
            </div>
          </>
        )}
        
        <div>
          <strong>HTTPS:</strong> {window.location.protocol === 'https:' ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Geolocation API:</strong> {navigator.geolocation ? 'Available' : 'Not Available'}
        </div>
        
        <div>
          <strong>Permissions API:</strong> {navigator.permissions ? 'Available' : 'Not Available'}
        </div>
      </div>
    </div>
  );
};

export default LocationDebugInfo;