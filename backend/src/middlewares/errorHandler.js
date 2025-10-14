/**
 * File: errorHandler.js
 * Mục đích: Global error handler middleware
 * Vai trò:
 *   - Xử lý tất cả errors được throw trong app
 *   - Format error response thống nhất
 * Lưu ý:
 *   - Phải đặt cuối cùng trong middleware chain (sau routes)
 *   - Stack trace chỉ hiện ở development mode
 *   - Có thể customize error response tùy loại error
 */

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    // Chỉ show stack trace ở development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
