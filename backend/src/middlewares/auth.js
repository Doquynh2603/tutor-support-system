/**
 * Auth Middleware - Mock cho development
 * Coi như user đã đăng nhập
 */

// Mock middleware - luôn pass authentication
const mockAuth = (req, res, next) => {
  // Thêm mock user vào request
  req.user = {
    id: 1,
    email: "tutor@example.com",
    name: "Nguyễn Văn A",
    role: "tutor",
  };

  console.log("🔐 Mock Auth: User authenticated -", req.user.email);
  next();
};

// Optional middleware - không bắt buộc login
const optionalAuth = (req, res, next) => {
  req.user = {
    id: 1,
    email: "tutor@example.com",
    name: "Nguyễn Văn A",
    role: "tutor",
  };
  next();
};

module.exports = {
  mockAuth,
  optionalAuth,
};
