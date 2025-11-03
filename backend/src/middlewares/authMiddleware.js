/**
 * File: middlewares/authMiddleware.js
 * Mục đích: Authentication middleware (Mock version for development)
 * Vai trò: Giả lập authentication để development không cần JWT
 */

/**
 * Mock authentication middleware
 * Trong development, luôn "authenticate" với user ID = 1
 */
const mockAuth = (req, res, next) => {
  // Lấy user ID từ header hoặc mặc định là 1 cho development
  const userId = req.headers["x-user-id"] || "1";

  // Mock user object
  req.user = {
    id: parseInt(userId),
    email: "tutor@example.com",
    role: "tutor",
    name: "Development Tutor",
  };

  console.log(`🔐 Mock auth: User ID ${userId} authenticated`);
  next();
};

/**
 * Mock authorization middleware
 * Kiểm tra user có role phù hợp không
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user role found",
      });
    }

    if (userRole !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Required role ${requiredRole}, got ${userRole}`,
      });
    }

    console.log(`✅ Role check passed: ${userRole}`);
    next();
  };
};

/**
 * Mock tutor-only middleware
 * Chỉ cho phép tutor truy cập
 */
const requireTutor = requireRole("tutor");

/**
 * Real JWT auth middleware (placeholder cho production)
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is required",
    });
  }

  // TODO: Implement JWT verification
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.sendStatus(403);
  //   req.user = user;
  //   next();
  // });

  // For now, fallback to mock auth
  mockAuth(req, res, next);
};

/**
 * Middleware selector based on environment
 */
const selectAuthMiddleware = () => {
  if (process.env.NODE_ENV === "production") {
    return authenticateToken;
  } else {
    return mockAuth; // Development mode
  }
};

module.exports = {
  mockAuth,
  requireRole,
  requireTutor,
  authenticateToken,
  auth: selectAuthMiddleware(),
};
