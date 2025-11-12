const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const veterinaryService = {
  async getNearbyVets(latitude, longitude, radius = 15) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vets/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching nearby vets:', error);
      throw new Error('Không thể tải danh sách phòng khám gần đây');
    }
  },

  async searchVets(query, latitude = null, longitude = null) {
    try {
      let url = `${API_BASE_URL}/vets/search?query=${encodeURIComponent(query)}`;
      
      if (latitude && longitude) {
        url += `&lat=${latitude}&lng=${longitude}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching vets:', error);
      throw new Error('Không thể tìm kiếm phòng khám');
    }
  },

  async getVetById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/vets/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vet details:', error);
      throw new Error('Không thể tải thông tin phòng khám');
    }
  }
};