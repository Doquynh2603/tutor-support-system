/**
 * File: logger.js
 * Mục đích: Custom logging middleware
 * Vai trò:
 *   - Log thông tin request (method, URL)
 *   - Hữu ích cho debugging
 * Lưu ý:
 *   - Hiện tại chỉ log console, có thể mở rộng log ra file
 *   - Morgan middleware cũng đang được dùng ở app.js
 */

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  next();
};

module.exports = logger;
