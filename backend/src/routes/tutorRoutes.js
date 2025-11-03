/**
 * File: tutorRoutes.js
 * Routes cho tutor với SQL Server integration
 */

const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");

// Import controller
const {
  getTutorProfile,
  updateTutorProfile,
  testDatabase,
} = require("../controllers/TutorController");

// Import subjectsController
const { getSubjects } = require("../controllers/subjectsController");

// Routes sử dụng controller functions
router.get("/test-db", testDatabase);
router.get("/profile", protect, getTutorProfile);
router.put("/profile", protect, updateTutorProfile);
router.get("/subjects", getSubjects);

module.exports = router;
