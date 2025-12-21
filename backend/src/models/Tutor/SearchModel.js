const { sequelize } = require("../../config/sqlserver");
const { QueryTypes } = require("sequelize");
/**
 * File: backend/src/models/SearchModel.js
 * Mục đích: Model cho search classes và apply class
 */
class SearchModel {
  static async searchClasses(filters = {}) {
    try {
      const {
        min_hourly_price,
        max_hourly_price,
        subject_id,
        classLevel,
        province_id,
        tutorUserId,
        classId,
      } = filters;

      console.log("📡 [SearchModel] Searching with filters:", filters);
      const query = `EXEC sp_SearchClasses
        @min_hourly_price = :min_hourly_price,
        @max_hourly_price = :max_hourly_price,
        @subject_id = :subject_id,
        @classLevel = :classLevel,
        @province_id = :province_id,
        @tutorUserId = :tutorUserId,
        @classId = :classId
      `;
      console.log("🔍 [SearchModel] Executing query:", query);

      const results = await sequelize.query(query, {
        replacements: {
          min_hourly_price: min_hourly_price
            ? parseInt(min_hourly_price)
            : null,
          max_hourly_price: max_hourly_price
            ? parseInt(max_hourly_price)
            : null,
          subject_id: subject_id ? subject_id : null,
          classLevel: classLevel ? parseInt(classLevel) : null,
          province_id: province_id || null,
          tutorUserId: tutorUserId || null,
          classId: classId || null,
        },
        type: QueryTypes.SELECT,
      });

      console.log(
        `✅ [SearchModel.searchClasses] Found ${results.length} total rows`
      );

      console.log("Dữ liệu lấy được từ database: ", results);
      return results;
    } catch (error) {
      console.error("❌ [SearchModel.searchClasses] Error:", error.message);
      console.error("Stack:", error.stack);
      throw error;
    }
  }
}

module.exports = SearchModel;
