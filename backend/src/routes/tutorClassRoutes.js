/**
 * File: routes/tutorClassRoutes.js
 * Mục đích: Routes cho quản lý danh sách lớp học của gia sư
 */

const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const tutorClassController = require("../controllers/tutorClassController");

// ✅ Tất cả routes yêu cầu xác thực
router.use(protect);

// GET /tutor/classes - Lấy danh sách lớp của gia sư (có filter status)
// Query params: ?status=in_progress
router.get("/", tutorClassController.getTutorClasses);

// GET /tutor/classes/applications - Lấy danh sách ứng tuyển của gia sư
// Query params: ?status=applied
router.get("/applications", tutorClassController.getTutorApplications);

// GET /tutor/classes/:classId - Lấy chi tiết lớp học
router.get("/:classId", tutorClassController.getTutorClassDetail);

// GET /tutor/classes/:classId/student - Lấy thông tin học viên của lớp
router.get("/:classId/student", tutorClassController.getClassStudentProfile);

module.exports = router;
