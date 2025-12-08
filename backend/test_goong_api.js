import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api/goong';

const testGoongAPI = async () => {
  console.log('🧪 Bắt đầu test Goong API...\n');

  const testLocation = {
    lat: 10.762622,
    lon: 106.660172,
    name: 'TP. Hồ Chí Minh'
  };

  console.log(`📍 Vị trí test: ${testLocation.name} (${testLocation.lat}, ${testLocation.lon})\n`);

  try {
    console.log('1️⃣ Test: Tìm phòng khám gần tọa độ');
    const vetClinicsResponse = await axios.get(`${BASE_URL}/vet-clinics`, {
      params: {
        lat: testLocation.lat,
        lon: testLocation.lon,
        radius: 10000
      }
    });
    console.log(`✅ Tìm thấy ${vetClinicsResponse.data.total} phòng khám`);
    if (vetClinicsResponse.data.data.length > 0) {
      console.log(`   Phòng khám đầu tiên: ${vetClinicsResponse.data.data[0].name}`);
    }
    console.log('');

    console.log('2️⃣ Test: Geocode địa chỉ');
    const geocodeResponse = await axios.get(`${BASE_URL}/geocode`, {
      params: {
        address: 'Quận 1, TP.HCM'
      }
    });
    console.log(`✅ Geocode thành công`);
    console.log(`   Tọa độ: ${geocodeResponse.data.coordinates.lat}, ${geocodeResponse.data.coordinates.lon}`);
    console.log('');

    console.log('3️⃣ Test: Tìm phòng khám theo địa chỉ');
    const vetsByAddressResponse = await axios.get(`${BASE_URL}/vets-by-address`, {
      params: {
        address: 'Quận 1, TP.HCM',
        radius: 10000
      }
    });
    console.log(`✅ Tìm thấy ${vetsByAddressResponse.data.total} phòng khám`);
    console.log('');

    console.log('4️⃣ Test: Smart search');
    const smartSearchResponse = await axios.post(`${BASE_URL}/smart-search`, {
      query: 'thú y',
      latitude: testLocation.lat,
      longitude: testLocation.lon,
      radius: 10000
    });
    console.log(`✅ Smart search tìm thấy ${smartSearchResponse.data.total} kết quả`);
    console.log('');

    console.log('5️⃣ Test: Directions');
    const directionsResponse = await axios.get(`${BASE_URL}/directions`, {
      params: {
        startLat: testLocation.lat,
        startLng: testLocation.lon,
        endLat: 10.772622,
        endLng: 106.670172,
        vehicle: 'car'
      }
    });
    if (directionsResponse.data.success) {
      console.log(`✅ Directions thành công`);
      console.log(`   Khoảng cách: ${directionsResponse.data.data.distance.text}`);
      console.log(`   Thời gian: ${directionsResponse.data.data.duration.text}`);
    }
    console.log('');

    console.log('🎉 Tất cả tests đã pass!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
};

testGoongAPI();
