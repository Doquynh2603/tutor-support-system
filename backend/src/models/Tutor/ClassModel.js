/**
 * File: models/Class.js
 * Mục đích: Định nghĩa model Class sử dụng Raw Queries (vì lớp học có join nhiều bảng)
 */

const { sequelize } = require("../../config/sqlserver");
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
        SELECT
          c.tutor_id,
          c.class_id,
          c.hourly_price,  
          c.subject_id,
          s.name as subject_name
        FROM Class c
        JOIN Subjects s ON c.subject_id = s.subject_id
        WHERE c.tutor_id = :tutorUserId
      `;

      if (status) {
        query += ` AND c.status = :status`;
      }

      query += ` ORDER BY c.created_at DESC`;

      const classes = await sequelize.query(query, {
        replacements: { tutorUserId, status: status || null },
        type: QueryTypes.SELECT,
      });
      if (!classes || classes.length === 0) return [];
      // Lấy lịch học riêng cho từng lớp

      const classIds = classes.map((cls) => cls.class_id);
      const scheduleQuery = `
        SELECT *
        FROM Schedule
        WHERE class_id IN (${classIds.map(() => "?").join(",")})
      `;
      const schedules = await sequelize.query(scheduleQuery, {
        replacements: classIds,
        type: QueryTypes.SELECT,
      });

      // 3️⃣ Ghép lịch học vào class tương ứng
      const classesWithSchedules = classes.map((cls) => {
        const clsSchedules = schedules.filter(
          (sch) => sch.class_id === cls.class_id
        );
        return {
          ...cls,
          schedules: clsSchedules,
        };
      });

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
        SELECT *
        FROM View_TutorClassDetail
        WHERE class_id = :classId AND tutor_id = :tutorUserId
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
        SELECT *
        FROM Schedule
        WHERE class_id = :classId
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
        SELECT student_id FROM Class
        WHERE class_id = :classId AND tutor_id = :tutorUserId
      `;

      const [classCheck] = await sequelize.query(classCheckQuery, {
        replacements: { classId, tutorUserId },
        type: QueryTypes.SELECT,
      });

      if (!classCheck) {
        throw new Error("Không tìm thấy lớp học hoặc bạn không có quyền xem");
      }

      // Lấy thông tin học viên bảng StudentProfile và UserAccount
      const studentQuery = `
        SELECT * 
        FROM student_info
        WHERE user_id = :studentId
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
}

module.exports = ClassModel;
