/**
 * File: responseFormatter.js
 * Mục đích: Utility functions để format API responses
 * Vai trò:
 *   - Chuẩn hóa format response trả về cho client
 *   - Đảm bảo consistency trong toàn bộ API
 * Lưu ý:
 *   - Hiện chưa được sử dụng trong controllers
 *   - Có thể integrate vào response để có format thống nhất
 */

/**
 * Format successful response
 * @param {*} data - Data to return
 * @returns {Object} Formatted response object
 */
const responseFormatter = (data) => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted error object
 */
const errorFormatter = (message, statusCode = 500) => {
  return {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  responseFormatter,
  errorFormatter,
};
