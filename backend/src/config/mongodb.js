/**
 * File: mongodb.js
 * Mục đích: Cấu hình và kết nối MongoDB
 * Vai trò:
 *   - Thiết lập kết nối đến MongoDB database
 *   - Sử dụng Mongoose ORM
 * Lưu ý:
 *   - Connection string lấy từ biến môi trường MONGODB_URI
 *   - Nếu kết nối thất bại, process sẽ exit
 *   - Mongoose options để tránh deprecation warnings
 */

const mongoose = require('mongoose');

/**
 * Hàm kết nối MongoDB
 * @throws {Error} Nếu kết nối thất bại
 */
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
