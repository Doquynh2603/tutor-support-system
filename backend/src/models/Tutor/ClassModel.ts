/**
 * File: models/Class.js
 * Mục đích: Định nghĩa model Class sử dụng Raw Queries (vì lớp học có join nhiều bảng)
 */

import { sequelize } from "../../config/sqlserver";
import { QueryTypes } from "sequelize";

// --- Interfaces ---

// ✅ Khớp với View_ClassList
export interface ClassListItem {
  class_id: string;
  tutor_id: string | null;
  student_id: string;
  hourly_price: number;
  classLevel: number;
  class_status: string;
  created_at: Date;
  subject_id: string;
  subject_name: string;
  classLocation: string | null;
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
}

// ✅ Khớp với View_TutorClassDetail
export interface ClassDetail {
  class_id: string;
  tutor_id: string | null;
  student_id: string;
  description: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
  hourly_price: number;
  requirement: string | null;
  start_date: string | null; // DATE -> string YYYY-MM-DD
  end_date: string | null;
  grade_level: number; // Từ View: classLevel
  classLevel?: number; // Alias của grade_level
  subject_name: string;
  locationDetail: string | null;
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
  student_name: string;
  student_phone: string | null;
  student_gender: boolean | null;
  student_email: string;
  // Schedules (parsed)
  schedules?: Schedule[];
}

export interface Schedule {
  schedule_id: string;
  day_of_week: number;
  start_time: string; // TIME -> "HH:mm:ss"
  end_time: string;
  class_id: string;
  created_at: Date;
  updated_at: Date;
  duration_minutes: number;
}

// ✅ Khớp với View student_info
export interface StudentInfo {
  student_id: string; // student_profile_id
  school: string | null;
  gradeLevel: number | null;
  user_id: string;
  email: string;
  name: string;
  phone: string | null;
  dateOfBirth: string | null; // DATE -> string
  age: number | null;
  locationDetail: string | null;
  created_at: Date;
  updated_at: Date;
  role: string; // 'student'
  status: boolean; // BIT
  is_verified: boolean; // BIT
  gender: boolean | null; // BIT
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
}

class ClassModel {
  /**
   * Lấy danh sách lớp học của gia sư theo trạng thái
   * @param {BIGINT} tutorUserId - User ID của gia sư từ JWT token
   * @param {String} status - Trạng thái lớp học: recruiting, has_tutor, in_progress, completed, cancelled
   * @returns {Array} Danh sách lớp học từ view tutor_classes_view
   */
  static async getTutorClasses(
    tutorUserId: string,
    status: string | null = null
  ): Promise<ClassListItem[]> {
    try {
      // Lấy các lớp DISTINCT (không có schedule columns)
      let query = `
        SELECT *
        FROM View_ClassList 
        WHERE tutor_id = :tutorUserId
      `;

      if (status) {
        query += ` AND class_status = :status`;
      }

      query += ` ORDER BY created_at DESC`;

      const classes = await sequelize.query<ClassListItem>(query, {
        replacements: { tutorUserId, status: status || null },
        type: QueryTypes.SELECT,
      });
      if (!classes || classes.length === 0) return [];

      return classes || [];
    } catch (error: any) {
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
  static async getClassDetail(
    classId: string,
    tutorUserId: string
  ): Promise<ClassDetail> {
    try {
      // Lấy thông tin lớp (DISTINCT để không duplicate)
      const query = `
        SELECT *
      FROM View_TutorClassDetail
      WHERE class_id = :classId
        AND (
              (:tutorUserId IS NOT NULL AND tutor_id = :tutorUserId)
              OR
              (:tutorUserId IS NULL AND tutor_id IS NULL)
            )
      `;

      const classDetails = await sequelize.query<any>(query, {
        replacements: { classId, tutorUserId },
        type: QueryTypes.SELECT,
      });

      if (!classDetails || classDetails.length === 0) {
        throw new Error("Không tìm thấy lớp học hoặc bạn không có quyền xem");
      }
      const classDetail = classDetails[0];
      const schedulesQuery = `
        SELECT schedule_id, day_of_week,
        CONVERT(varchar(5), start_time, 108) AS start_time,
        CONVERT(varchar(5), end_time, 108) AS end_time, class_id, created_at, updated_at, duration_minutes
        FROM Schedule
        WHERE class_id = :classId
        ORDER BY day_of_week, start_time
      `;
      const schedules = await sequelize.query<Schedule>(schedulesQuery, {
        replacements: { classId },
        type: QueryTypes.SELECT,
      });
      return {
        ...classDetail,
        schedules: schedules || [],
      };
    } catch (error: any) {
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
  static async getStudentByClass(
    classId: string,
    tutorUserId: string
  ): Promise<StudentInfo> {
    try {
      // Kiểm tra gia sư có quyền xem lớp này không
      const classCheckQuery = `
        SELECT student_id, status FROM Class
        WHERE class_id = :classId AND tutor_id = :tutorUserId
      `;

      const classCheckResult = await sequelize.query<{
        student_id: string;
        status: string;
      }>(classCheckQuery, {
        replacements: { classId, tutorUserId },
        type: QueryTypes.SELECT,
      });

      if (!classCheckResult || classCheckResult.length === 0) {
        throw new Error("Không tìm thấy lớp học hoặc bạn không có quyền xem");
      }

      const classCheck = classCheckResult[0];

      // ✅ Privacy Check: chỉ xem được khi lớp ở trạng thái có gia sư hoặc sau
      const allowedStatuses = ["has_tutor", "active", "completed"];
      if (!allowedStatuses.includes(classCheck.status)) {
        throw new Error(
          "Bạn chỉ có thể xem thông tin học viên khi lớp đã có gia sư"
        );
      }

      // Lấy thông tin học viên bảng StudentProfile và UserAccount
      const studentQuery = `
        SELECT * 
        FROM student_info
        WHERE user_id = :studentId
      `;

      const studentResult = await sequelize.query<StudentInfo>(studentQuery, {
        replacements: { studentId: classCheck.student_id },
        type: QueryTypes.SELECT,
      });

      if (!studentResult || studentResult.length === 0) {
        throw new Error("Không tìm thấy thông tin học viên");
      }

      return studentResult[0];
    } catch (error: any) {
      console.error("❌ [ClassModel.getStudentByClass] Error:", error.message);
      throw error;
    }
  }
}

export default ClassModel;
