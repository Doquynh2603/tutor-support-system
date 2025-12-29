/**
 * File: backend/src/models/ApplicationModel.js
 * Mục đích: Quản lý đơn ứng tuyển (create, withdraw, confirm, etc.)
 */

import { sequelize } from "../../config/sqlserver";
import { QueryTypes } from "sequelize";

// --- Interfaces ---

// ✅ Khớp với View_ApplicationList
export interface ApplicationListItem {
  application_id: string;
  tutor_id: string;
  status: string; // application_status
  class_id: string;
  applied_at: Date;
  subject_name: string;
  classLevel: number;
  classLocation: string | null;
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
  isConfirmed: boolean | null;
}

// ✅ Khớp với View_ApplicationDetail
export interface ApplicationDetail {
  application_id: string;
  tutor_id: string;
  status: string; // application_status
  class_id: string;
  applied_at: Date;
  approved_at: Date | null;
  declineReason: string | null;
  response_at: Date | null;
  withdrawn_at: Date | null;
  withdrawReason: string | null;
  subject_name: string;
  classLevel: number;
  start_date: string | null;
  end_date: string | null;
  cancellation_reason: string | null;
  requirement: string | null;
  description: string | null;
  hourly_price: number;
  classLocation: string | null;
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
  student_name: string;
  gender: boolean | null;
  student_email: string;
  student_phone: string | null;
}

export interface TutorApplicationRecord {
  application_id: string;
  tutor_id: string;
  class_id: string;
  status: string;
  applied_at: Date;
  isConfirmed: boolean | null;
}

class ApplicationModel {
  //lấy danh sách đơn ứng tuyển của gia sư kết hợp lịch học
  static async getTutorApplications(
    tutorUserId: string,
    appStatus: string | null = null
  ): Promise<ApplicationListItem[]> {
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

      const rows = await sequelize.query<ApplicationListItem>(query, {
        replacements: { tutorUserId, appStatus: appStatus || null },
        type: QueryTypes.SELECT,
      });
      return rows || [];
    } catch (error: any) {
      console.error(
        "❌ [ClassModel.getTutorApplications] Error:",
        error.message
      );
      throw error;
    }
  }

  // Lấy 1 đơn ứng tuyển theo ID (kèm thông tin lịch học, lớp, học sinh)
  static async getTutorApplicationById(
    tutorUserId: string,
    applicationId: string
  ): Promise<ApplicationDetail | null> {
    try {
      const query = `
      SELECT 
        * from View_ApplicationDetail

      WHERE application_id = :applicationId
        AND tutor_id = :tutorUserId
    `;

      const rows = await sequelize.query<ApplicationDetail>(query, {
        replacements: { tutorUserId, applicationId },
        type: QueryTypes.SELECT,
      });

      return rows && rows.length > 0 ? rows[0] : null;
    } catch (error: any) {
      console.error(
        "❌ [ApplicationModel.getTutorApplicationById] Error:",
        error.message
      );
      throw error;
    }
  }

  static async createApplication(
    tutorUserId: string,
    classId: string
  ): Promise<TutorApplicationRecord> {
    try {
      console.log(
        `📝 [ApplicationModel.createApplication] Tutor ${tutorUserId} applying for class ${classId}`
      );
      // ✅ Kiểm tra lớp tồn tại
      const classResult = await sequelize.query<{
        class_id: string;
        status: string;
      }>(`SELECT class_id, status FROM Class WHERE class_id = :classId`, {
        replacements: { classId },
        type: QueryTypes.SELECT,
      });
      if (!classResult || classResult.length === 0) {
        throw new Error("Lớp học không tồn tại");
      }
      const classRecord = classResult[0];
      if (classRecord.status !== "recruiting") {
        throw new Error("Lớp học không còn tuyển gia sư");
      }

      // ✅ Kiểm tra đã ứng tuyển hay chưa
      const allApplications = await sequelize.query<TutorApplicationRecord>(
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

      const withdrawnApplication = allApplications.find((app) =>
        [
          "withdrawn",
          "rejected",
          "invitation_cancelled",
          "class_cancelled",
        ].includes(app.status)
      );
      let application: TutorApplicationRecord;

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

        const updated = await sequelize.query<TutorApplicationRecord>(
          `SELECT * FROM TutorApplication WHERE application_id = :applicationId`,
          {
            replacements: {
              applicationId: withdrawnApplication.application_id,
            },
            type: QueryTypes.SELECT,
          }
        );
        application = updated[0];
      } else {
        console.log(`➕ [createApplication] Creating new application`);
        await sequelize.query(
          `INSERT INTO TutorApplication (tutor_id, class_id, status, applied_at)
         VALUES (:tutorUserId, :classId, 'applied', GETDATE())`,
          { replacements: { tutorUserId, classId }, type: QueryTypes.INSERT }
        );

        const newApp = await sequelize.query<TutorApplicationRecord>(
          `SELECT TOP 1 * FROM TutorApplication 
         WHERE tutor_id = :tutorUserId AND class_id = :classId 
         ORDER BY applied_at DESC`,
          { replacements: { tutorUserId, classId }, type: QueryTypes.SELECT }
        );
        application = newApp[0];
      }

      console.log(
        `✅ [ApplicationModel.createApplication] Success:`,
        application.application_id
      );
      return application;
    } catch (error: any) {
      console.error("❌ [ApplicationModel.createApplication]:", error.message);
      throw error;
    }
  }

  static async withdrawApplication(
    applicationId: string,
    tutorUserId: string,
    withdrawReason: string | null = null
  ): Promise<any> {
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
    } catch (error: any) {
      console.error(
        "❌ [ApplicationModel.withdrawApplication]:",
        error.message
      );
      throw error;
    }
  }

  static async confirmApplication(
    tutorUserId: string,
    applicationId: string,
    isConfirmed: boolean,
    declineReason: string | null = null
  ): Promise<any> {
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
    } catch (error: any) {
      console.error("❌ [ApplicationModel.confirmApplication]:", error.message);
      throw error;
    }
  }
}
export default ApplicationModel;
