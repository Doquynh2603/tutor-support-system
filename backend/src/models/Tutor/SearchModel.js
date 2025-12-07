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
        status = "recruiting",
        min_hourly_price,
        max_hourly_price,
        subject_id,
        gradeLevel,
        provinceId,
        districtId,
        wardId,
        tutorUserId,
        classId,
      } = filters;

      console.log("📡 [SearchModel] Searching with filters:", filters);
      const query = `EXEC sp_SearchClasses
        @status = :status,
        @min_hourly_price = :min_hourly_price,
        @max_hourly_price = :max_hourly_price,
        @subject_id = :subject_id,
        @gradeLevel = :gradeLevel,
        @province_id = :provinceId,
        @district_id = :districtId,
        @ward_id = :wardId,
        @tutorUserId = :tutorUserId,
        @classId = :classId
      `;
      console.log("🔍 [SearchModel] Executing query:", query);

      const results = await sequelize.query(query, {
        replacements: {
          status: status || null,
          min_hourly_price: min_hourly_price
            ? parseInt(min_hourly_price)
            : null,
          max_hourly_price: max_hourly_price
            ? parseInt(max_hourly_price)
            : null,
          subject_id: subject_id ? subject_id : null,
          gradeLevel: gradeLevel ? parseInt(gradeLevel) : null,
          provinceId: provinceId || null,
          districtId: districtId || null,
          wardId: wardId || null,
          tutorUserId: tutorUserId || null,
          classId: classId || null,
        },
        type: QueryTypes.SELECT,
      });

      console.log(
        `✅ [SearchModel.searchClasses] Found ${results.length} total rows`
      );

      console.log("Dữ liệu lấy được từ database: ", results[0]);
      // Gom các rows có cùng class_id lại thành 1 object với schedules array
      const classMap = {};
      results.forEach((row) => {
        if (!classMap[row.class_id]) {
          classMap[row.class_id] = {
            class_id: row.class_id,
            class_status: row.class_status,
            hourly_price: row.hourly_price,
            requirement: row.requirement,
            created_at: row.created_at,
            class_description: row.class_description,

            subject_name: row.subject_name,
            subject_desc: row.subject_desc,

            gradeLevel: row.gradeLevel,
            school: row.school,
            student_name: row.student_name,
            student_email: row.student_email,
            student_phone: row.student_phone,
            student_location: row.student_location,
            student_dob: row.student_dob,
            student_age: row.student_age,
            ward_name: row.ward_name,
            district_name: row.district_name,
            province_name: row.province_name,
            schedules: [],
            application_status: row.application_status,
          };
        }
        // Thêm lịch học vào schedules array
        if (row.schedule_id) {
          classMap[row.class_id].schedules.push({
            schedule_id: row.schedule_id,
            day_of_week: row.day_of_week,
            start_date: row.start_date,
            end_date: row.end_date,
            duration_minutes: row.duration_minutes,
            schedule_status: row.schedule_status,
            recurrence_type: row.recurrence_type,
          });
        }
      });
      const finalResults = Object.values(classMap);
      console.log(
        `✅ [SearchModel.searchClasses] Grouped into ${finalResults.length} classes`
      );
      console.log("Kết quả cuối cùng sau khi gom lớp học: ", finalResults);
      return finalResults;
    } catch (error) {
      console.error("❌ [SearchModel.searchClasses] Error:", error.message);
      console.error("Stack:", error.stack);
      throw error;
    }
  }
}

module.exports = SearchModel;
