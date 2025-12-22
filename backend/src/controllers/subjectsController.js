/**
 * File: controllers/subjectsController.js
 * Mục đích: Controller để lấy danh sách môn học
 * Vai trò: Trả về danh sách tất cả subjects từ database
 */

const { sequelize } = require("../config/sqlserver");
const { QueryTypes } = require("sequelize");
const redisClient = require("../config/redis");
/**
 * Lấy danh sách tất cả môn học
 */
exports.getSubjects = async (req, res) => {
  try {
    console.log("📚 [getSubjects] Fetching all subjects...");

    // 1. check redis cache
    const cacheKey = "all_subjects";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [getSubjects] Returning from Redis Cache");
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
        message: "Lấy danh sách môn học thành công (từ cache)",
      });
    }

    // 2. nếu không có trong cache thì query database
    console.log("🐢 [getSubjects] Fetching from DB...");
    const query = `
      SELECT subject_id, name
      FROM Subjects
      ORDER BY name ASC
    `;

    const subjects = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    // 3. lưu kết quả vào redis cache với TTL 24 giờ
    if (subjects.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(subjects), {
        EX: 86400, // 24 hours
      });
    }
    console.log(`✅ [getSubjects] Found ${subjects.length} subjects`);
    console.log("📋 Subjects data:", subjects); // ✅ Thêm dòng này để debug
    res.status(200).json({
      success: true,
      data: subjects,
      message: "Lấy danh sách môn học thành công",
    });
  } catch (error) {
    console.error("❌ [getSubjects] Error:", error.message);
    console.error("❌ Full Error:", error); // ✅ Thêm dòng này để xem full error
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách môn học",
    });
  }
};
