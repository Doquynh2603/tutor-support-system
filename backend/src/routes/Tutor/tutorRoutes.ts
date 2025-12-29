/**
 * File: tutorRoutes.js
 * Routes cho tutor với SQL Server integration
 * ✅ Thêm roleCheck('tutor')
 */

import { Router } from "express";
import protect from "../../middlewares/protect";
import roleCheck from "../../middlewares/roleCheck";
const router = Router();
// Import controller
import TutorController from "../../controllers/Tutor/TutorController";
import TutorClassController from "../../controllers/Tutor/tutorClassController";

// Routes sử dụng controller functions
//lấy thông tin profile gia sư
router.get(
  "/profile",
  protect,
  roleCheck("tutor"),
  TutorController.getTutorProfile
);
// cập nhật thông tin profile gia sư
router.put(
  "/profile",
  protect,
  roleCheck("tutor"),
  TutorController.updateTutorProfile
);

// lấy danh sách lớp học của gia sư
router.get(
  "/classes",
  protect,
  roleCheck("tutor"),
  TutorClassController.getTutorClasses
);

// lấy chi tiết lớp học của gia sư
router.get(
  "/classes/:classId",
  protect,
  roleCheck("tutor"),
  TutorClassController.getTutorClassDetail
);

// lấy thông tin học viên của lớp học
router.get(
  "/classes/:classId/student",
  protect,
  roleCheck("tutor"),
  TutorClassController.getClassStudentProfile
);
export default router;
