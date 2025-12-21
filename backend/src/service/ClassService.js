/**
 * Class Business Logic
 * Gọi Model + gửi Notification
 */

const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/sqlserver");
const ClassModel = require("../models/Student/classModel");
const socketEmitter = require("../utils/socketEmitter");

class ClassService {
  static async inviteSingleTutor(classId, tutorId, studentUserId) {
    try {
      console.log(`📝 [inviteSingleTutor] Inviting tutor ${tutorId}`);

      // 1. Gọi stored procedure
      const result = await ClassModel.inviteSingleTutor(
        classId,
        tutorId,
        studentUserId
      );

      console.log("✅ [inviteSingleTutor] SP executed");

      // 2. Query Notification từ DB
      const notifQuery = `
      SELECT TOP 1
        notification_id,
        receiver_id,
        type,
        title,
        message,
        metadata,
        created_at
      FROM Notifications
      WHERE receiver_id = :tutorId
        AND type = 'TUTOR_INVITED'
        AND sender_id = :studentUserId
      ORDER BY created_at DESC
    `;

      console.log("🔍 [inviteSingleTutor] Querying DB...");
      const notification = await sequelize.query(notifQuery, {
        replacements: { tutorId, studentUserId },
        type: QueryTypes.SELECT,
      });

      // ✅ LOG DỮ LIỆU TỪ DB
      console.log("📊 [inviteSingleTutor] DB Query Result:");
      console.log("   Count:", notification?.length);
      if (notification && notification.length > 0) {
        const notif = notification[0];
        console.log("   notification_id:", notif.notification_id);
        console.log("   type:", notif.type);
        console.log("   title:", notif.title);
        console.log("   message:", notif.message);
        console.log("   created_at:", notif.created_at);
        console.log("   created_at type:", typeof notif.created_at);
      }

      // 3. Gửi qua Socket
      if (notification && notification.length > 0) {
        const notif = notification[0];

        // ✅ LOG TRƯỚC KHI GỬI SOCKET
        console.log("📤 [inviteSingleTutor] Sending to Socket:");
        console.log("   receiver_id:", notif.receiver_id);
        console.log("   created_at:", notif.created_at);

        socketEmitter.sendNotification(notif.receiver_id, {
          notification_id: notif.notification_id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          metadata: notif.metadata ? JSON.parse(notif.metadata) : {},
          created_at: notif.created_at,
        });

        console.log("✅ [inviteSingleTutor] Socket sent successfully");
      } else {
        console.warn("⚠️ [inviteSingleTutor] No notification found in DB!");
      }

      return result;
    } catch (error) {
      console.error(
        "❌ [inviteSingleTutor] Error:",
        error.message || error.toString()
      );
      throw error;
    }
  }

  // ✅ Cập nhật lớp + gửi Notification cho tất cả gia sư
  static async updateClass(classId, studentUserId, updateData) {
    try {
      // 1. Cập nhật database
      const result = await ClassModel.updateClassInfo(
        classId,
        studentUserId,
        updateData
      );

      // 2. Lấy danh sách gia sư cần thông báo
      const tutors = await ClassModel.getApplicationTutors(classId);
      console.log(
        `📋 Found ${tutors.length} tutors to notify via socket real-time`
      );

      // ✅ 3. Query tất cả Notifications vừa insert từ DB (batch)
      const notifsQuery = `
        SELECT
          notification_id,
          receiver_id,
          type,
          title,
          message,
          metadata,
          created_at
        FROM Notifications
        WHERE type = 'CLASS_UPDATED'
          AND sender_id = :studentUserId
          AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
        ORDER BY created_at DESC
      `;

      const notifications = await sequelize.query(notifsQuery, {
        replacements: { studentUserId },
        type: QueryTypes.SELECT,
      });
      // 4. Gửi notification cho từng gia sư
      // 4. Gửi notification real-time cho từng gia sư
      if (notifications && notifications.length > 0) {
        notifications.forEach((notif) => {
          socketEmitter.sendNotification(notif.receiver_id, {
            notification_id: notif.notification_id,
            type: notif.type,
            title: notif.title,
            message: notif.message, // ✅ Từ DB
            metadata: notif.metadata ? JSON.parse(notif.metadata) : {},
            created_at: notif.created_at,
          });

          console.log(
            `✅ Notification sent to tutor ${notif.receiver_id}: ${notif.type}`
          );
        });
      }

      return result;
    } catch (error) {
      console.error(
        "❌ [updateClass] Error:",
        error.message || error.toString()
      );
      throw error;
    }
  }
  // ✅ Hủy lớp + gửi Notification
  static async cancelClass(classId, studentUserId, reason) {
    try {
      const result = await ClassModel.cancelClass(
        classId,
        studentUserId,
        reason
      );

      // 2. Lấy danh sách gia sư cần thông báo
      const tutors = await ClassModel.getApplicationTutors(classId);
      console.log(`📋 Found ${tutors.length} tutors to notify cancel event`);
      // ✅ 3. Query Notifications từ DB
      const notifsQuery = `
        SELECT
          notification_id,
          receiver_id,
          type,
          title,
          message,
          metadata,
          created_at
        FROM Notifications
        WHERE type = 'CLASS_CANCELLED'
          AND sender_id = :studentUserId
          AND CAST(created_at AS DATE) = CAST(GETDAY() AS DATE)
        ORDER BY created_at DESC
      `;

      const notifications = await sequelize.query(notifsQuery, {
        replacements: { studentUserId },
        type: QueryTypes.SELECT,
      });
      // 3. Gửi notification cho từng gia sư
      if (notifications && notifications.length > 0) {
        notifications.forEach((notif) => {
          socketEmitter.sendNotification(notif.receiver_id, {
            notification_id: notif.notification_id,
            type: notif.type,
            title: notif.title,
            message: notif.message, // ✅ Từ DB
            metadata: notif.metadata ? JSON.parse(notif.metadata) : {},
            created_at: notif.created_at,
          });

          console.log(
            `✅ Cancel notification sent to tutor ${notif.receiver_id}`
          );
        });
      }

      return result;
    } catch (error) {
      console.error(
        "❌ [cancelClass] Error:",
        error.message || error.toString()
      );
      throw error;
    }
  }
  // Duyệt gia sư/ từ chối gia sư + gửi Notification
  static async reviewApplication(applicationId, studentUserId, action, reason) {
    try {
      console.log(
        `📝 [reviewApplication] Reviewing application ${applicationId}`
      );
      // 1. Cập nhật trạng thái ứng tuyển
      const result = await ClassModel.reviewTutorApplication(
        applicationId,
        studentUserId,
        action,
        reason
      );

      const notifQuery = `
        SELECT TOP 1
          notification_id,
          receiver_id,
          type,
          title,
          message,
          metadata,
          created_at
        FROM Notifications
        WHERE sender_id = :studentUserId
          AND type IN ('APPLICATION_APPROVED_BY_STUDENT', 'APPLICATION_REJECTED_BY_STUDENT')
        ORDER BY created_at DESC
      `;
      const notification = await sequelize.query(notifQuery, {
        replacements: { studentUserId },
        type: QueryTypes.SELECT,
      });
      if (notification && notification.length > 0) {
        const notif = notification[0];
        socketEmitter.sendNotification(notif.receiver_id, {
          notification_id: notif.notification_id,
          type: notif.type,
          title: notif.title,
          message: notif.message, // ✅ Từ DB
          metadata: notif.metadata ? JSON.parse(notif.metadata) : {},
          created_at: notif.created_at,
        });

        console.log(
          `✅ [reviewApplication] Notification sent to tutor ${notif.receiver_id}`
        );
      }

      return result;
    } catch (error) {
      console.error(
        "❌ [reviewApplication] Error:",
        error.message || error.toString()
      );
      throw error;
    }
  }
}
module.exports = ClassService;
