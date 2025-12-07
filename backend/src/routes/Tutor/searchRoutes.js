/**
 * File: backend/src/routes/searchRoutes.js
 */

const express = require("express");
const router = express.Router();
const protect = require("../../middlewares/protect");
const roleCheck = require("../../middlewares/roleCheck");
const searchController = require("../../controllers/Tutor/searchController");

// Tìm kiếm lớp học
router.get(
  "/classes",
  protect,
  roleCheck("tutor"),
  searchController.searchClasses
);
router.get("/classes/:classId", searchController.getClassDetail);

// Ứng tuyển lớp học
router.post(
  "/classes/:classId/apply",
  protect,
  roleCheck("tutor"),
  searchController.applyClass
);

module.exports = router;
