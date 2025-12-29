/**
 * File: backend/src/routes/searchRoutes.js
 */

import { Router } from "express";
import protect from "../../middlewares/protect";
import roleCheck from "../../middlewares/roleCheck";
const router = Router();
import searchController from "../../controllers/Tutor/searchController";

// Tìm kiếm lớp học
router.get(
  "/classes",
  protect,
  roleCheck("tutor"),
  searchController.searchClasses
);
router.get("/classes/:classId", protect, searchController.getClassDetail);

// Ứng tuyển lớp học
router.post(
  "/classes/:classId/apply",
  protect,
  roleCheck("tutor"),
  searchController.applyClass
);

export default router;
