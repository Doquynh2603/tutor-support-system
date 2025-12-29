/**
 * File: logger.js
 * Mục đích: Custom logging middleware
 * Vai trò: Log thông tin request (method, URL, user role)
 */
import { Request, Response, NextFunction } from "express";
const logger = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  const userInfo = user ? `[${user.role}] ${user.email}` : "[Anonymous]";

  console.log(
    `📍 ${userInfo} - ${req.method} ${req.protocol}://${req.get("host")}${
      req.originalUrl
    }`
  );
  next();
};

export default { logger };
