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
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted response object
 */
const responseFormatter = (data, message = "Success", statusCode = 200) => {
  return {
    success: true,
    data,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} error - Error details
 * @returns {Object} Formatted error object
 */
const errorFormatter = (message, statusCode = 500, error = null) => {
  return {
    success: false,
    message,
    statusCode,
    error: error ? { details: error } : null,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  responseFormatter,
  errorFormatter,
};
