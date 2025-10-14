/**
 * File: sqlserver.js
 * Mục đích: Cấu hình và kết nối SQL Server
 * Vai trò:
 *   - Thiết lập kết nối đến SQL Server database
 *   - Sử dụng Sequelize ORM
 * Lưu ý:
 *   - Connection config lấy từ biến môi trường
 *   - encrypt và trustServerCertificate cần true cho Azure SQL
 *   - Sequelize instance được export để sử dụng ở models và migrations
 *   - Logging chỉ bật ở development mode
 */

const { Sequelize } = require('sequelize');

// Khởi tạo Sequelize instance với cấu hình SQL Server
const sequelize = new Sequelize(
  process.env.MSSQL_DATABASE,
  process.env.MSSQL_USER,
  process.env.MSSQL_PASSWORD,
  {
    host: process.env.MSSQL_HOST,
    port: parseInt(process.env.MSSQL_PORT) || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.MSSQL_ENCRYPT === 'true',
        trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE === 'true',
      },
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

/**
 * Hàm kết nối SQL Server
 * @throws {Error} Nếu kết nối thất bại
 */
const connectSQLServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQL Server Connected successfully');
  } catch (error) {
    console.error('❌ SQL Server Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectSQLServer };
