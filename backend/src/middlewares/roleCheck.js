/**
 * File: middlewares/roleCheck.js
 * Mục đích: Role-based access control middleware
 * Vai trò: Kiểm tra xem user có role phù hợp để truy cập endpoint
 * Sử dụng: roleCheck('tutor') hoặc roleCheck('tutor', 'admin')
 */

const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Không xác thực được người dùng",
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      console.warn(
        `❌ [roleCheck] Access denied for user ${req.user.email} with role '${
          req.user.role
        }'. Required: ${allowedRoles.join(", ")}`
      );
      return res.status(403).json({
        success: false,
        message: `Không đủ quyền truy cập. Yêu cầu quyền: ${allowedRoles.join(
          ", "
        )}`,
      });
    }

    console.log(
      `✅ [roleCheck] Access granted for user ${req.user.email} with role '${req.user.role}'`
    );
    next();
  };
};

module.exports = roleCheck;
