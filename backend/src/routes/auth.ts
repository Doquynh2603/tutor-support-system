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

import { Router, Request, Response } from "express";
import protect from "../middlewares/protect";
import authController from "../controllers/authController";

const router: Router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", protect, authController.logout);

router.get("/profile", authController.verifyToken, authController.getProfile);

router.get("/me", authController.verifyToken, authController.getProfile);
router.get(
  "/verify",
  authController.verifyToken,
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: "Token hợp lệ",
      data: { user: (req as any).user },
    });
  }
);

export default router;
