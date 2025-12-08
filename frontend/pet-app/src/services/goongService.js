const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const goongService = {
  async autoLocateVeterinaryClinics(latitude, longitude, radius = 10000) {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        radius: radius.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/goong/auto-locate?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error auto-locating veterinary clinics:', error.message);
      return { success: false, data: [], total: 0, error: error.message };
    }
  },

  async smartSearchEnhanced({ query = '', latitude, longitude, radius = 10000 }) {
    try {
      const body = {
        ...(query.trim() !== '' ? { query } : {}),
        latitude,
        longitude,
        radius,
      };

      const response = await fetch(`${API_BASE_URL}/goong/smart-search-enhanced`, {
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

  async getVeterinaryClinics(latitude, longitude, radius = 10000, query = '') {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        radius: radius.toString(),
      });
      if (query.trim() !== '') params.append('query', query);

      const response = await fetch(`${API_BASE_URL}/goong/vet-clinics?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error fetching veterinary clinics:', error.message);
      return { success: false, data: [], total: 0, error: error.message };
    }
  },

  async geocodeAddress(address) {
    try {
      const params = new URLSearchParams({ address });
      const response = await fetch(`${API_BASE_URL}/goong/geocode?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error geocoding address:', error.message);
      return { success: false, data: [], error: error.message };
    }
  },

  async findVetsByAddress(address, radius = 10000) {
    try {
      const params = new URLSearchParams({ address, radius: radius.toString() });
      const response = await fetch(`${API_BASE_URL}/goong/vets-by-address?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error finding vets by address:', error.message);
      return { success: false, data: [], error: error.message };
    }
  },

  async smartSearch({ query = '', latitude, longitude, radius = 10000, filters = {} }) {
    try {
      const body = {
        ...(query.trim() !== '' ? { query } : {}),
        latitude,
        longitude,
        radius,
        ...filters,
      };

      const response = await fetch(`${API_BASE_URL}/goong/smart-search`, {
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

  async getDirections(startLat, startLng, endLat, endLng, vehicle = 'car') {
    try {
      const params = new URLSearchParams({
        startLat: startLat.toString(),
        startLng: startLng.toString(),
        endLat: endLat.toString(),
        endLng: endLng.toString(),
        vehicle,
      });

      const response = await fetch(`${API_BASE_URL}/goong/directions?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `HTTP error ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error getting directions:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getCombinedResults(latitude, longitude, radius = 10000, query = '') {
    try {
      const [goongResults, localResults] = await Promise.allSettled([
        this.getVeterinaryClinics(latitude, longitude, radius, query),
        this.getLocalVets(latitude, longitude, radius / 1000, query),
      ]);

      const combined = [];
      if (goongResults.status === 'fulfilled' && goongResults.value.success) {
        combined.push(...goongResults.value.data);
      }
      if (localResults.status === 'fulfilled' && localResults.value.success) {
        combined.push(...localResults.value.data);
      }

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

  async getLocalVets(latitude, longitude, radius = 15, query = '') {
    try {
      console.log('⚠️ Local vets API chưa được triển khai, trả về empty array');
      return { 
        success: true, 
        data: [],
        total: 0,
        message: 'Local vets API chưa sẵn sàng'
      };
    } catch (error) {
      console.error('Error fetching local vets:', error.message);
      return { success: false, data: [], total: 0 };
    }
  },

  removeDuplicates(clinics) {
    const seen = new Set();
    return clinics.filter(clinic => {
      const key = `${clinic.name}_${clinic.lat}_${clinic.lon}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

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
