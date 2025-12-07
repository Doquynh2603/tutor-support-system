/**
 * File: auth.js
 * Mục đích: Routes cho authentication
 * Vai trò:
 *   - POST /login - Đăng nhập
 *   - POST /register - Đăng ký
 *   - POST /logout - Đăng xuất
 *   - GET /profile - Lấy thông tin user hiện tại
 *   - GET /verify - Verify token
 */

const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const {
  login,
  register,
  verifyToken,
  getProfile,
  logout,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.post("/logout", protect, logout);

router.get("/profile", verifyToken, getProfile);

router.get("/me", verifyToken, getProfile);

router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Token hợp lệ",
    data: { user: req.user.toJSON() },
  });
});

module.exports = router;
