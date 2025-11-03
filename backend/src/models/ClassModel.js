/**
 * File: models/Class.js
 * Mục đích: Định nghĩa model Class sử dụng Raw Queries (vì lớp học có join nhiều bảng)
 */

const { sequelize } = require("../config/sqlserver");
const { QueryTypes } = require("sequelize");

class ClassModel {
  /**
   * Lấy danh sách lớp học của gia sư theo trạng thái
   * @param {BIGINT} tutorUserId - User ID của gia sư từ JWT token
   * @param {String} status - Trạng thái lớp học: recruiting, has_tutor, in_progress, completed, cancelled
   * @returns {Array} Danh sách lớp học từ view tutor_classes_view
   */
  static async getTutorClasses(tutorUserId, status = null) {
    try {
      // Lấy các lớp DISTINCT (không có schedule columns)
      let query = `
        SELECT DISTINCT class_id, status, isLocked, tutor_user_id,
               class_created_at, class_updated_at, subject_id, subject_name, subject_desc,
               educationLevel, gradeLevel, school, province_id, province_name, ward_id, ward_name,
               student_id, student_name, student_email, student_dob, student_age, student_phone,
               student_location, student_user_id, tutor_id
        FROM tutor_classes_view
        WHERE tutor_user_id = :tutorUserId
      `;

      if (status) {
        query += ` AND status = :status`;
      }

      query += ` ORDER BY class_created_at DESC`;

      const classes = await sequelize.query(query, {
        replacements: { tutorUserId, status: status || null },
        type: QueryTypes.SELECT,
      });

      // Lấy lịch học riêng cho từng lớp
      const classesWithSchedules = await Promise.all(
        classes.map(async (cls) => {
          const scheduleQuery = `
            SELECT schedule_id, day_of_week, start_time, end_time, start_date, end_date
            FROM tutor_classes_view
            WHERE class_id = :classId AND schedule_id IS NOT NULL
          `;
          const schedules = await sequelize.query(scheduleQuery, {
            replacements: { classId: cls.class_id },
            type: QueryTypes.SELECT,
          });

          return {
            ...cls,
            schedules: schedules || [],
          };
        })
      );

      return classesWithSchedules;
    } catch (error) {
      console.error("❌ [ClassModel.getTutorClasses] Error:", error.message);
      throw error;
    }
  }

  /**
   * Lấy chi tiết thông tin 1 lớp học
   * @param {BIGINT} classId - ID của lớp học
   * @param {BIGINT} tutorUserId - User ID của gia sư (để kiểm tra quyền)
   * @returns {Object} Chi tiết lớp học với schedules
   */
  static async getClassDetail(classId, tutorUserId) {
    try {
      // Lấy thông tin lớp (DISTINCT để không duplicate)
      const query = `
        SELECT DISTINCT class_id, status, isLocked, tutor_user_id,
               class_created_at, class_updated_at, subject_id, subject_name, subject_desc,
               educationLevel, gradeLevel, school, province_id, province_name, ward_id, ward_name,
               student_id, student_name, student_email, student_dob, student_age, student_phone,
               student_location, student_user_id, tutor_id
        FROM tutor_classes_view
        WHERE class_id = :classId AND tutor_user_id = :tutorUserId
      `;

      const [classDetail] = await sequelize.query(query, {
        replacements: { classId, tutorUserId },
        type: QueryTypes.SELECT,
      });

      if (!classDetail) {
        throw new Error("Không tìm thấy lớp học hoặc bạn không có quyền xem");
      }

      // Lấy tất cả schedules cho lớp này
      const scheduleQuery = `
        SELECT schedule_id, day_of_week, start_time, end_time, start_date, end_date
        FROM tutor_classes_view
        WHERE class_id = :classId AND schedule_id IS NOT NULL
      `;

      const schedules = await sequelize.query(scheduleQuery, {
        replacements: { classId },
        type: QueryTypes.SELECT,
      });

      return {
        ...classDetail,
        schedules: schedules || [],
      };
    } catch (error) {
      console.error("❌ [ClassModel.getClassDetail] Error:", error.message);
      throw error;
    }
  }

  /**
   * Lấy thông tin học viên của một lớp học (kiểm tra quyền)
   * @param {BIGINT} classId - ID của lớp học
   * @param {BIGINT} tutorUserId - User ID của gia sư (để kiểm tra quyền)
   * @returns {Object} Thông tin học viên đầy đủ
   */
  static async getStudentByClass(classId, tutorUserId) {
    try {
      // Kiểm tra gia sư có quyền xem lớp này không
      const classCheckQuery = `
        SELECT student_id FROM tutor_classes_view
        WHERE class_id = :classId AND tutor_user_id = :tutorUserId
      `;

      const [classCheck] = await sequelize.query(classCheckQuery, {
        replacements: { classId, tutorUserId },
        type: QueryTypes.SELECT,
      });

      if (!classCheck) {
        throw new Error("Không tìm thấy lớp học hoặc bạn không có quyền xem");
      }

      // Lấy thông tin học viên từ view
      const studentQuery = `
        SELECT * FROM class_student_profile_view
        WHERE student_id = :studentId
      `;

      const [student] = await sequelize.query(studentQuery, {
        replacements: { studentId: classCheck.student_id },
        type: QueryTypes.SELECT,
      });

      if (!student) {
        throw new Error("Không tìm thấy thông tin học viên");
      }

      return student;
    } catch (error) {
      console.error("❌ [ClassModel.getStudentByClass] Error:", error.message);
      throw error;
    }
  }

  /**
   * Lấy danh sách ứng tuyển của gia sư
   * @param {BIGINT} tutorUserId - User ID của gia sư
   * @param {String} appStatus - Trạng thái ứng tuyển: applied, approved, rejected, withdrawn
   * @returns {Array} Danh sách ứng tuyển
   */
  static async getTutorApplications(tutorUserId, appStatus = null) {
    try {
      let query = `
        SELECT 
          a.id,
          a.id as application_id,
          a.status,
          a.created_at,
          a.approved_at,
          a.response_at,
          a.isConfirmed,
          a.declineReason,
          a.withdrawReason,
          c.id as class_id,
          c.status as class_status,
          sub.name as subject_name,
          s.fullName as student_name,
          s.email as student_email,
          s.phone as student_phone,
          st.gradeLevel,
          st.school
        FROM Applications a
        JOIN Class c ON a.class_id = c.id
        JOIN Subject sub ON c.subject_id = sub.id
        JOIN Student st ON c.student_id = st.id
        JOIN [User] s ON st.user_id = s.id
        WHERE a.tutor_id = (
          SELECT id FROM Tutor WHERE user_id = :tutorUserId
        )
      `;

      if (appStatus) {
        query += ` AND a.status = :appStatus`;
      }

      query += ` ORDER BY a.created_at DESC`;

      const applications = await sequelize.query(query, {
        replacements: { tutorUserId, appStatus: appStatus || null },
        type: QueryTypes.SELECT,
      });

      return applications;
    } catch (error) {
      console.error(
        "❌ [ClassModel.getTutorApplications] Error:",
        error.message
      );
      throw error;
    }
  }
}

module.exports = ClassModel;
