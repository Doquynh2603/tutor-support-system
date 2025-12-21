/**
 * File: backend/src/controllers/searchController.js
 */

const SearchModel = require("../../models/Tutor/SearchModel");
const ApplicationModel = require("../../models/Tutor/ApplicationModel");
const ClassModel = require("../../models/Tutor/ClassModel");

/**
 * Tìm kiếm lớp học
 * GET /api/search/classes
 */

exports.searchClasses = async (req, res) => {
  console.log("📡 [searchClasses] Handler called!");
  try {
    const {
      min_hourly_price,
      max_hourly_price,
      subject_id,
      classLevel,
      province_id,
    } = req.query;
    const tutorUserId = req.user?.user_id;
    console.log("Tutor User ID:", tutorUserId);
    console.log("[searchClasses] request: ", req.query);

    const filters = {
      min_hourly_price,
      max_hourly_price,
      subject_id,
      classLevel,
      province_id,
      tutorUserId: tutorUserId || null,
      classId: null,
    };
    console.log("📡 [SearchModel] Calling searchClasses with filters...");
    const results = await SearchModel.searchClasses(filters);
    console.log("dữ liệu lấy được từ database: ", results);
    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("❌ [searchClasses]:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy chi tiết lớp
 * GET /api/search/classes/:classId
 */
exports.getClassDetail = async (req, res) => {
  try {
    const { classId } = req.params;
    console.log(`📚 [getClassDetail] Class: ${classId}`);

    const result = await ClassModel.getClassDetail(classId, null);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ [getClassDetail]:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Ứng tuyển lớp
 * POST /api/search/classes/:classId/apply
 * Protected: Tutor only
 */

exports.applyClass = async (req, res) => {
  try {
    const tutorUserId = req.user.user_id;
    const { classId } = req.params;
    console.log(`📝 [applyClass] Tutor ${tutorUserId} -> Class ${classId}`);

    const application = await ApplicationModel.createApplication(
      tutorUserId,
      classId
    );
    console.log("dữ liệu application lấy từ database", application);

    res.status(201).json({
      success: true,
      message: "Ứng tuyển lớp thành công",
      data: application,
    });
  } catch (error) {
    console.error("❌ [applyClass]:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
