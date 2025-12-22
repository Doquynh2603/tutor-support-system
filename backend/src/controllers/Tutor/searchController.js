/**
 * File: backend/src/controllers/searchController.js
 */

const SearchModel = require("../../models/Tutor/SearchModel");
const ApplicationModel = require("../../models/Tutor/ApplicationModel");
const ClassModel = require("../../models/Tutor/ClassModel");
const redisClient = require("../../config/redis");
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
    // 1. Tạo cache key chuẩn
    const filterObj = {
      min_hourly_price,
      max_hourly_price,
      subject_id,
      classLevel,
      province_id,
      tutorUserId: tutorUserId || "guest",
    };
    Object.keys(filterObj).forEach(
      (key) => filterObj[key] === undefined && delete filterObj[key]
    );
    const sortedKeys = Object.keys(filterObj).sort();
    const cacheKey = `search:classes:${JSON.stringify(filterObj, sortedKeys)}`;

    //2. Kiểm tra redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [searchClasses] Returning cached results");
      const results = JSON.parse(cachedData);
      return res.status(200).json({
        success: true,
        data: results,
        count: results.length,
        message: "From Cache",
      });
    }

    //3. Nếu không có trong cache thì query database
    const filters = {
      ...filterObj,
      tutorUserId: tutorUserId || null,
      classId: null,
    };
    const results = await SearchModel.searchClasses(filters);
    console.log("dữ liệu lấy được từ database: ", results);

    // 4. Lưu kết quả vào redis với 5 phút
    if (results.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(results), { EX: 300 }); // 5 minutes
    }
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

    // 🔒 Privacy Check: Always hide student info in Search/Public view
    if (result) {
      delete result.student_name;
      delete result.student_phone;
      delete result.student_email;
      delete result.student_location;
      delete result.student_dob;
      // Ensure we don't leak specific address details if they are in other fields
      // View_TutorClassDetail might have 'ward_name', 'district_name' which are fine (general location)
      // but 'locationDetail' or 'student_location' should be hidden.
    }

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
