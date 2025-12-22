/**
 * File: studentRoutes.js
 * Routes cho student với SQL Server integration
 */

const express = require("express");
const router = express.Router();
const protect = require("../../middlewares/protect");
const roleCheck = require("../../middlewares/roleCheck");

const {
  getStudentProfile,
  updateStudentProfile,
} = require("../../controllers/Student/StudentController");
const ClassController = require("../../controllers/Student/ClassController");
const FavoritesController = require("../../controllers/Student/FavoritesController");
// ========== STUDENT PROFILE ==========
router.get("/profile", protect, roleCheck("student"), getStudentProfile);
router.put("/profile", protect, roleCheck("student"), updateStudentProfile);
// ========== STUDENT CLASS MANAGEMENT ==========
router.post(
  "/class",
  protect,
  roleCheck("student"),
  ClassController.createClass
);
router.get(
  "/class",
  protect,
  roleCheck("student"),
  ClassController.getStudentClasses
);
// ⚠️ IMPORTANT: Routes với tham số cụ thể phải đặt TRƯỚC routes có :id parameters
router.get(
  "/class/:class_id/suggested-tutors",
  protect,
  roleCheck("student"),
  ClassController.getSuggestedTutors
);
router.get(
  "/class/:class_id",
  protect,
  roleCheck("student"),
  ClassController.getClassDetails
);

router.put(
  "/class/:class_id",
  protect,
  roleCheck("student"),
  ClassController.updateClass
);
router.patch(
  "/class/:class_id",
  protect,
  roleCheck("student"),
  ClassController.cancelClass
);
// ========== INVITE TUTOR ==========
router.post(
  "/class/:class_id/invite",
  protect,
  roleCheck("student"),
  ClassController.inviteSingleTutor
);
// ========== DUYỆT/TỪ CHỐI GIA SƯ (MỚI) ==========

//lấy danh sách gia sư ứng tuyển cho 1 lớp
router.get(
  "/class/:class_id/applications",
  protect,
  roleCheck("student"),
  ClassController.getApplicationsByClass
);

//lấy chi tiết gia sư + lịch dạy
router.post(
  "/tutor/:tutor_id/detail",
  protect,
  roleCheck("student"),
  ClassController.getTutorDetail
);
//duyệt hoặc từ chối gia sư ứng tuyển
router.post(
  "/applications/review",
  protect,
  roleCheck("student"),
  ClassController.reviewApplication
);

// Quản lý gia sư yêu thích
router.get(
  "/favorites",
  protect,
  roleCheck("student"),
  FavoritesController.getFavorites
);

router.post(
  "/favorites",
  protect,
  roleCheck("student"),
  FavoritesController.addFavorite
);
router.delete(
  "/favorites",
  protect,
  roleCheck("student"),
  FavoritesController.removeFavorite
);
module.exports = router;
