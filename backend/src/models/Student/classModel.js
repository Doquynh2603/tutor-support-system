// backend/src/models/Student/ClassModel.js
/**
 * File: ClassModel.js
 * Mục đích: Xử lý tất cả logic SQL cho Class
 * Tác vụ: Tạo lớp, mời gia sư, duyệt ứng tuyển, lấy dữ liệu
 */

const { sequelize } = require("../../config/sqlserver");
const { QueryTypes } = require("sequelize");

class ClassModel {
  // =====================================================
  // 1. TẠO LỚP HỌC
  // =====================================================
  static async createClass(
    studentUserId,
    subjectId,
    description,
    requirement,
    hourlyPrice,
    schedulesJson
  ) {
    try {
      // ✅ Gọi Stored Procedure
      const result = await sequelize.query(
        `EXEC sp_CreateClass
            @StudentUserId = :studentUserId,
            @SubjectId = :subjectId,
            @Description = :description,
            @Requirement = :requirement,
            @HourlyPrice = :hourlyPrice,
            @SchedulesJson = :schedulesJson`,
        {
          replacements: {
            studentUserId,
            subjectId,
            description: description || "",
            requirement: requirement || "",
            hourlyPrice: parseInt(hourlyPrice),
            schedulesJson,
          },
          type: QueryTypes.SELECT,
        }
      );

      console.log("✅ SP result:", result);
      return result[0]?.class_id;
    } catch (error) {
      console.error("❌ Error in createClass:", error.message);
      throw error;
    }
  }

  // =====================================================
  // 2. MỜI 1 GIA SƯ
  // =====================================================
  static async inviteSingleTutor(classId, tutorId, studentUserId) {
    try {
      const result = await sequelize.query(
        `EXEC sp_InviteSingleTutor
            @ClassId = :classId,
            @TutorId = :tutorId,
            @StudentUserId = :studentUserId`,
        {
          replacements: {
            classId,
            tutorId,
            studentUserId,
          },
          type: QueryTypes.SELECT,
        }
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // =====================================================
  // 3. DUYỆT ỨNG TUYỂN
  // =====================================================
  static async approveApplication(applicationId, studentUserId) {
    try {
      // ✅ Update Applications status thành 'approved'
      const updateAppQuery = `
        UPDATE Applications 
        SET status = 'approved', updated_at = GETDATE()
        WHERE id = :applicationId;
      `;

      await sequelize.query(updateAppQuery, {
        replacements: {
          applicationId,
        },
        type: QueryTypes.UPDATE,
      });

      // ✅ Lock class (cập nhật is_locked = 1)
      const lockClassQuery = `
        UPDATE Class 
        SET is_locked = 1, updated_at = GETDATE()
        WHERE class_id = (SELECT class_id FROM Applications WHERE id = :applicationId);
      `;

      await sequelize.query(lockClassQuery, {
        replacements: {
          applicationId,
        },
        type: QueryTypes.UPDATE,
      });

      return {
        message: "Duyệt ứng tuyển thành công",
      };
    } catch (error) {
      throw error;
    }
  }

  // =====================================================
  // 4. LẤY DANH SÁCH LỚP CỦA HỌC VIÊN
  // =====================================================
  static async getStudentClasses(studentId, status = null) {
    try {
      let whereClause = "WHERE c.student_id = :studentId ";
      const replacements = { studentId };
      if (status) {
        whereClause += "AND c.status = :status ";
        replacements.status = status;
      }
      const query = `
        SELECT
            c.class_id,
            c.tutor_id,
            c.student_id,
            c.subject_id,
            c.description,
            c.requirement,
            c.hourly_price,
            c.status,
            c.is_locked,
            c.created_at,
            c.updated_at,
            c.cancellation_reason,
            s.name as subject_name,
            ua.name as tutor_name,
            ua.phone as tutor_phone,
            ua.email as tutor_email,
            (SELECT COUNT(*) FROM TutorApplication WHERE class_id = c.class_id AND status = 'invited') as invited_tutors_count,
            (SELECT COUNT(*) FROM TutorApplication WHERE class_id = c.class_id AND status = 'applied') as applied_tutors_count,
            (SELECT COUNT(*) FROM Schedule WHERE class_id = c.class_id) as schedule_count
        FROM Class c
        INNER JOIN Subjects s ON c.subject_id = s.subject_id
        LEFT JOIN UserAccount ua ON c.tutor_id = ua.user_id
        ${whereClause}
        ORDER BY c.created_at DESC
      `;

      const classes = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      return classes;
    } catch (error) {
      throw error;
    }
  }

  // =====================================================
  // 5. LẤY CHI TIẾT LỚP HỌC
  // =====================================================
  static async getClassDetails(classId, studentId) {
    try {
      // Get class info
      const classQuery = `
        SELECT
            c.class_id,
            c.tutor_id,
            c.student_id,
            c.subject_id,
            c.description,
            c.requirement,
            c.hourly_price,
            c.status,
            c.is_locked,
            c.created_at,
            c.updated_at,
            c.cancellation_reason,
            s.name as subject_name,
            ua.name as tutor_name,
            ua.phone as tutor_phone,
            ua.email as tutor_email,
            ISNULL(tp.avg_rating, 0) as tutor_rating,
            ISNULL(tp.total_reviews, 0) as tutor_reviews,
            ISNULL(tp.bio, '') as tutor_description,
            ISNULL(tp.hourly_rate, 0) as tutor_hourly_price
        FROM Class c
        INNER JOIN Subjects s ON c.subject_id = s.subject_id
        LEFT JOIN UserAccount ua ON c.tutor_id = ua.user_id
        LEFT JOIN TutorProfile tp ON tp.user_id = ua.user_id
        WHERE c.class_id = :classId AND c.student_id = :studentId
      `;

      const classDetails = await sequelize.query(classQuery, {
        replacements: { classId, studentId },
        type: QueryTypes.SELECT,
      });

      if (classDetails.length === 0) {
        throw new Error("Lớp học không tồn tại");
      }

      // Get schedules
      const scheduleQuery = `
        SELECT schedule_id, day_of_week, start_date, end_date, duration_minutes, created_at
        FROM Schedule
        WHERE class_id = :classId
        ORDER BY 
            CASE day_of_week 
                WHEN 1 THEN 1 
                WHEN 2 THEN 2 
                WHEN 3 THEN 3 
                WHEN 4 THEN 4 
                WHEN 5 THEN 5 
                WHEN 6 THEN 6 
                WHEN 7 THEN 7 
            END,
            start_date
      `;

      const schedules = await sequelize.query(scheduleQuery, {
        replacements: { classId },
        type: QueryTypes.SELECT,
      });

      // Get tutor applications
      const applicationsQuery = `
        SELECT
            ta.application_id,
            ta.tutor_id,
            ta.status,
            ta.isConfirmed,
            ta.applied_at,
            ua.name as tutor_name,
            ua.email as tutor_email,
            ua.phone as tutor_phone,
            tp.hourly_rate,
            tp.avg_rating,
            tp.total_reviews
        FROM TutorApplication ta
        INNER JOIN UserAccount ua ON ta.tutor_id = ua.user_id
        INNER JOIN TutorProfile tp ON ta.tutor_id = tp.user_id
        WHERE ta.class_id = :classId
        ORDER BY 
            CASE ta.status WHEN 'invited' THEN 1 WHEN 'applied' THEN 2 ELSE 3 END,
            ta.applied_at DESC
      `;

      const applications = await sequelize.query(applicationsQuery, {
        replacements: { classId },
        type: QueryTypes.SELECT,
      });

      return {
        class: classDetails[0],
        schedules,
        tutor_applications: applications,
      };
    } catch (error) {
      throw error;
    }
  }

  // =====================================================
  // 6. LẤY DANH SÁCH GIA SƯ GỢI Ý
  // =====================================================
  static async getSuggestedTutors(subjectId) {
    try {
      // ⚠️ Note: TutorProfile không có subject_id, chỉ có subjects (string)
      // Giải pháp: Lấy tất cả gia sư có rating cao nhất
      // TODO: Cần thêm bảng TutorSubject hoặc JSON parse subjects
      const query = `
        SELECT TOP 20
            tp.tutor_profile_id as tutor_id,
            ua.user_id,
            ua.name,
            ua.phone,
            ua.email,
            tp.hourly_rate,
            tp.bio,
            tp.experience_years,
            tp.subjects,
            tp.avg_rating,
            tp.total_reviews,
            tp.created_at
        FROM TutorProfile tp
        INNER JOIN UserAccount ua ON tp.user_id = ua.user_id
        WHERE ua.is_verified = 1 AND ua.status = '1'
        ORDER BY tp.avg_rating DESC, tp.total_reviews DESC, tp.created_at DESC
      `;

      const tutors = await sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return tutors;
    } catch (error) {
      throw error;
    }
  }

  // =====================================================
  // 7. PHỤ HUYNH SỬA THÔNG TIN LỚP HỌC
  // =====================================================

  static async updateClassInfo(
    classId,
    studentUserId,
    { description, requirement, hourly_price }
  ) {
    try {
      const result = await sequelize.query(
        `EXEC sp_UpdateClass
            @ClassId = :classId,
            @StudentUserId = :studentUserId,
            @Description = :description,
            @Requirement = :requirement,
            @HourlyPrice = :hourlyPrice`,
        {
          replacements: {
            classId,
            studentUserId,
            description: description || "",
            requirement: requirement || "",
            hourlyPrice: hourly_price,
          },
          type: QueryTypes.SELECT,
        }
      );
      console.log("✅ [updateClass] Success:", classId);
      console.log("dữ liệu database trả về sau khi sửa", result[0]);
      return result[0];
    } catch (error) {
      console.error("❌ [updateClass] Error:", error.message);
      throw error;
    }
  }
  // =====================================================
  // 8. LẤY DANH SÁCH GIA SƯ ĐÃ ỨNG TUYỂN/ĐƯỢC MỜI VÀO LỚP ĐANG ĐƯỢC SỬA ĐỂ GỬI THÔNG BÁO
  // =====================================================
  static async getApplicationTutors(classId) {
    try {
      const result = await sequelize.query(
        `EXEC sp_GetApplicationTutors
            @ClassId = :classId`,
        {
          replacements: { classId },
          type: QueryTypes.SELECT,
        }
      );
      console.log(`✅ [getApplicationTutors] Found ${result.length} tutors`);
      console.log(
        "danh sách gia sư đã ứng tuyển/được mời vào lớp học để gửi thông báo",
        result
      );
      return result;
    } catch (error) {
      console.error("❌ [getApplicationTutors] Error:", error.message);
      throw error;
    }
  }
  // =====================================================
  // 9. PHỤ HUYNH HỦY LỚP HỌC(CHỈ NHỮNG LỚP HỌC Ở TRẠNG THÁI ĐANG TUYỂN GIA SƯ)
  // =====================================================
  static async cancelClass(classId, studentUserId, cancellationReason) {
    try {
      // ✅ Validation - Lý do hủy là bắt buộc
      if (!cancellationReason || cancellationReason.trim() === "") {
        throw new Error("Lý do hủy lớp là bắt buộc");
      }
      const result = await sequelize.query(
        `EXEC sp_CancelClass
            @ClassId = :classId,
            @StudentUserId = :studentUserId,
            @CancellationReason = :cancellationReason`,
        {
          replacements: {
            classId,
            studentUserId,
            cancellationReason: cancellationReason.trim(),
          },
          type: QueryTypes.SELECT,
        }
      );
      console.log("✅ [cancelClass] Success:", classId);
      return result[0];
    } catch (error) {
      console.error("❌ [cancelClass] Error:", error.message);
      throw error;
    }
  }
  // =====================================================
  // 10. LẤY DANH SÁCH GIA SƯ ỨNG TUYỂN CHO 1 LỚP
  // =====================================================
  static async getApplicationsByClass(classId, studentUserId) {
    try {
      const query = `
        SELECT
            ta.application_id,
            ta.tutor_id,
            ta.status,
            ta.applied_at,
            ta.approved_at,
            
            ua.name as tutor_name,
            ua.email as tutor_email,
            ua.phone as tutor_phone,
            ua.dateOfBirth as tutor_dob,
            
            tp.experience_years,
            tp.bio,
            tp.avg_rating,
            tp.total_reviews,
            
            w.name as ward_name,
            d.name as district_name,
            p.name as province_name,
            
            c.description as class_description,
            c.requirement,
            c.hourly_price,
            
            sub.name as subject_name
            FROM TutorApplication ta
            JOIN Class c on ta.class_id = c.class_id
            join UserAccount ua on ta.tutor_id = ua.user_id
            join TutorProfile tp on ua.user_id = tp.user_id
            
            left join Ward w on ua.address_id = w.id
            left join District d on w.district_id = d.id
            left join Province_Id p on d.province_id = p.id
            
            join Subjects sub on c.subject_id = sub.subject_id
            where ta.class_id = :classId
            and c.student_id = :studentUserId
            and ta.status = 'applied'
            ORDER BY ta.applied_at DESC`;
      const results = await sequelize.query(query, {
        replacements: { classId, studentUserId },
        type: QueryTypes.SELECT,
      });
      console.log(
        `✅ [getApplicationsByClassId] Found ${results.length} tutors for class ${classId}`
      );
      console.log(
        "Dữ liệu đơn ứng tuyển của lớp học backend lấy được từ database: ",
        results
      );
      return results;
    } catch (error) {
      console.error("❌ [getApplicationsByClassId] Error:", error.message);
      throw error;
    }
  }
  // =====================================================
  // 11. LẤY CHI TIẾT GIA SƯ + LỊCH DẠY + LỚP ĐÃ DẠY + ĐÁNH GIÁ
  // =====================================================

  static async getTutorDetailApproval(tutorUserId, classId, studentUserId) {
    try {
      const tutorQuery = `
        SELECT 
          ua.user_id,
          ua.name as tutor_name,
          ua.email as tutor_email,
          ua.phone as tutor_phone,
          ua.dateOfBirth as tutor_dob,
          tp.hourly_rate,
          tp.bio,
          tp.experience_years,
          tp.avg_rating,
          tp.total_reviews,
          w.name as ward_name,
          d.name as district_name,
          p.name as province_name
          from UserAccount ua
          join TutorProfile tp on tp.user_id = ua.user_id
          left join Ward w on w.id = ua.address_id
          left join District d on d.id = w.district_id
          left join Province_Id p on p.id = d.province_id
          where ua.user_id = :tutorUserId`;

      const tutorDetails = await sequelize.query(tutorQuery, {
        replacements: { tutorUserId },
        type: QueryTypes.SELECT,
      });
      if (tutorDetails.length === 0) {
        throw new Error("Không tìm thấy thông tin gia sư");
      }
      const schedulesQuery = `
        SELECT 
          ta.application_id,
          ta.class_id,
          sch.schedule_id,
          sch.day_of_week,
          sch.start_date as start_time,
          sch.end_date as end_time,
          c.subject_id,
          sub.name as subject_name
          from TutorApplication ta
          join Class c on ta.class_id = c.class_id
          join Schedule sch on sch.class_id = c.class_id
          join Subjects sub on c.subject_id = sub.subject_id
          where ta.tutor_id = :tutorUserId
          and ta.status = 'approved'
          and isConfirmed = 1
          and (sch.end_date is null or sch.end_date >= getdate())
          order by sch.day_of_week, sch.start_date`;

      const schedules = await sequelize.query(schedulesQuery, {
        replacements: { tutorUserId },
        type: QueryTypes.SELECT,
      });

      const classesQuery = `
      SELECT c.class_id, c.description, c.hourly_price, sub.name as subject_name from Class c
      join Subjects sub on c.subject_id = sub.subject_id
      where c.tutor_id = :tutorUserId
      and c.status in ('completed', 'active')
      order by c.created_at desc`;

      const classesTaught = await sequelize.query(classesQuery, {
        replacements: { tutorUserId },
        type: QueryTypes.SELECT,
      });
      const result = {
        tutor: tutorDetails[0],
        schedules,
        classes_taught: classesTaught,
      };
      console.log(
        "Dữ liệu thông tin gia sư, lịch dạy của gia sư lấy được từ database",
        result
      );

      return result;
    } catch (error) {
      console.error("❌ [getTutorDetailApproval] Error:", error.message);
      throw error;
    }
  }
  // =====================================================
  // 12. LẤY LỊCH HỌC CỦA LỚP
  // =====================================================
  static async getClassSchedules(classId) {
    try {
      const query = `
        SELECT 
          schedule_id,
          day_of_week,
          start_date as start_time,
          end_date as end_time,
          duration_minutes
          from Schedule
          where class_id = :classId
          and (end_date is null or end_date >= getdate())
          order by day_of_week, start_date
      `;
      const results = await sequelize.query(query, {
        replacements: { classId },
        type: QueryTypes.SELECT,
      });
      console.log(`✅ [getClassSchedules] Found ${results.length} schedules`);
      console.log("Dữ liệu lịch học của lớp lấy được từ database", results);
      return results;
    } catch (error) {
      console.error("❌ [getClassSchedules] Error:", error.message);
      throw error;
    }
  }
  // =====================================================
  // 13. KIỂM TRA LỊCH TRÙNG
  // =====================================================
  static checkScheduleConflict(classSchedules, tutorSchedules) {
    for (const classSch of classSchedules) {
      for (const tutorSch of tutorSchedules) {
        // Nếu cùng ngày trong tuần
        if (classSch.day_of_week === tutorSch.day_of_week) {
          // ✅ Parse DateTime thành HH:MM
          const classStart = new Date(classSch.start_time);
          const classEnd = new Date(classSch.end_time);
          const tutorStart = new Date(tutorSch.start_time);
          const tutorEnd = new Date(tutorSch.end_time);

          // Kiểm tra overlap
          if (classStart < tutorEnd && classEnd > tutorStart) {
            return true; // Có trùng
          }
        }
      }
    }
    return false; // Không trùng
  }
  // =====================================================
  // 14. DUYỆT/TỪ CHỐI GIA SƯ (GỘP)
  // =====================================================
  static async reviewTutorApplication(
    applicationId,
    studentUserId,
    action,
    rejectionReason = null
  ) {
    try {
      console.log(
        `📋 [reviewApplication] Action: ${action}, App: ${applicationId}`
      );
      if (!["approve", "reject"].includes(action)) {
        throw new Error(
          'Hành động không hợp lệ (phải là "approve" hoặc "reject")'
        );
      }
      // Validate rejection_reason khi reject
      if (
        action === "reject" &&
        (!rejectionReason || rejectionReason.trim() === "")
      ) {
        throw new Error("Lý do từ chối là bắt buộc");
      }
      const result = await sequelize.query(
        `EXEC sp_ReviewApplication
            @ApplicationId = :applicationId,
            @StudentUserId = :studentUserId,
            @Action = :action,
            @RejectionReason = :rejectionReason`,
        {
          replacements: {
            applicationId,
            studentUserId,
            action,
            rejectionReason: rejectionReason || null,
          },
          type: QueryTypes.SELECT,
        }
      );
      console.log(`✅ [reviewApplication] Success:`, result);
      return result[0];
    } catch (error) {
      console.error("❌ [reviewApplication] Error:", error.message);
      throw error;
    }
  }
}

module.exports = ClassModel;
