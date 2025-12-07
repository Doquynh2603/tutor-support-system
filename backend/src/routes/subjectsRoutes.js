/**
 * File: routes/subjectsRoutes.js
 * Mục đích: Routes cho môn học
 */

const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");
const { getSubjects } = require("../controllers/subjectsController");

// Lấy danh sách môn học
router.get("/", getSubjects);

module.exports = router;
