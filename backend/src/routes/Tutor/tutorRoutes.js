/**
 * File: tutorRoutes.js
 * Routes cho tutor với SQL Server integration
 * ✅ Thêm roleCheck('tutor')
 */

const express = require("express");
const router = express.Router();
const protect = require("../../middlewares/protect");
const roleCheck = require("../../middlewares/roleCheck");
// Import controller
const {
  getTutorProfile,
  updateTutorProfile,
} = require("../../controllers/Tutor/TutorController");
const {
  getTutorClasses,
  getTutorClassDetail,
  getClassStudentProfile,
} = require("../../controllers/Tutor/tutorClassController");

// Routes sử dụng controller functions
//lấy thông tin profile gia sư
router.get("/profile", protect, roleCheck("tutor"), getTutorProfile);
// cập nhật thông tin profile gia sư
router.put("/profile", protect, roleCheck("tutor"), updateTutorProfile);
// lấy danh sách lớp học của gia sư
router.get("/classes", protect, roleCheck("tutor"), getTutorClasses);

// lấy chi tiết lớp học của gia sư
router.get(
  "/classes/:classId",
  protect,
  roleCheck("tutor"),
  getTutorClassDetail
);

// lấy thông tin học viên của lớp học
router.get(
  "/classes/:classId/student",
  protect,
  roleCheck("tutor"),
  getClassStudentProfile
);
module.exports = router;
