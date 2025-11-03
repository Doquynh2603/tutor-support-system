const { sequelize } = require("../config/sqlserver");
const { QueryTypes } = require("sequelize");

class SearchModel {
  //tìm kiếm lớp học theo điều kiện - dùng Stored Procedure (tối ưu)
  static async searchClasses(fileters = {}) {
    try {
      const {
        status,
        province_id,
        min_hourly_rate,
        max_hourly_rate,
        subject_id,
        gradeLevel,
        educationLevel,
      } = fileters;

      console.log("📡 [SearchModel] Searching with filters:", fileters);

      // Build SQL query với WHERE clauses động
      let whereConditions = [];
      let replacements = {};

      if (status) {
        whereConditions.push("c.status = :status");
        replacements.status = status;
      }
      if (min_hourly_rate) {
        whereConditions.push("c.hourly_rate >= :min_hourly_rate");
        replacements.min_hourly_rate = parseInt(min_hourly_rate);
      }
      if (max_hourly_rate) {
        whereConditions.push("c.hourly_rate <= :max_hourly_rate");
        replacements.max_hourly_rate = parseInt(max_hourly_rate);
      }
      if (subject_id) {
        whereConditions.push("c.subject_id = :subject_id");
        replacements.subject_id = parseInt(subject_id);
      }
      if (gradeLevel) {
        whereConditions.push("c.gradeLevel = :gradeLevel");
        replacements.gradeLevel = parseInt(gradeLevel);
      }
      if (educationLevel) {
        whereConditions.push("c.educationLevel = :educationLevel");
        replacements.educationLevel = parseInt(educationLevel);
      }

      // Nếu không có điều kiện, mặc định lấy status = 'recruiting'
      if (whereConditions.length === 0) {
        whereConditions.push("c.status = :status");
        replacements.status = "recruiting";
      }

      const whereClause =
        whereConditions.length > 0 ? whereConditions.join(" AND ") : "1=1";

      const query = `
        SELECT 
          c.class_id,
          c.status,
          c.hourly_rate,
          c.requirement,
          c.subject_id,
          c.gradeLevel,
          c.educationLevel,
          c.student_id
        FROM Class c
        WHERE ${whereClause}
        ORDER BY c.class_id
      `;

      console.log("🔍 [SearchModel] Executing query:", query);
      console.log("Replacements:", replacements);

      const results = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      console.log("✅ [SearchModel] Found classes:", results.length);

      // Nhóm kết quả (đơn giản)
      console.log("📊 [SearchModel] Processed classes:", results.length);
      return results;
    } catch (error) {
      console.error("❌ [SearchModel.searchClasses] Error:", error.message);
      console.error("Stack:", error.stack);
      throw error;
    }
  }
  //lấy chi tiết lớp học để xem trước khi ứng tuyển

  static async getClassDetails(classId) {
    try {
      const results = await sequelize.query(
        `SELECT * FROM tutor_classes_view WHERE class_id = :classId`,
        {
          replacements: { classId },
          type: QueryTypes.SELECT,
        }
      );
      if (results.length === 0) {
        console.log(`Database không tìm thấy lớp học trùng với ${classId}`);
        throw new Error("không tìm thấy lớp học");
      }
      const classDetail = results[0];
      //gom lịch học của 1 lớp
      const schedules = results.map((row) => ({
        schedule_id: row.schedule_id,
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        end_time: row.end_time,
        start_date: row.start_date,
        end_date: row.end_date,
      }));
      return {
        ...classDetail,
        schedules,
      };
    } catch (error) {
      console.error("❌ [SearchModel.getClassDetails] Error:", error.message);
      throw error;
    }
  }
}
module.exports = SearchModel;
