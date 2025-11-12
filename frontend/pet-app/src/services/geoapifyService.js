const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const geoapifyService = {
  // =======================
  // Tự động tìm phòng khám gần tọa độ
  // =======================
  async autoLocateVeterinaryClinics(latitude, longitude, radius = 15000) {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        radius: radius.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/geoapify/auto-locate?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error auto-locating veterinary clinics:', error.message);
      return { success: false, data: [], total: 0, error: error.message };
    }
  },

  // =======================
  // Smart Search nâng cao
  // =======================
  async smartSearchEnhanced({ query = '', latitude, longitude, radius = 15000 }) {
    try {
      const body = {
        ...(query.trim() !== '' ? { query } : {}),
        latitude,
        longitude,
        radius,
      };

      const response = await fetch(`${API_BASE_URL}/geoapify/smart-search-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error in enhanced smart search:', error.message);
      return { success: false, data: [], error: error.message };
    }
  },

  // =======================
  // Lấy danh sách phòng khám
  // =======================
  async getVeterinaryClinics(latitude, longitude, radius = 15000, query = '') {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        radius: radius.toString(),
      });
      if (query.trim() !== '') params.append('query', query);

      const response = await fetch(`${API_BASE_URL}/geoapify/vet-clinics?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error fetching veterinary clinics:', error.message);
      return { success: false, data: [], total: 0, error: error.message };
    }
  },

  // =======================
  // Geocode - chuyển địa chỉ thành tọa độ
  // =======================
  async geocodeAddress(address) {
    try {
      const params = new URLSearchParams({ address });
      const response = await fetch(`${API_BASE_URL}/geoapify/geocode?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error geocoding address:', error.message);
      return { success: false, data: [], error: error.message };
    }
  },

  // =======================
  // Tìm phòng khám theo địa chỉ
  // =======================
  async findVetsByAddress(address, radius = 15000) {
    try {
      const params = new URLSearchParams({ address, radius: radius.toString() });
      const response = await fetch(`${API_BASE_URL}/geoapify/vets-by-address?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error finding vets by address:', error.message);
      return { success: false, data: [], error: error.message };
    }
  },

  // =======================
  // Smart search chuẩn cho tất cả loại tìm kiếm
  // =======================
  async smartSearch({ query = '', latitude, longitude, radius = 15000, filters = {} }) {
    try {
      const body = {
        ...(query.trim() !== '' ? { query } : {}),
        latitude,
        longitude,
        radius,
        ...filters,
      };

      const response = await fetch(`${API_BASE_URL}/geoapify/smart-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error in smart search:', error.message);
      return { success: false, data: [], error: error.message };
    }
  },

  // =======================
  // Backward compatibility
  // =======================
  async enhancedSearch(searchOptions) {
    return this.smartSearch(searchOptions);
  },

  // =======================
  // Tìm kiếm địa điểm tổng quát
  // =======================
  async searchPlaces(text, latitude = null, longitude = null, radius = 15000) {
    try {
      const params = new URLSearchParams({ text, radius: radius.toString() });
      if (latitude && longitude) {
        params.append('lat', latitude.toString());
        params.append('lon', longitude.toString());
      }

      const response = await fetch(`${API_BASE_URL}/geoapify/search-places?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error searching places:', error.message);
      return { success: false, data: [], error: error.message };
    }
  },

  // =======================
  // Kết hợp kết quả Geoapify + Local Vets
  // =======================
  async getCombinedResults(latitude, longitude, radius = 15000, query = '') {
    try {
      const [geoapifyResults, localResults] = await Promise.allSettled([
        this.getVeterinaryClinics(latitude, longitude, radius, query),
        this.getLocalVets(latitude, longitude, radius, query),
      ]);

      const combined = [];
      if (geoapifyResults.status === 'fulfilled' && geoapifyResults.value.success) combined.push(...geoapifyResults.value.data);
      if (localResults.status === 'fulfilled' && localResults.value.success) combined.push(...localResults.value.data);

      return {
        success: true,
        data: this.removeDuplicates(combined),
        total: combined.length,
      };
    } catch (error) {
      console.error('Error getting combined results:', error.message);
      return { success: false, data: [], total: 0, error: error.message };
    }
  },

  // =======================
  // Lấy bác sĩ/vet local (local database)
  // =======================
  async getLocalVets(latitude, longitude, radius = 15, query = '') {
    try {
      const params = new URLSearchParams({ lat: latitude, lng: longitude, radius: radius.toString() });
      if (query.trim() !== '') params.append('query', query);

      const response = await fetch(`${API_BASE_URL}/vets/nearby?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error fetching local vets:', error.message);
      return { success: false, data: [] };
    }
  },

  // =======================
  // Loại bỏ trùng lặp
  // =======================
  removeDuplicates(clinics) {
    const seen = new Set();
    return clinics.filter(clinic => {
      const key = `${clinic.name}_${clinic.lat}_${clinic.lon}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  // =======================
  // Tính khoảng cách (km)
  // =======================
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
