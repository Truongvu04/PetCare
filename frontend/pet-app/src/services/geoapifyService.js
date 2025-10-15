const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const geoapifyService = {
  async autoLocateVeterinaryClinics(latitude, longitude, radius = 15000) {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        radius: radius.toString()
      });

      const response = await fetch(`${API_BASE_URL}/geoapify/auto-locate?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error auto-locating veterinary clinics:', error);
      
      return {
        success: false,
        data: [],
        total: 0,
        error: 'Không thể tự động tìm phòng khám gần bạn'
      };
    }
  },

  async smartSearchEnhanced(searchOptions) {
    const { query, latitude, longitude, radius = 15000, prioritizeLocal = true } = searchOptions;

    try {
      console.log('Frontend enhanced smart search:', searchOptions);

      const response = await fetch(`${API_BASE_URL}/geoapify/smart-search-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          latitude,
          longitude,
          radius,
          prioritizeLocal
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in enhanced smart search:', error);
      return {
        success: false,
        data: [],
        error: 'Có lỗi xảy ra khi tìm kiếm nâng cao'
      };
    }
  },
  async getVeterinaryClinics(latitude, longitude, radius = 15000, query = '') {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        radius: radius.toString()
      });
      
      if (query) {
        params.append('query', query);
      }

      const response = await fetch(`${API_BASE_URL}/geoapify/vet-clinics?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching veterinary clinics from Geoapify:', error);
      
      // Return empty result instead of throwing error
      return {
        success: true,
        data: [],
        total: 0,
        error: 'Không thể tải dữ liệu từ server, hiển thị kết quả trống'
      };
    }
  },

  // Geocoding địa chỉ thành tọa độ
  async geocodeAddress(address) {
    try {
      const params = new URLSearchParams({
        address: address
      });

      const response = await fetch(`${API_BASE_URL}/geoapify/geocode?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return {
        success: false,
        data: [],
        error: 'Không thể tìm kiếm địa chỉ'
      };
    }
  },

  // Tìm phòng khám theo địa chỉ
  async findVetsByAddress(address, radius = 15000) {
    try {
      const params = new URLSearchParams({
        address: address,
        radius: radius.toString()
      });

      const response = await fetch(`${API_BASE_URL}/geoapify/vets-by-address?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error finding vets by address:', error);
      return {
        success: false,
        data: [],
        error: 'Không thể tìm kiếm phòng khám theo địa chỉ'
      };
    }
  },

  // Smart search - thống nhất cho mọi loại tìm kiếm
  async smartSearch(searchOptions) {
    const { query, latitude, longitude, radius = 15000, filters = {} } = searchOptions;

    try {
      console.log('Frontend smart search:', searchOptions);

      const response = await fetch(`${API_BASE_URL}/geoapify/smart-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          latitude,
          longitude,
          radius,
          filters
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in smart search:', error);
      return {
        success: false,
        data: [],
        error: 'Có lỗi xảy ra khi tìm kiếm thông minh'
      };
    }
  },

  // Enhanced search - giữ lại để backward compatibility
  async enhancedSearch(searchOptions) {
    return this.smartSearch(searchOptions);
  },

  async searchPlaces(text, latitude = null, longitude = null, radius = 15000) {
    try {
      const params = new URLSearchParams({
        text: text,
        radius: radius.toString()
      });
      
      if (latitude && longitude) {
        params.append('lat', latitude.toString());
        params.append('lon', longitude.toString());
      }

      const response = await fetch(`${API_BASE_URL}/geoapify/search-places?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching places from Geoapify:', error);
      throw new Error('Không thể tìm kiếm địa điểm từ Geoapify');
    }
  },

  async getCombinedResults(latitude, longitude, radius = 15000, query = '') {
    try {
      const [geoapifyResults, localResults] = await Promise.allSettled([
        this.getVeterinaryClinics(latitude, longitude, radius, query),
        this.getLocalVets(latitude, longitude, radius, query)
      ]);

      const combinedClinics = [];
      
      if (geoapifyResults.status === 'fulfilled' && geoapifyResults.value.success) {
        combinedClinics.push(...geoapifyResults.value.data);
      }
      
      if (localResults.status === 'fulfilled' && localResults.value.success) {
        combinedClinics.push(...localResults.value.data);
      }

      const uniqueClinics = this.removeDuplicates(combinedClinics);
      
      return {
        success: true,
        data: uniqueClinics,
        total: uniqueClinics.length,
        sources: {
          geoapify: geoapifyResults.status === 'fulfilled' ? geoapifyResults.value.data?.length || 0 : 0,
          local: localResults.status === 'fulfilled' ? localResults.value.data?.length || 0 : 0
        }
      };
    } catch (error) {
      console.error('Error getting combined results:', error);
      throw new Error('Không thể tải dữ liệu phòng khám');
    }
  },

  async getLocalVets(latitude, longitude, radius = 15, query = '') {
    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: radius.toString()
      });
      
      if (query) {
        params.append('query', query);
      }

      const response = await fetch(`${API_BASE_URL}/vets/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching local vets:', error);
      return { success: false, data: [] };
    }
  },

  removeDuplicates(clinics) {
    const seen = new Set();
    return clinics.filter(clinic => {
      const key = `${clinic.name}_${clinic.coordinates.lat}_${clinic.coordinates.lng}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};
