const { safeJsonParse } = require("../utils/safeJson");
const ApplicationModel = require("../models/Tutor/ApplicationModel");
const socketEmitter = require("../utils/socketEmitter");

class ApplicationService {
  // gia sư đồng ý/từ chối lớp học + gửi Notification
  static async confirmApplication(
    tutorId,
    applicationId,
    isConfirmed,
    declineReason
  ) {
    console.log(
      `📝 [confirmApplication] Tutor ${tutorId} confirm application ${applicationId}`
    );

    let notifications;

    // 🔒 PHẦN 1: DB LOGIC (BẮT BUỘC THROW NẾU LỖI)
    try {
      notifications = await ApplicationModel.confirmApplication(
        tutorId,
        applicationId,
        isConfirmed,
        declineReason
      );
    } catch (dbError) {
      console.error("❌ DB error in confirmApplication:", dbError.message);
      throw dbError; // ❗ BẮT BUỘC
    }

    // 🔔 PHẦN 2: SOCKET / SIDE EFFECT (KHÔNG ĐƯỢC THROW)
    try {
      if (notifications && notifications.length > 0) {
        const notificationsList = notifications.filter(
          (notif) => notif.notification_id
        );
        notificationsList.forEach((notif) => {
          socketEmitter.sendNotification(notif.receiver_id, {
            notification_id: notif.notification_id,
            receiver_id: notif.receiver_id,
            sender_id: notif.sender_id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            metadata: safeJsonParse(notif.metadata),
            created_at: notif.created_at,
            is_read: false,
          });
        });
        console.log(`✅ Sent ${notificationsList.length} socket notifications`);
      }
    } catch (sideEffectError) {
      console.error(
        "⚠️ Socket failed AFTER DB commit:",
        sideEffectError.message
      );
    }

    return {
      message: isConfirmed
        ? "Xác nhận lớp học thành công"
        : "Từ chối lời mời thành công",
    };
  }
}
module.exports = ApplicationService;
