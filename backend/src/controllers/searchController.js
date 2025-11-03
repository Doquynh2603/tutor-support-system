/**
 * File: controllers/searchController.js
 * Mục đích: Controller cho tìm kiếm lớp học
 */

const SearchModel = require("../models/SearchModel");
const {
  responseFormatter,
  errorFormatter,
} = require("../utils/responseFormatter");

/**
 * Tìm kiếm lớp học với bộ lọc
 * GET /api/search/classes?province=Hồ Chí Minh&min_wage=100000&max_wage=300000&subject=Toán&gradeLevel=11&educationLevel=3
 */

exports.searchClasses = async (req, res) => {
  try {
    console.log("📡 [searchController.searchClasses] Query params:", req.query);

    const filters = {
      status: req.query.status || "recruiting",
      province_id: req.query.province_id,
      min_hourly_rate: req.query.min_wage, // ← Convert min_wage to min_hourly_rate
      max_hourly_rate: req.query.max_wage, // ← Convert max_wage to max_hourly_rate
      subject_id: req.query.subject_id,
      gradeLevel: req.query.gradeLevel,
      educationLevel: req.query.educationLevel,
    };

    console.log("🔍 [searchController.searchClasses] Filters:", filters);

    const classes = await SearchModel.searchClasses(filters);

    console.log(
      "✅ [searchController.searchClasses] Found",
      classes.length,
      "classes"
    );

    return res
      .status(200)
      .json(responseFormatter(classes, `Tìm kiếm lớp học thành công`, 200));
  } catch (error) {
    console.error("❌ [searchController.searchClasses] Error:", error.message);
    console.error("❌ [searchController.searchClasses] Stack:", error.stack);
    return res
      .status(500)
      .json(
        errorFormatter("Đã xảy ra lỗi khi tìm kiếm lớp học", 500, error.message)
      );
  }
};

/**
 * lấy chi tiết lớp học
 * GET /api/search/classes/:classId
 */
exports.getClassDetails = async (req, res) => {
  try {
    const { classId } = req.params;
    if (!classId) {
      return res.status(400).json(errorFormatter("classId là bắt buộc", 400));
    }
    const classDetails = await SearchModel.getClassDetails(parseInt(classId));
    return res
      .status(200)
      .json(
        responseFormatter(classDetails, `Lấy chi tiết lớp học thành công`, 200)
      );
  } catch (error) {
    console.error(
      "❌ [searchController.getClassDetails] Error:",
      error.message
    );
    return res
      .status(404)
      .json(errorFormatter("Lớp học không tồn tại", 404, error.message));
  }
};
