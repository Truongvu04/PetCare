# Hướng Dẫn Cài Đặt PetCare+

## 📋 Yêu Cầu Hệ Thống

- Node.js >= 16.x
- MySQL >= 8.0
- npm hoặc yarn

## 🚀 Cài Đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd PetCare
```

### 2. Cấu Hình Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa file .env với thông tin của bạn
# - Database credentials
# - JWT secret
# - Goong API keys
# - Email credentials (nếu cần)
```

**Cấu hình Database:**
```bash
# Tạo database
mysql -u root -p
CREATE DATABASE petcare;
exit;

# Chạy migrations
npx prisma migrate dev
npx prisma generate
```

### 3. Cấu Hình Frontend

```bash
cd frontend/pet-app

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa file .env với Goong Map Tiles Key
```

### 4. Lấy Goong API Keys

1. Truy cập https://account.goong.io/
2. Đăng ký tài khoản
3. Tạo API key mới
4. Enable các services:
   - **Map Tiles** (cho frontend)
   - **Place API** (cho backend)
   - **Directions API** (cho backend)
5. Copy keys vào file `.env`

### 5. Khởi Động Ứng Dụng

**Backend:**
```bash
cd backend
npm start
# Server chạy tại http://localhost:5000
```

**Frontend:**
```bash
cd frontend/pet-app
npm run dev
# App chạy tại http://localhost:9000
```

## 🔑 Cấu Hình Tối Thiểu

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=petcare
DATABASE_URL="mysql://root:your_password@localhost:3306/petcare"

PORT=5000
JWT_SECRET=your_secret_key
GOONG_API_KEY=your_goong_api_key
GOONG_MAP_TILES_KEY=your_goong_map_tiles_key
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOONG_MAPTILES_KEY=your_goong_map_tiles_key
```

## 📝 Tính Năng Chính

- ✅ Quản lý thú cưng
- ✅ Tìm phòng khám thú y với Goong Map
- ✅ Chỉ đường đến phòng khám
- ✅ Đặt lịch hẹn
- ✅ Mua sắm sản phẩm
- ✅ Theo dõi sức khỏe thú cưng

## 🐛 Troubleshooting

**Lỗi: Map không hiển thị**
- Kiểm tra `VITE_GOONG_MAPTILES_KEY` trong frontend/.env
- Đảm bảo key đã enable "Map Tiles" service

**Lỗi: Không tìm thấy phòng khám**
- Kiểm tra `GOONG_API_KEY` trong backend/.env
- Đảm bảo key đã enable "Place API" service

**Lỗi: Database connection**
- Kiểm tra MySQL đang chạy
- Kiểm tra credentials trong .env
- Chạy `npx prisma migrate dev`

## 📚 Tài Liệu

- [Goong Map Documentation](https://docs.goong.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request.

## 📄 License

MIT License
