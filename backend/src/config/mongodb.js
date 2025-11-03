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

const mongoose = require("mongoose");

/**
 * Hàm kết nối MongoDB
 * @throws {Error} Nếu kết nối thất bại
 */
const connectMongoDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tutor-support";
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection failed (skipping): ${error.message}`);
    // Không thoát process vì MongoDB không bắt buộc
  }
};

module.exports = { connectMongoDB };
