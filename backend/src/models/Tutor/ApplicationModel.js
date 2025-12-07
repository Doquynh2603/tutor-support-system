/**
 * File: backend/src/models/ApplicationModel.js
 * Mục đích: Quản lý đơn ứng tuyển (create, withdraw, confirm, etc.)
 */

const { parse } = require("path");
const { sequelize } = require("../../config/sqlserver");
const { QueryTypes } = require("sequelize");
const sqlserver = require("../../config/sqlserver");

class ApplicationModel {
  //lấy danh sách đơn ứng tuyển của gia sư kết hợp lịch học
  static async getTutorApplications(tutorUserId, appStatus = null) {
    try {
      let query = `
      SELECT 
        ta.application_id,
        ta.status as application_status,
        ta.applied_at as applied_date,
        ta.approved_at,
        ta.response_at,
        ta.isConfirmed,
        ta.declineReason,
        ta.withdrawReason,
        ta.withdrawn_at,

        c.class_id,
        c.description as class_description,
        c.hourly_price,
        c.requirement,
        c.status as class_status,
        c.created_at as class_created_at,
        c.cancellation_reason,
        sub.name as subject_name,

        ua.name as student_name,
        ua.email as student_email,
        ua.phone as student_phone,

        sp.gradeLevel,
        sp.school,

        w.name as ward_name,
        p.name as province_name,

        sch.schedule_id,
        sch.day_of_week,
        sch.start_date as start_time,
        sch.end_date as end_time,
        sch.duration_minutes,
        sch.status as schedule_status,
        sch.recurrence_type

      FROM TutorApplication ta
      JOIN Class c ON ta.class_id = c.class_id
      JOIN Subjects sub ON c.subject_id = sub.subject_id
      
      JOIN UserAccount ua ON ua.user_id = c.student_id
      JOIN StudentProfile sp ON sp.user_id = ua.user_id

      LEFT JOIN Ward w ON ua.address_id = w.id
      LEFT JOIN District d ON w.district_id = d.id
      LEFT JOIN Province_Id p ON d.province_id = p.id

      LEFT JOIN Schedule sch 
        ON c.class_id = sch.class_id
        AND (sch.end_date IS NULL OR sch.end_date >= GETDATE())

      WHERE ta.tutor_id = :tutorUserId
    `;

      if (appStatus) {
        query += ` AND ta.status = :appStatus`;
      }

      query += ` ORDER BY ta.applied_at DESC`;

      const rows = await sequelize.query(query, {
        replacements: { tutorUserId, appStatus: appStatus || null },
        type: QueryTypes.SELECT,
      });

      // ---- Gom vào application giống model 1 ----
      const appMap = {};

      rows.forEach((row) => {
        if (!appMap[row.application_id]) {
          appMap[row.application_id] = {
            application_id: row.application_id,
            status: row.application_status,
            applied_date: row.applied_date,
            approved_at: row.approved_at,
            response_at: row.response_at,
            isConfirmed: row.isConfirmed,
            declineReason: row.declineReason,
            withdrawReason: row.withdrawReason,
            withdrawn_at: row.withdrawn_at,

            class_id: row.class_id,
            class_description: row.class_description,
            hourly_price: row.hourly_price,
            requirement: row.requirement,
            class_status: row.class_status,
            class_created_at: row.class_created_at,
            cancellation_reason: row.cancellation_reason,
            subject_name: row.subject_name,

            student_name: row.student_name,
            student_email: row.student_email,
            student_phone: row.student_phone,
            gradeLevel: row.gradeLevel,
            school: row.school,

            ward_name: row.ward_name,
            province_name: row.province_name,

            schedules: [],
          };
        }

        if (row.schedule_id) {
          appMap[row.application_id].schedules.push({
            schedule_id: row.schedule_id,
            day_of_week: row.day_of_week,
            start_time: row.start_time,
            end_time: row.end_time,
            duration_minutes: row.duration_minutes,
            schedule_status: row.schedule_status,
            recurrence_type: row.recurrence_type,
          });
        }
      });

      return Object.values(appMap);
    } catch (error) {
      console.error(
        "❌ [ClassModel.getTutorApplications] Error:",
        error.message
      );
      throw error;
    }
  }

  // Lấy 1 đơn ứng tuyển theo ID (kèm thông tin lịch học, lớp, học sinh)
  static async getTutorApplicationById(tutorUserId, applicationId) {
    try {
      let query = `
      SELECT 
        ta.application_id,
        ta.status as application_status,
        ta.applied_at as applied_date,
        ta.approved_at,
        ta.response_at,
        ta.isConfirmed,
        ta.declineReason,
        ta.withdrawReason,
        ta.withdrawn_at,

        c.class_id,
        c.description as class_description,
        c.hourly_price,
        c.requirement,
        c.status as class_status,
        c.created_at as class_created_at,
        c.cancellation_reason,
        sub.name as subject_name,

        ua.name as student_name,
        ua.email as student_email,
        ua.phone as student_phone,

        sp.gradeLevel,
        sp.school,

        w.name as ward_name,
        p.name as province_name,

        sch.schedule_id,
        sch.day_of_week,
        sch.start_date as start_time,
        sch.end_date as end_time,
        sch.duration_minutes,
        sch.status as schedule_status,
        sch.recurrence_type

      FROM TutorApplication ta
      JOIN Class c ON ta.class_id = c.class_id
      JOIN Subjects sub ON c.subject_id = sub.subject_id

      JOIN UserAccount ua ON ua.user_id = c.student_id
      JOIN StudentProfile sp ON sp.user_id = ua.user_id

      LEFT JOIN Ward w ON ua.address_id = w.id
      LEFT JOIN District d ON w.district_id = d.id
      LEFT JOIN Province_Id p ON d.province_id = p.id

      LEFT JOIN Schedule sch 
        ON c.class_id = sch.class_id
        AND (sch.end_date IS NULL OR sch.end_date >= GETDATE())

      WHERE ta.application_id = :applicationId
        AND ta.tutor_id = :tutorUserId
    `;

      const rows = await sequelize.query(query, {
        replacements: { tutorUserId, applicationId },
        type: QueryTypes.SELECT,
      });

      if (rows.length === 0) return null;

      // Gom dữ liệu schedules
      const result = {
        application_id: rows[0].application_id,
        status: rows[0].application_status,
        applied_date: rows[0].applied_date,
        approved_at: rows[0].approved_at,
        response_at: rows[0].response_at,
        isConfirmed: rows[0].isConfirmed,
        declineReason: rows[0].declineReason,
        withdrawReason: rows[0].withdrawReason,
        withdrawn_at: rows[0].withdrawn_at,

        class_id: rows[0].class_id,
        class_description: rows[0].class_description,
        hourly_price: rows[0].hourly_price,
        requirement: rows[0].requirement,
        class_status: rows[0].class_status,
        class_created_at: rows[0].class_created_at,
        cancellation_reason: rows[0].cancellation_reason,
        subject_name: rows[0].subject_name,

        student_name: rows[0].student_name,
        student_email: rows[0].student_email,
        student_phone: rows[0].student_phone,
        gradeLevel: rows[0].gradeLevel,
        school: rows[0].school,

        ward_name: rows[0].ward_name,
        province_name: rows[0].province_name,

        schedules: rows
          .filter((r) => r.schedule_id)
          .map((r) => ({
            schedule_id: r.schedule_id,
            day_of_week: r.day_of_week,
            start_time: r.start_time,
            end_time: r.end_time,
            duration_minutes: r.duration_minutes,
            schedule_status: r.schedule_status,
            recurrence_type: r.recurrence_type,
          })),
      };

      return result;
    } catch (error) {
      console.error(
        "❌ [ApplicationModel.getTutorApplicationById] Error:",
        error.message
      );
      throw error;
    }
  }

  static async createApplication(tutorUserId, classId) {
    try {
      console.log(
        `📝 [ApplicationModel.createApplication] Tutor ${tutorUserId} applying for class ${classId}`
      );

      const [classRecord] = await sequelize.query(
        `SELECT class_id, status FROM Class WHERE class_id = :classId`,
        { replacements: { classId }, type: QueryTypes.SELECT }
      );

      if (!classRecord) throw new Error("Lớp học không tồn tại");
      if (classRecord.status !== "recruiting")
        throw new Error("Lớp học không còn tuyển gia sư");

      const allApplications = await sequelize.query(
        `SELECT application_id, status FROM TutorApplication 
       WHERE tutor_id = :tutorUserId AND class_id = :classId 
       ORDER BY applied_at DESC`,
        { replacements: { tutorUserId, classId }, type: QueryTypes.SELECT }
      );

      const activeApplication = allApplications.find(
        (app) => app.status === "applied" || app.status === "approved"
      );
      if (activeApplication)
        throw new Error("Bạn đã ứng tuyển cho lớp này rồi");

      const withdrawnApplication = allApplications.find(
        (app) => app.status === "withdrawn"
      );
      let application;

      if (withdrawnApplication) {
        console.log(
          "Reusing withdrawn application:",
          withdrawnApplication.application_id
        );

        await sequelize.query(
          `UPDATE TutorApplication
         SET status = 'applied',
             applied_at = GETDATE(),
             withdrawReason = NULL,
             declineReason = NULL
         WHERE application_id = :applicationId`,
          {
            replacements: {
              applicationId: withdrawnApplication.application_id,
            },
            type: QueryTypes.UPDATE,
          }
        );

        const [updated] = await sequelize.query(
          `SELECT * FROM TutorApplication WHERE application_id = :applicationId`,
          {
            replacements: {
              applicationId: withdrawnApplication.application_id,
            },
            type: QueryTypes.SELECT,
          }
        );
        application = updated;
      } else {
        console.log(`➕ [createApplication] Creating new application`);
        await sequelize.query(
          `INSERT INTO TutorApplication (tutor_id, class_id, status, applied_at)
         VALUES (:tutorUserId, :classId, 'applied', GETDATE())`,
          { replacements: { tutorUserId, classId }, type: QueryTypes.INSERT }
        );

        const [newApp] = await sequelize.query(
          `SELECT TOP 1 * FROM TutorApplication 
         WHERE tutor_id = :tutorUserId AND class_id = :classId 
         ORDER BY applied_at DESC`,
          { replacements: { tutorUserId, classId }, type: QueryTypes.SELECT }
        );
        application = newApp;
      }

      console.log(
        `✅ [ApplicationModel.createApplication] Success:`,
        application.application_id
      );
      return application;
    } catch (error) {
      console.error("❌ [ApplicationModel.createApplication]:", error.message);
      throw error;
    }
  }

  static async withdrawApplication(
    applicationId,
    tutorUserId,
    withdrawReason = null
  ) {
    try {
      console.log(
        `📋 [ApplicationModel] Withdrawing application ${applicationId}`
      );

      const result = await sequelize.query(
        `EXEC sp_WithdrawApplication 
        @ApplicationId = :applicationId,
        @TutorUserId = :tutorUserId,
        @Reason = :withdrawReason`,
        {
          replacements: {
            applicationId,
            tutorUserId,
            withdrawReason: withdrawReason || null,
          },
          type: QueryTypes.SELECT,
        }
      );

      console.log(`✅ [ApplicationModel.withdrawApplication] Success:`, result);
      return result;
    } catch (error) {
      console.error(
        "❌ [ApplicationModel.withdrawApplication]:",
        error.message
      );
      throw error;
    }
  }

  static async confirmApplication(
    tutorUserId,
    applicationId,
    isConfirmed,
    declineReason = null
  ) {
    try {
      console.log(
        `🤝 [ApplicationModel.confirmApplication] App ${applicationId}, Tutor ${tutorUserId}, Confirmed: ${isConfirmed}`
      );

      const result = await sequelize.query(
        `EXEC sp_TutorConfirmClass 
        @ApplicationId = :applicationId,
        @TutorUserId = :tutorUserId,
        @IsConfirmed = :isConfirmed,
        @DeclineReason = :declineReason`,
        {
          replacements: {
            applicationId,
            tutorUserId,
            isConfirmed: isConfirmed ? 1 : 0, // BIT đúng
            declineReason: declineReason || null,
          },
          type: QueryTypes.SELECT,
        }
      );

      console.log(`✅ [ApplicationModel.confirmApplication] Success:`, result);
      return result;
    } catch (error) {
      console.error("❌ [ApplicationModel.confirmApplication]:", error.message);
      throw error;
    }
  }
}
module.exports = ApplicationModel;
