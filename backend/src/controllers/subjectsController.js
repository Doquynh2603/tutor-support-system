/**
 * File: controllers/subjectsController.js
 * Mục đích: Controller để lấy danh sách môn học
 * Vai trò: Trả về danh sách tất cả subjects từ database
 */

const { sequelize } = require("../config/sqlserver");
const { QueryTypes } = require("sequelize");

/**
 * Lấy danh sách tất cả môn học
 */
exports.getSubjects = async (req, res) => {
  try {
    console.log("📚 [getSubjects] Fetching all subjects...");

    const query = `
      SELECT id, name
      FROM Subject
      ORDER BY name ASC
    `;

    const subjects = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    console.log(`✅ [getSubjects] Found ${subjects.length} subjects`);

    res.status(200).json({
      success: true,
      data: subjects,
      message: "Lấy danh sách môn học thành công",
    });
  } catch (error) {
    console.error("❌ [getSubjects] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách môn học",
    });
  }
};
