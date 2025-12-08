import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fallback location (Vietnam center)
  const fallbackLocation = {
    latitude: 15.6696,
    longitude: 108.2261,
    accuracy: 10000,
    isFallback: true
  };

  const getCurrentLocation = () => {
    console.log('Getting current location...');
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const errorMsg = 'Trình duyệt không hỗ trợ định vị';
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 30000, // Increase timeout to 30 seconds
      maximumAge: 300000 // 5 minutes cache
    };

    console.log('Requesting geolocation with options:', options);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation success:', position);
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        console.log('Setting location:', newLocation);
        setLocation(newLocation);
        setError(null);
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Không thể xác định vị trí';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn cần cho phép truy cập vị trí để tìm phòng khám gần nhất';
            console.error('Permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng. Vui lòng kiểm tra GPS/WiFi';
            console.error('Position unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu vị trí hết thời gian chờ. Vui lòng thử lại';
            console.error('Timeout');
            break;
          default:
            errorMessage = 'Lỗi không xác định khi lấy vị trí: ' + error.message;
            console.error('Unknown error:', error);
            break;
        }
        
        // Use fallback location if geolocation fails
        console.log('Using fallback location:', fallbackLocation);
        setLocation(fallbackLocation);
        setError(errorMessage);
        setLoading(false);
      },
      options
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  const forceGetLocation = () => {
    console.log('Force getting location...');
    setLocation(null);
    setError(null);
    getCurrentLocation();
  };

  useEffect(() => {
    // Auto-request location on mount for better UX
    console.log('useGeolocation hook mounted');
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearLocation,
    forceGetLocation
  };
};