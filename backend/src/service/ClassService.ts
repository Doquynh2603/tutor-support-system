/**
 * Class Business Logic
 * Gọi Model + gửi Notification
 */

import type { Notification } from "./NotificationService";
import { safeJsonParse } from "../utils/safeJson";
import ClassModel from "../models/Student/classModel";
import socketEmitter from "../utils/socketEmitter";
interface UpdateClassData {
  description?: string;
  requirement?: string;
  hourly_price: number;
  classLevel: number;
}

// interface SocketNotificationPayload {
//   notification_id: string;
//   receiver_id: string;
//   sender_id: string | null;
//   type: string;
//   title: string;
//   message: string | null;
//   metadata: Record<string, any>;
//   created_at: Date;
//   is_read: boolean;
// }

class ClassService {
  static async inviteSingleTutor(
    classId: string,
    tutorId: string,
    studentUserId: string
  ): Promise<void> {
    try {
      console.log(`📝 [inviteSingleTutor] Inviting tutor ${tutorId}`);

      // 1. Gọi stored procedure
      const result = await ClassModel.inviteSingleTutor(
        classId,
        tutorId,
        studentUserId
      );

      console.log(`✅ [inviteSingleTutor] Notifications returned:`, result);
      let notifications: Notification[] = [];
      if (result.notifications) {
        try {
          if (typeof result.notifications === "string") {
            notifications = JSON.parse(result.notifications);
            console.log(
              `✅ [inviteSingleTutor] Parsed ${notifications.length} notifications`
            );
          } else if (Array.isArray(result.notifications)) {
            notifications = result.notifications;
          }
        } catch (parseError) {
          console.error(
            "❌ [inviteSingleTutor] Error parsing notifications:",
            parseError
          );
          notifications = [];
        }
      }

      console.log(
        "Dữ liệu về thông báo backend nhận được từ database khi mời gia sư:",
        notifications
      );

      // 3. Gửi qua Socket.io

      if (
        notifications &&
        Array.isArray(notifications) &&
        notifications.length > 0
      ) {
        notifications.forEach((notif: any) => {
          socketEmitter.sendNotification(notif.receiver_id, {
            notification_id: notif.notification_id,
            receiver_id: notif.receiver_id,
            sender_id: notif.sender_id,
            type: notif.type,
            title: notif.title,
            message: notif.message ?? undefined, // ✅ Từ DB
            metadata: safeJsonParse(notif.metadata),
            created_at: notif.created_at,
            is_read: notif.is_read || false,
          });

          console.log(
            `✅ Notification sent to tutor ${notif.receiver_id}: ${notif.type}`
          );
        });
      } else {
        console.warn("⚠️ [inviteSingleTutor] No notification found in DB!");
      }
      return;
    } catch (error: any) {
      console.error(
        "❌ [inviteSingleTutor] Error:",
        error.message || error.toString()
      );
      throw error;
    }
  }

  // ✅ Cập nhật lớp + gửi Notification cho tất cả gia sư
  static async updateClass(
    classId: string,
    studentUserId: string,
    updateData: UpdateClassData
  ): Promise<void> {
    try {
      // 1. Cập nhật database
      const result = await ClassModel.updateClassInfo(
        classId,
        studentUserId,
        updateData
      );
      console.log("[updateClass]", result);

      let notifications: Notification[] = [];

      if (result.notifications) {
        try {
          // ✅ Nếu là string, parse nó
          if (typeof result.notifications === "string") {
            notifications = JSON.parse(result.notifications);
            console.log(
              `✅ [updateClass] Parsed ${notifications.length} notifications from string`
            );
          }
          // ✅ Nếu đã là array
          else if (Array.isArray(result.notifications)) {
            notifications = result.notifications;
            console.log(
              `✅ [updateClass] Got ${notifications.length} notifications as array`
            );
          }
        } catch (parseError) {
          console.error(
            "❌ [updateClass] Error parsing notifications:",
            parseError
          );
          notifications = [];
        }
      }
      console.log(`✅ [updateClass] Notifications returned:`, notifications);
      // ✅ 2. Loop từng notification và emit socket

      if (
        notifications &&
        Array.isArray(notifications) &&
        notifications.length > 0
      ) {
        notifications.forEach((notif) => {
          console.log(
            `📡 [updateClass] Emitting to user ${notif.receiver_id}, type: ${notif.type}`
          );
          socketEmitter.sendNotification(notif.receiver_id, {
            notification_id: notif.notification_id,
            receiver_id: notif.receiver_id,
            sender_id: notif.sender_id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            metadata: safeJsonParse(notif.metadata),
            created_at: notif.created_at,
            is_read: notif.is_read || false,
          });
        });
        console.log(
          `✅ [updateClass] Emitted ${notifications.length} socket notifications`
        );
      }
      return;
    } catch (error: any) {
      console.error(
        "❌ [updateClass] Error:",
        error.message || error.toString()
      );
      throw error;
    }
  }
  // ✅ Hủy lớp + gửi Notification
  static async cancelClass(
    classId: string,
    studentUserId: string,
    reason: string
  ): Promise<void> {
    try {
      const result = await ClassModel.cancelClass(
        classId,
        studentUserId,
        reason
      );
      console.log("[Cancelclass Data ]", result);
      let notifications: Notification[] = [];
      if (result.notifications) {
        try {
          if (typeof result.notifications === "string") {
            notifications = JSON.parse(result.notifications);
            console.log(
              `✅ [cancelClass] Parsed ${notifications.length} notifications`
            );
          } else if (Array.isArray(result.notifications)) {
            notifications = result.notifications;
          }
        } catch (parseError) {
          console.error(
            "❌ [cancelClass] Error parsing notifications:",
            parseError
          );
          notifications = [];
        }
      }
      console.log(
        "Dữ liệu về thông báo backend nhận được từ database:",
        notifications
      );

      // ✅ 2. Loop từng notification và emit socket

      if (
        notifications &&
        Array.isArray(notifications) &&
        notifications.length > 0
      ) {
        notifications.forEach((notif) => {
          console.log(
            `📡 [cancelClass] Emitting to user ${notif.receiver_id}, type: ${notif.type}`
          );
          socketEmitter.sendNotification(notif.receiver_id, {
            notification_id: notif.notification_id,
            receiver_id: notif.receiver_id,
            sender_id: notif.sender_id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            metadata: safeJsonParse(notif.metadata),
            created_at: notif.created_at,
            is_read: notif.is_read || false,
          });
        });
        console.log(
          `✅ [cancelClass] Emitted ${notifications.length} socket notifications`
        );
      }
      return;
    } catch (error: any) {
      console.error(
        "❌ [cancelClass] Error:",
        error.message || error.toString()
      );
      throw error;
    }
  }
  // Duyệt gia sư/ từ chối gia sư + gửi Notification
  static async reviewApplication(
    applicationId: string,
    studentUserId: string,
    action: "approve" | "reject",
    reason: string | null = null
  ): Promise<void> {
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

      console.log(`✅ [reviewApplication] returned:`, result);
      let notifications: Notification[] = [];
      if (result.notifications) {
        try {
          if (typeof result.notifications === "string") {
            notifications = JSON.parse(result.notifications);
            console.log(
              `✅ [reviewApplication] Parsed ${notifications.length} notifications`
            );
          } else if (Array.isArray(result.notifications)) {
            notifications = result.notifications;
          }
        } catch (parseError) {
          console.error(
            "❌ [reviewApplication] Error parsing notifications:",
            parseError
          );
          notifications = [];
        }
      }
      console.log(
        "Dữ liệu về thông báo backend nhận được từ database khi duyệt ứng tuyển gia sư:",
        notifications
      );
      if (
        notifications &&
        Array.isArray(notifications) &&
        notifications.length > 0
      ) {
        notifications.forEach((notif) => {
          console.log(
            `📡 [reviewApplication] Emitting to user ${notif.receiver_id}, type: ${notif.type}`
          );
          socketEmitter.sendNotification(notif.receiver_id, {
            notification_id: notif.notification_id,
            receiver_id: notif.receiver_id,
            sender_id: notif.sender_id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            metadata: safeJsonParse(notif.metadata),
            created_at: notif.created_at,
            is_read: notif.is_read || false,
          });
        });
        console.log(
          `✅ [reviewApplication] Emitted ${result.length} socket notifications`
        );
      } else {
        console.log(`ℹ️ [reviewApplication] No notifications to emit`);
      }
    } catch (error: any) {
      console.error(
        "❌ [reviewApplication] Error:",
        error.message || error.toString()
      );
      throw error;
    }
  }
}
export default ClassService;
