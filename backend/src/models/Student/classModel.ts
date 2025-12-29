// backend/src/models/Student/ClassModel.js
/**
 * File: ClassModel.js
 * Mục đích: Xử lý tất cả logic SQL cho Class
 * Tác vụ: Tạo lớp, mời gia sư, duyệt ứng tuyển, lấy dữ liệu
 */

import { sequelize } from "../../config/sqlserver";
import { QueryTypes } from "sequelize";

// --- Interfaces ---

// ✅ Khớp với View_StudentClassList
// --- Interfaces ---

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
  invited_tutors_count: number;
  applied_tutors_count: number;
}

export interface ClassDetail {
  class_id: string;
  tutor_id: string | null;
  student_id: string;
  subject_id: string;
  description: string | null;
  requirement: string | null;
  hourly_price: number;
  status: string;
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
  start_date: string | null;
  end_date: string | null;
  sessions_per_week: number | null;
  cancellation_reason: string | null;
  classLevel: number;
  subject_name: string;
  tutor_name: string | null;
  tutor_phone: string | null;
  tutor_email: string | null;
  tutor_gender: boolean | null;
  tutor_location: string | null;
  tutor_ward: string | null;
  tutor_district: string | null;
  tutor_province: string | null;
  tutor_rating: number;
  tutor_reviews: number;
  tutor_description: string;
  tutor_experience_years: number;
  tutor_subjects: string | null;
  tutor_subjects_list?: string[]; // Field bổ sung sau khi parse
  classLocation: string | null;
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
  schedules?: string | Schedule[];
}

export interface Schedule {
  schedule_id: string;
  day_of_week: number;
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  duration_minutes: number;
}

export interface TutorApplication {
  application_id: string;
  tutor_id: string;
  status: string;
  isConfirmed: boolean | null;
  applied_at: Date;
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string | null;
  hourly_rate: number;
  avg_rating: number;
  total_reviews: number;
}

export interface SuggestedTutor {
  tutor_profile_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  gender: boolean;
  locationDetail: string;
  hourly_rate: number;
  bio: string;
  experience_years: number;
  avg_rating: number;
  total_reviews: number;
  ward_name: string;
  district_name: string;
  province_name: string;
  match_score: number;
  subjects: string[]; // Parsed array
}

export interface TutorDetailResponse {
  tutor: any;
  schedules: any[];
  classes_taught: any[];
}
class ClassModel {
  // =====================================================
  // 1. TẠO LỚP HỌC
  // =====================================================
  static async createClass(
    studentUserId: string,
    subjectId: string,
    description: string,
    requirement: string,
    hourlyPrice: number | string,
    classLevel: number,
    start_date: string,
    end_date: string,
    schedulesJson: string
  ): Promise<string> {
    try {
      console.log(
        `📝 [createClass] Creating class for student ${studentUserId}`
      );
      console.log("Parameters:", {
        studentUserId,
        subjectId,
        description,
        requirement,
        hourlyPrice,
        classLevel,
        start_date,
        end_date,
        schedulesJson,
      });
      // ✅ Gọi Stored Procedure
      const result = await sequelize.query(
        `EXEC sp_CreateClass
            @StudentUserId = :studentUserId,
            @SubjectId = :subjectId,
            @Description = :description,
            @Requirement = :requirement,
            @HourlyPrice = :hourlyPrice,
            @ClassLevel = :classLevel,
            @Start_date = :start_date,
            @End_date = :end_date,
            @SchedulesJson = :schedulesJson`,
        {
          replacements: {
            studentUserId,
            subjectId,
            description: description || "",
            requirement: requirement || "",
            hourlyPrice: hourlyPrice,
            classLevel: classLevel,
            start_date,
            end_date,
            schedulesJson,
          },
          type: QueryTypes.SELECT,
        }
      );

      console.log("✅ SP result:", result);
      if (!result || result.length === 0) {
        throw new Error("Stored Procedure không trả về kết quả");
      }

      const classId = (result[0] as any)?.class_id;

      if (!classId) {
        throw new Error("Không nhận được class_id từ Stored Procedure");
      }

      console.log("✅ Class created with ID:", classId);
      return classId;
    } catch (error) {
      console.error("❌ Error in createClass:", error.message);
      throw error;
    }
  }

  // =====================================================
  // 2. MỜI 1 GIA SƯ
  // =====================================================
  static async inviteSingleTutor(
    classId: string,
    tutorId: string,
    studentUserId: string
  ): Promise<any> {
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
  static async approveApplication(
    applicationId: string,
    studentUserId: string
  ): Promise<any> {
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
  static async getStudentClasses(
    studentId: string,
    status: string | null = null
  ): Promise<ClassListItem[]> {
    try {
      let whereClause = "WHERE student_id = :studentId ";
      const replacements: any = { studentId };
      if (status) {
        whereClause += "AND class_status = :status ";
        replacements.status = status;
      }
      const query = `
        SELECT
            *from View_StudentClassList
        ${whereClause}
        ORDER BY created_at DESC
      `;

      return await sequelize.query<ClassListItem>(query, {
        replacements,
        type: QueryTypes.SELECT,
      });
    } catch (error) {
      throw error;
    }
  }

  // =====================================================
  // 5. LẤY CHI TIẾT LỚP HỌC
  // =====================================================
  static async getClassDetails(
    classId: string,
    studentId: string
  ): Promise<{
    class: ClassDetail;
    schedules: Schedule[];
    tutor_applications: TutorApplication[];
  }> {
    try {
      // Get class info
      const classQuery = `
        SELECT
            *from View_StudentClassDetail
        WHERE class_id = :classId AND student_id = :studentId
      `;
      const classDetails = await sequelize.query<any>(classQuery, {
        replacements: { classId, studentId },
        type: QueryTypes.SELECT,
      });

      if (classDetails.length === 0) {
        throw new Error("Lớp học không tồn tại");
      }

      const classData = classDetails[0];
      let schedules: Schedule[] = [];

      // Parse JSON schedules từ View
      if (classData.schedules && typeof classData.schedules === "string") {
        try {
          schedules = JSON.parse(classData.schedules);
        } catch (e) {
          console.error("Error parsing schedules JSON:", e);
        }
      }
      // Xóa field raw string để trả về object sạch
      delete (classData as any).schedules;

      // ✅ Process Tutor Subjects (Fetch names from IDs)
      if (classData.tutor_subjects) {
        try {
          const subjectIds =
            typeof classData.tutor_subjects === "string"
              ? JSON.parse(classData.tutor_subjects)
              : classData.tutor_subjects;

          if (Array.isArray(subjectIds) && subjectIds.length > 0) {
            const placeholders = subjectIds
              .map((_, i) => `:subId${i}`)
              .join(",");
            const replacements: any = {};
            subjectIds.forEach((id, i) => (replacements[`subId${i}`] = id));

            const subjectsQuery = `SELECT name FROM Subjects WHERE subject_id IN (${placeholders})`;
            const subjects = await sequelize.query<{ name: string }>(
              subjectsQuery,
              {
                replacements,
                type: QueryTypes.SELECT,
              }
            );

            classData.tutor_subjects_list = subjects.map((s) => s.name);
          }
        } catch (e) {
          console.error("Error processing tutor subjects:", e);
        }
        // Remove raw string
        delete classData.tutor_subjects;
      }

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

      const applications = await sequelize.query<TutorApplication>(
        applicationsQuery,
        {
          replacements: { classId },
          type: QueryTypes.SELECT,
        }
      );

      return {
        class: classData,
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
  static async getSuggestedTutors(classId: string): Promise<SuggestedTutor[]> {
    // 🧠 THUẬT TOÁN TÍNH ĐIỂM (Match Score):
    // 1. Môn học: Bắt buộc phải khớp (Điều kiện WHERE)
    // 2. Địa điểm (Quan trọng nhất):
    //    - Cùng Quận/Huyện: +30 điểm
    //    - Khác Quận nhưng Cùng Tỉnh/TP: +10 điểm
    // 3. Học phí:
    //    - Gia sư có mức lương mong muốn <= Học phí lớp: +20 điểm
    // 4. Chất lượng:
    //    - Điểm đánh giá (avg_rating * 5): Tối đa 25 điểm
    //    - Kinh nghiệm (năm * 2): Tối đa 20 điểm (giới hạn logic)
    try {
      const query = `
        WITH ClassInfo AS (
            SELECT 
              c.class_id,
              c.subject_id,
              c.hourly_price,
              w.district_id,
              d.province_id
            FROM Class c
            JOIN UserAccount ua ON c.student_id = ua.user_id
            LEFT JOIN Ward w on ua.address_id = w.id
            LEFT JOIN District d on w.district_id = d.id
            where c.class_id = :classId
            )
            select top 20
              tp.tutor_profile_id,
              ua.user_id,
              ua.name,
              ua.email,
              ua.phone,
              ua.gender,
              ua.locationDetail,
              tp.hourly_rate,
              tp.bio,
              tp.experience_years,
              tp.avg_rating,
              tp.total_reviews,
              w.name as ward_name,
              d.name as district_name,
              p.name as province_name,
    (
                (CASE WHEN d.id = ci.district_id THEN 30 ELSE 0 END) + 
                (CASE WHEN p.id = ci.province_id AND d.id != ci.district_id THEN 10 ELSE 0 END) + 
                (CASE WHEN tp.hourly_rate <= ci.hourly_price THEN 20 ELSE 0 END) + 
                (ISNULL(tp.avg_rating, 0) * 5) + 
                (CASE WHEN ISNULL(tp.experience_years, 0) > 10 THEN 20 ELSE ISNULL(tp.experience_years, 0) * 2 END)
            ) AS match_score
             from TutorProfile tp
             join UserAccount ua on tp.user_id = ua.user_id
              left join Ward w on w.id = ua.address_id
              left join District d on w.district_id = d.id
              left join Province_Id p on p.id = d.province_id
              cross join ClassInfo ci
              where 
                ua.is_verified = 1
                and ua.status = 1
                and ua.role = 'tutor'
                and exists (
                  select 1 from OPENJSON(tp.subjects)
                  where value = cast(ci.subject_id as nvarchar(50))
                )
                  and not exists (
                   select 1 from TutorApplication ta
                   where ta.tutor_id = ua.user_id
                   and ta.class_id = ci.class_id)
                   order by match_score desc, tp.avg_rating desc;
      `;

      const tutors = await sequelize.query<any>(query, {
        replacements: { classId },
        type: QueryTypes.SELECT,
      });
      // Parse JSON subjects string thành mảng thật cho Frontend dùng
      const parsedTutors: SuggestedTutor[] = tutors.map((tutor) => ({
        ...tutor,
        subjects: tutor.subjects ? JSON.parse(tutor.subjects) : [],
      }));
      return parsedTutors;
    } catch (error) {
      throw error;
    }
  }

  // =====================================================
  // 7. PHỤ HUYNH SỬA THÔNG TIN LỚP HỌC
  // =====================================================

  static async updateClassInfo(
    classId: string,
    studentUserId: string,
    data: {
      description?: string;
      requirement?: string;
      hourly_price?: number;
      classLevel?: number;
    }
  ): Promise<any> {
    try {
      const result = await sequelize.query(
        `EXEC sp_UpdateClass
            @ClassId = :classId,
            @StudentUserId = :studentUserId,
            @Description = :description,
            @Requirement = :requirement,
            @HourlyPrice = :hourlyPrice,
            @ClassLevel = :classLevel`,
        {
          replacements: {
            classId,
            studentUserId,
            description: data.description || "",
            requirement: data.requirement || "",
            hourlyPrice: data.hourly_price,
            classLevel: data.classLevel,
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
  static async getApplicationTutors(classId: string): Promise<any[]> {
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
  static async cancelClass(
    classId: string,
    studentUserId: string,
    cancellationReason: string
  ): Promise<any> {
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
  static async getApplicationsByClass(
    classId: string,
    studentUserId: string
  ): Promise<any[]> {
    try {
      const query = `
        SELECT
            ta.application_id,
            ta.applied_at,
            
            ua.name as tutor_name,
            ua.email as tutor_email,
            ua.phone as tutor_phone,
            ua.gender as tutor_gender,
            ta.tutor_id
            FROM TutorApplication ta
            join UserAccount ua on ta.tutor_id = ua.user_id
            join Class c on ta.class_id = c.class_id
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

  static async getTutorDetailApproval(
    tutorUserId: string,
    classId: string,
    studentUserId: string
  ) {
    try {
      const tutorQuery = `
        SELECT 
          ua.user_id,
          ua.name as tutor_name,
          ua.email as tutor_email,
          ua.phone as tutor_phone,
          ua.dateOfBirth as tutor_dob,
          ua.gender as tutor_gender,
          ua.locationDetail as tutor_location,
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

      const tutorDetails = await sequelize.query<any>(tutorQuery, {
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
          CONVERT(varchar(5), sch.start_time, 108) AS start_time,
    CONVERT(varchar(5), sch.end_time, 108) AS end_time,
          c.subject_id,
          c.start_date as class_start_date,
          c.end_date as class_end_date,
          sub.name as subject_name
          from TutorApplication ta
          join Class c on ta.class_id = c.class_id
          join Schedule sch on sch.class_id = c.class_id
          join Subjects sub on c.subject_id = sub.subject_id
          where ta.tutor_id = :tutorUserId
          and ta.status = 'approved'
          and isConfirmed = 1
           AND (sch.end_time IS NULL OR CAST(GETDATE() AS TIME) <= sch.end_time)
          order by sch.day_of_week, sch.start_time`;

      const schedules = await sequelize.query(schedulesQuery, {
        replacements: { tutorUserId },
        type: QueryTypes.SELECT,
      });

      const classesQuery = `
      SELECT c.class_id, c.grade_level as classLevel, c.start_date, c.end_date, sub.name as subject_name from Class c
      join Subjects sub on c.subject_id = sub.subject_id
      where c.tutor_id = :tutorUserId
      and c.status in ('completed', 'active')
      AND (c.end_date IS NULL OR CAST(c.end_date AS DATE) >= CAST(GETDATE() AS DATE))
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
  static async getClassSchedules(classId: string): Promise<Schedule[]> {
    try {
      const query = `
        SELECT 
          schedule_id,
          day_of_week,
          CONVERT(varchar(5), start_time, 108) AS start_time,
    CONVERT(varchar(5), end_time, 108) AS end_time,
          duration_minutes
          from Schedule
          where class_id = :classId
          AND (end_time IS NULL OR CAST(GETDATE() AS TIME) <= end_time)
          order by day_of_week, start_time
      `;
      const results = await sequelize.query<Schedule>(query, {
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
  static checkScheduleConflict(
    classSchedules: Schedule[],
    tutorSchedules: Schedule[]
  ): boolean {
    // Helper function: Convert "HH:mm:ss" to minutes since midnight
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    for (const classSch of classSchedules) {
      for (const tutorSch of tutorSchedules) {
        // Nếu cùng ngày trong tuần
        if (classSch.day_of_week === tutorSch.day_of_week) {
          const classStart = toMinutes(classSch.start_time);
          const classEnd = toMinutes(classSch.end_time);
          const tutorStart = toMinutes(tutorSch.start_time);
          const tutorEnd = toMinutes(tutorSch.end_time);

          // Kiểm tra overlap: (StartA < EndB) and (EndA > StartB)
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
    applicationId: string,
    studentUserId: string,
    action: "approve" | "reject",
    rejectionReason: string | null = null
  ): Promise<any> {
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
export default ClassModel;
