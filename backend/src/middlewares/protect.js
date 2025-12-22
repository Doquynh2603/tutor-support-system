/**
 * File: protect.js
 * Mục đích: Middleware xác thực JWT token
 * Vai trò: Kiểm tra token từ header Authorization và attach user vào request
 */

const jwt = require("jsonwebtoken");
const UserAccount = require("../models/UserSQL");
const redisClient = require("../config/redis");
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không được cung cấp",
      });
    }

    // Remove Bearer prefix if exists
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // 1. kiểm tra blacklist
    const isBlacklisted = await redisClient.get(`blacklist_token:${token}`);
    if (isBlacklisted) {
      console.warn("🚫 [protect] Token bị từ chối (nằm trong blacklist)");
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập đã kết thúc, vui lòng đăng nhập lại",
      });
    }
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    console.log("🔐 [protect middleware] Token decoded:", decoded);

    // 2. Cache user profile
    const cacheKey = `user_profile:${decoded.userId}`;
    const cachedUser = await redisClient.get(cacheKey);

    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      return next();
    }

    console.log("🐢 [protect] Fetching user from DB ID:", decoded.userId);

    const user = await UserAccount.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ - user không tồn tại",
      });
    }

    // Attach user to request
    req.user = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
    };

    // Lưu user vào redis cache với TTL 1 giờ
    await redisClient.set(cacheKey, JSON.stringify(req.user), { EX: 3600 });

    console.log(
      `🔐 [protect middleware] User authenticated: ${user.email} (role: ${user.role})`
    );
    return next();
  } catch (error) {
    console.error("🔐 Token verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
      error: error.message,
    });
  }
};

module.exports = protect;
