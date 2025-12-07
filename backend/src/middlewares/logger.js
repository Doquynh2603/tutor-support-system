/**
 * File: logger.js
 * Mục đích: Custom logging middleware
 * Vai trò: Log thông tin request (method, URL, user role)
 */

const logger = (req, res, next) => {
  const userInfo = req.user
    ? `[${req.user.role}] ${req.user.email}`
    : "[Anonymous]";
  console.log(
    `📍 ${userInfo} - ${req.method} ${req.protocol}://${req.get("host")}${
      req.originalUrl
    }`
  );
  next();
};

module.exports = logger;
