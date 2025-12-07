/**
 * File: errorHandler.js
 * Mục đích: Global error handler middleware
 * Vai trò:
 *   - Xử lý tất cả errors được throw trong app
 *   - Format error response thống nhất
 */

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi server";

  if (statusCode === 403) {
    message = "Bạn không có quyền truy cập tài nguyên này";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
