/**
 * Notification Business Logic Layer
 */

import { sequelize } from "../config/sqlserver";
import { QueryTypes } from "sequelize";

// ✅ Khớp với Table [dbo].[Notifications]
export interface Notification {
  notification_id: string; // UNIQUEIDENTIFIER
  receiver_id: string; // UNIQUEIDENTIFIER
  sender_id: string | null; // UNIQUEIDENTIFIER NULL
  type: string; // VARCHAR(100) - VD: 'TUTOR_INVITED', 'CLASS_UPDATED'
  title: string; // NVARCHAR(255)
  message: string | null; // NVARCHAR(1000) NULL
  metadata: string | null; // NVARCHAR(MAX) NULL - JSON string
  is_read: boolean; // BIT
  read_at: Date | null; // DATETIME2(7) NULL
  created_at: Date; // DATETIME2(7)
  updated_at: Date; // DATETIME2(7)
}

export interface NotificationWithMetadata extends Notification {
  metadata_parsed?: Record<string, any>;
}

export interface UnreadCountResult {
  unreadCount: number;
}

class NotificationService {
  /**
   * ✅ Lấy thông báo chưa đọc
   */
  static async getUnreadNotifications(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Notification[]> {
    try {
      // ✅ FIX: Convert string to number
      const limitNum = Math.max(1, parseInt(limit.toString()) || 10);
      const offsetNum = Math.max(0, parseInt(offset.toString()) || 0);

      console.log("📥 [getUnreadNotifications] Service");
      console.log("  userId:", userId);
      console.log("  limitNum:", limitNum, "type:", typeof limitNum);
      console.log("  offsetNum:", offsetNum, "type:", typeof offsetNum);

      const query = `
        SELECT *
        FROM Notifications
        WHERE receiver_id = :userId AND is_read = 0
        ORDER BY created_at DESC
        OFFSET :offset ROWS
        FETCH NEXT :limit ROWS ONLY
      `;

      console.log("  Executing SQL with replacements:", {
        userId,
        limit: limitNum,
        offset: offsetNum,
      });

      const result = await sequelize.query<Notification>(query, {
        replacements: {
          userId,
          limit: limitNum, // ✅ Pass number
          offset: offsetNum, // ✅ Pass number
        },
        type: QueryTypes.SELECT,
      });

      console.log(
        `✅ [getUnreadNotifications] Found ${result.length} unread notifications`
      );
      return result;
    } catch (error: any) {
      console.error("❌ [getUnreadNotifications] Error:", error.message);
      throw error;
    }
  }

  /**
   * ✅ Lấy tất cả thông báo
   */
  static async getAllNotifications(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ) {
    try {
      // ✅ FIX: Convert string to number
      const limitNum = Math.max(1, parseInt(limit.toString()) || 100);
      const offsetNum = Math.max(0, parseInt(offset.toString()) || 0);

      console.log("📥 [getAllNotifications] Service");
      console.log("  userId:", userId);
      console.log("  limitNum:", limitNum, "type:", typeof limitNum);
      console.log("  offsetNum:", offsetNum, "type:", typeof offsetNum);

      const query = `
        SELECT * FROM Notifications
        WHERE receiver_id = :userId
        ORDER BY created_at DESC
        OFFSET :offset ROWS
        FETCH NEXT :limit ROWS ONLY
      `;

      console.log("  Executing SQL with replacements:", {
        userId,
        limit: limitNum,
        offset: offsetNum,
      });

      const result = await sequelize.query<Notification>(query, {
        replacements: {
          userId,
          offset: offsetNum, // ✅ Pass number
          limit: limitNum, // ✅ Pass number
        },
        type: QueryTypes.SELECT,
      });

      console.log(
        `✅ [getAllNotifications] Found ${result.length} notifications`
      );
      if (result.length > 0) {
        console.log("  First notification:", result[0]);
      }
      return result;
    } catch (error: any) {
      console.error("❌ [getAllNotifications] Error:", error.message);
      throw error;
    }
  }

  /**
   * ✅ Lấy số lượng thông báo chưa đọc
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      if (!userId) {
        throw new Error("userId is required");
      }

      console.log("📥 [getUnreadCount] Service");
      console.log("  userId:", userId);

      const query = `
        SELECT COUNT(*) AS unreadCount
        FROM Notifications
        WHERE receiver_id = :userId AND is_read = 0
      `;

      const result = await sequelize.query<UnreadCountResult>(query, {
        replacements: { userId },
        type: QueryTypes.SELECT,
      });

      const count = result[0]?.unreadCount || 0;
      console.log(`✅ [getUnreadCount] Count: ${count}`);
      return count;
    } catch (error: any) {
      console.error("❌ [getUnreadCount] Error:", error.message);
      throw error;
    }
  }

  /**
   * ✅ Đánh dấu 1 thông báo là đã đọc
   */
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      if (!notificationId || !userId) {
        console.warn("⚠️ [markAsRead] Missing notificationId or userId");
        throw new Error("notificationId and userId are required");
      }

      console.log("📝 [markAsRead] Service");
      console.log("  notificationId:", notificationId);
      console.log("  userId:", userId);

      const query = `
        UPDATE Notifications
        SET is_read = 1, read_at = SYSDATETIME()
        WHERE notification_id = :notificationId AND receiver_id = :userId
      `;

      await sequelize.query(query, {
        replacements: {
          notificationId,
          userId,
        },
        type: QueryTypes.UPDATE,
      });

      console.log(
        `✅ [markAsRead] Notification ${notificationId} marked as read`
      );
      return true;
    } catch (error: any) {
      console.error(`❌ [markAsRead] Error:`, error.message);
      throw error;
    }
  }

  /**
   * ✅ Đánh dấu tất cả thông báo là đã đọc
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        throw new Error("userId is required");
      }

      console.log("📝 [markAllAsRead] Service");
      console.log("  userId:", userId);

      const query = `
        UPDATE Notifications
        SET is_read = 1, read_at = SYSDATETIME()
        WHERE receiver_id = :userId AND is_read = 0
      `;

      await sequelize.query(query, {
        replacements: { userId },
        type: QueryTypes.UPDATE,
      });

      console.log(
        `✅ [markAllAsRead] All notifications for user ${userId} marked as read`
      );
      return true;
    } catch (error: any) {
      console.error(`❌ [markAllAsRead] Error:`, error.message);
      throw error;
    }
  }

  /**
   * ✅ Xóa thông báo
   */
  static async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      if (!notificationId || !userId) {
        throw new Error("notificationId and userId are required");
      }

      console.log("🗑️ [deleteNotification] Service");
      console.log("  notificationId:", notificationId);
      console.log("  userId:", userId);

      const query = `
        DELETE FROM Notifications
        WHERE notification_id = :notificationId AND receiver_id = :userId
      `;

      await sequelize.query(query, {
        replacements: {
          notificationId,
          userId,
        },
        type: QueryTypes.DELETE,
      });

      console.log(
        `✅ [deleteNotification] Notification ${notificationId} deleted`
      );
      return true;
    } catch (error) {
      console.error(`❌ [deleteNotification] Error:`, error.message);
      throw error;
    }
  }

  /**
   * ✅ Lấy thông báo của 1 lớp
   */
  static async getNotificationsByClassId(
    classId: string,
    types: string[] = []
  ): Promise<Notification[]> {
    try {
      if (!classId) {
        throw new Error("classId is required");
      }

      console.log("📥 [getNotificationsByClassId] Service");
      console.log("  classId:", classId);
      console.log("  types:", types);

      let query = `
        SELECT notification_id, receiver_id, type, metadata
        FROM Notifications
        WHERE metadata LIKE :classId
      `;

      if (types.length > 0) {
        const typePlaceholders = types.map((_, i) => `:type${i}`).join(",");
        query += ` AND type IN (${typePlaceholders})`;
      }

      const replacements = { classId: `%${classId}%` };
      types.forEach((type, i) => {
        replacements[`type${i}`] = type;
      });

      const result = await sequelize.query<Notification>(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      console.log(
        `✅ [getNotificationsByClassId] Found ${result.length} notifications for class ${classId}`
      );
      return result;
    } catch (error) {
      console.error(`❌ [getNotificationsByClassId] Error:`, error.message);
      throw error;
    }
  }
}

export default NotificationService;
