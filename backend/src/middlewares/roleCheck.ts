/**
 * File: middlewares/roleCheck.js
 * Mục đích: Role-based access control middleware
 * Vai trò: Kiểm tra xem user có role phù hợp để truy cập endpoint
 * Sử dụng: roleCheck('tutor') hoặc roleCheck('tutor', 'admin')
 */
import { Request, Response, NextFunction } from "express";
const roleCheck = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Không xác thực được người dùng",
      });
    }
    const userRole = user.role;
    const userEmail = user.email;
    if (!allowedRoles.includes(userRole)) {
      console.warn(
        `❌ [roleCheck] Access denied for user ${userEmail} with role '${userRole}'. Required: ${allowedRoles.join(
          ", "
        )}`
      );
      return res.status(403).json({
        success: false,
        message: `Không đủ quyền truy cập. Yêu cầu quyền: ${allowedRoles.join(
          ", "
        )}`,
      });
    }

    console.log(
      `✅ [roleCheck] Access granted for user ${userEmail} with role '${userRole}'`
    );
    next();
  };
};

export default roleCheck;
