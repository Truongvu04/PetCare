// PetCare/backend/config/db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Tạo connection pool dùng cấu hình từ .env
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pet_care_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: 0,
  decimalNumbers: true,
  // ✅ Thay đổi ở đây: Luôn lấy DATE/DATETIME/TIMESTAMP dưới dạng chuỗi
  dateStrings: true,
});

// Sử dụng promise API để dễ dùng async/await
const promisePool = pool.promise();

/**
 * db helper: expose query and execute that return the rows directly
 * - query(sql, params) => Promise<rows>
 * - execute(sql, params) => Promise<rows> (Thường dùng cho INSERT/UPDATE/DELETE, trả về metadata)
 */
const db = {
  query: async (sql, params) => {
    try {
      const [rows] = await promisePool.query(sql, params);
      return rows;
    } catch (err) {
      console.error(`DB Query Error: ${sql}`, params, err); // Log lỗi chi tiết hơn
      throw err; // Re-throw để controller xử lý
    }
  },
  execute: async (sql, params) => {
    try {
      // Execute thường trả về [result, fields], ta cần result
      const [result] = await promisePool.execute(sql, params);
      return result; // Trả về metadata (affectedRows, insertId,...)
    } catch (err) {
      console.error(`DB Execute Error: ${sql}`, params, err); // Log lỗi chi tiết hơn
      throw err;
    }
  },
  // Nếu cần raw pool elsewhere
  pool: promisePool,
};

module.exports = db;