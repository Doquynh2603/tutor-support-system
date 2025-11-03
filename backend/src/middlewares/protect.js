/**
 * File: protect.js
 * Mục đích: Middleware xác thực JWT token
 * Vai trò: Kiểm tra token từ header Authorization và attach user vào request
 */

const jwt = require("jsonwebtoken");
const User = require("../models/UserSQL");

console.log("🔐 [protect.js] User model imported:", typeof User);
console.log("🔐 [protect.js] User.findByPk exists?", typeof User.findByPk);

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

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    console.log("🔐 [protect middleware] Token decoded:", decoded);

    // Get user from database
    console.log("🔐 [protect middleware] Looking up user ID:", decoded.userId);
    const user = await User.findByPk(decoded.userId);
    console.log(
      "🔐 [protect middleware] User found:",
      user ? user.email : "NOT FOUND"
    );

    if (!user) {
      console.error(
        "🔐 [protect middleware] User not found for ID:",
        decoded.userId
      );
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ - user không tồn tại",
      });
    }

    // Attach user to request
    req.user = user;
    console.log(`🔐 [protect middleware] User authenticated: ${user.email}`);
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
