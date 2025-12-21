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
        * from View_ApplicationList
      WHERE tutor_id = :tutorUserId
    `;

      if (appStatus) {
        query += ` AND application_status = :appStatus`;
      }

      query += ` ORDER BY applied_at DESC`;

      const rows = await sequelize.query(query, {
        replacements: { tutorUserId, appStatus: appStatus || null },
        type: QueryTypes.SELECT,
      });
      return rows;
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
        * from View_ApplicationDetail

      WHERE application_id = :applicationId
        AND tutor_id = :tutorUserId
    `;

      const rows = await sequelize.query(query, {
        replacements: { tutorUserId, applicationId },
        type: QueryTypes.SELECT,
      });

      if (rows.length === 0) return null;
      return rows[0];
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
        (app) =>
          app.status === "withdrawn" ||
          app.status === "rejected" ||
          app.status === "invitation_cancelled"
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
