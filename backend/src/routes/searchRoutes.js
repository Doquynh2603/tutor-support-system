const express = require("express");
const router = express.Router();

console.log("🔍 [searchRoutes] Loading routes...");

try {
  const searchController = require("../controllers/searchController");
  console.log("✅ [searchRoutes] searchController loaded");
  console.log(
    "✅ [searchRoutes] searchClasses exists?",
    typeof searchController.searchClasses
  );
  console.log(
    "✅ [searchRoutes] getClassDetails exists?",
    typeof searchController.getClassDetails
  );
} catch (error) {
  console.error(
    "❌ [searchRoutes] Error loading searchController:",
    error.message
  );
  console.error(error.stack);
}

// Test route
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Search routes are working!" });
});

// ✅ Route tìm kiếm lớp học - PUBLIC (không cần login)
router.get("/classes", async (req, res, next) => {
  try {
    const { searchClasses } = require("../controllers/searchController");
    await searchClasses(req, res, next);
  } catch (error) {
    console.error("❌ [searchRoutes] Error in searchClasses:", error.message);
    res.status(500).json({
      success: false,
      message: "Error in searchClasses",
      error: error.message,
    });
  }
});

// Route lấy chi tiết lớp học - PUBLIC
router.get("/classes/:classId", async (req, res, next) => {
  try {
    const { getClassDetails } = require("../controllers/searchController");
    await getClassDetails(req, res, next);
  } catch (error) {
    console.error("❌ [searchRoutes] Error in getClassDetails:", error.message);
    res.status(500).json({
      success: false,
      message: "Error in getClassDetails",
      error: error.message,
    });
  }
});

module.exports = router;
