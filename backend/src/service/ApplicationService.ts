import { sequelize } from "../config/sqlserver";
import { QueryTypes } from "sequelize";
import ApplicationModel from "../models/Tutor/ApplicationModel";
import socketEmitter from "../utils/socketEmitter";
import { safeJsonParse } from "../utils/safeJson";
import type { Notification } from "./NotificationService";

interface SocketNotificationPayload {
  notification_id: string;
  receiver_id: string;
  sender_id: string | null;
  type: string;
  title: string;
  message: string | null;
  metadata: Record<string, any>;
  created_at: Date | string;
  is_read: boolean;
}

interface ConfirmApplicationResponse {
  message: string;
}

interface SPConfirmResult {
  notification_id?: string;
  receiver_id?: string;
  sender_id?: string | null;
  type?: string;
  title?: string;
  message?: string | null;
  metadata?: string;
  created_at?: Date;
}

class ApplicationService {
  static async confirmApplication(
    tutorId: string,
    applicationId: string,
    isConfirmed: boolean,
    declineReason: string | null = null
  ): Promise<ConfirmApplicationResponse> {
    console.log(
      `📝 [confirmApplication] Tutor ${tutorId} confirm application ${applicationId}`
    );

    let notificationsData: SPConfirmResult[] = [];
    let responseMessage = "";

    // 🔒 PHẦN 1: DB LOGIC
    try {
      const result = await ApplicationModel.confirmApplication(
        tutorId,
        applicationId,
        isConfirmed,
        declineReason
      );

      if (!result || result.length === 0) {
        throw new Error("SP không trả về kết quả");
      }

      console.log(`✅ [confirmApplication] DB returned ${result.length} items`);
      console.log("   Full result:", JSON.stringify(result, null, 2));

      // ✅ SỬA: Separate response message từ notifications
      notificationsData = [];

      result.forEach((item, index) => {
        console.log(`   Item ${index}:`, {
          has_message: !!item.message && !item.notification_id,
          has_notification_id: !!item.notification_id,
          has_receiver_id: !!item.receiver_id,
        });

        // ✅ Item đầu tiên là response message
        if (index === 0 && item.message && !item.notification_id) {
          responseMessage = item.message;
          console.log(`   → Message response: ${responseMessage}`);
        }
        // ✅ Items còn lại là notifications
        else if (item.notification_id && item.receiver_id) {
          notificationsData.push(item);
          console.log(`   → Notification: ${item.type} to ${item.receiver_id}`);
        }
      });

      console.log(
        `✅ [confirmApplication] Extracted ${notificationsData.length} notifications`
      );
    } catch (dbError: any) {
      console.error(
        "❌ DB error in confirmApplication:",
        dbError.message || dbError.toString()
      );
      throw dbError;
    }

    // 🔔 PHẦN 2: SOCKET / SIDE EFFECT
    try {
      console.log("📤 [confirmApplication] Sending socket notifications...");

      if (notificationsData && Array.isArray(notificationsData)) {
        console.log(
          `📊 [confirmApplication] Sending ${notificationsData.length} notifications:`
        );

        notificationsData.forEach((notif, index) => {
          try {
            console.log(
              `   [${index + 1}/${
                notificationsData.length
              }] Processing notification:`
            );
            console.log(`      receiver_id: ${notif.receiver_id}`);
            console.log(`      type: ${notif.type}`);
            console.log(`      notification_id: ${notif.notification_id}`);

            if (!notif.receiver_id) {
              console.error(
                `   ❌ [${index + 1}] receiver_id is empty, skipping!`
              );
              return;
            }

            if (!notif.notification_id) {
              console.error(
                `   ❌ [${index + 1}] notification_id is empty, skipping!`
              );
              return;
            }

            const socketPayload: SocketNotificationPayload = {
              notification_id: notif.notification_id,
              receiver_id: notif.receiver_id,
              sender_id: notif.sender_id || null,
              type: notif.type || "",
              title: notif.title || "",
              message: notif.message || null,
              metadata: safeJsonParse(notif.metadata),
              created_at: notif.created_at || new Date(),
              is_read: false,
            };

            console.log(`   📡 [${index + 1}] Emitting socket...`);

            const sendResult = socketEmitter.sendNotification(
              notif.receiver_id,
              socketPayload
            );

            if (sendResult) {
              console.log(
                `   ✅ [${index + 1}] Socket sent successfully: ${notif.type}`
              );
            } else {
              console.warn(
                `   ⚠️ [${index + 1}] Socket send returned false for ${
                  notif.receiver_id
                }`
              );
            }
          } catch (notifError: any) {
            console.warn(
              `   ⚠️ Error processing notification ${index}:`,
              notifError.message
            );
          }
        });

        console.log(`✅ Sent ${notificationsData.length} socket notifications`);
      } else {
        console.warn("⚠️ [confirmApplication] No notifications data");
      }
    } catch (sideEffectError: any) {
      console.error(
        "⚠️ Socket error AFTER DB commit:",
        sideEffectError.message
      );
      // ❌ Không throw, DB đã success rồi
    }

    return {
      message:
        responseMessage ||
        (isConfirmed
          ? "Xác nhận lớp học thành công"
          : "Từ chối lời mời thành công"),
    };
  }
}

export default ApplicationService;
