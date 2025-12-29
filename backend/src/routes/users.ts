/**
 * File: users.js
 * Mục đích: Routes cho User APIs
 * ✅ Thêm protect middleware cho /profile endpoint
 */

import { Router, Request, Response } from "express";
import protect from "../middlewares/protect";
import userController from "../controllers/userController";
const router = Router();

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Profile endpoint - protected nhưng không yêu cầu role cụ thể
router.get("/profile", protect, (req: Request, res: Response): void => {
  res.json({
    success: true,
    data: (req as any).user,
  });
});

export default router;
