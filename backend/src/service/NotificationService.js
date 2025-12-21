/**
 * Notification Business Logic Layer
 */

const { sequelize } = require("../config/sqlserver");

class NotificationService {
  /**
   * ✅ Lấy thông báo chưa đọc
   */
  static async getUnreadNotifications(userId, limit = 10, offset = 0) {
    try {
      // ✅ FIX: Convert string to number
      const limitNum = Math.max(1, parseInt(limit) || 10);
      const offsetNum = Math.max(0, parseInt(offset) || 0);

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

      const result = await sequelize.query(query, {
        replacements: {
          userId,
          limit: limitNum, // ✅ Pass number
          offset: offsetNum, // ✅ Pass number
        },
        type: sequelize.QueryTypes.SELECT,
      });

      console.log(
        `✅ [getUnreadNotifications] Found ${result.length} unread notifications`
      );
      return result;
    } catch (error) {
      console.error("❌ [getUnreadNotifications] Error:", error.message);
      throw error;
    }
  }

  /**
   * ✅ Lấy tất cả thông báo
   */
  static async getAllNotifications(userId, limit = 100, offset = 0) {
    try {
      // ✅ FIX: Convert string to number
      const limitNum = Math.max(1, parseInt(limit) || 100);
      const offsetNum = Math.max(0, parseInt(offset) || 0);

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

      const result = await sequelize.query(query, {
        replacements: {
          userId,
          offset: offsetNum, // ✅ Pass number
          limit: limitNum, // ✅ Pass number
        },
        type: sequelize.QueryTypes.SELECT,
      });

      console.log(
        `✅ [getAllNotifications] Found ${result.length} notifications`
      );
      if (result.length > 0) {
        console.log("  First notification:", result[0]);
      }
      return result;
    } catch (error) {
      console.error("❌ [getAllNotifications] Error:", error.message);
      throw error;
    }
  }

  /**
   * ✅ Lấy số lượng thông báo chưa đọc
   */
  static async getUnreadCount(userId) {
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

      const result = await sequelize.query(query, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      });

      const count = result[0]?.unreadCount || 0;
      console.log(`✅ [getUnreadCount] Count: ${count}`);
      return count;
    } catch (error) {
      console.error("❌ [getUnreadCount] Error:", error.message);
      throw error;
    }
  }

  /**
   * ✅ Đánh dấu 1 thông báo là đã đọc
   */
  static async markAsRead(notificationId, userId) {
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

      const result = await sequelize.query(query, {
        replacements: {
          notificationId,
          userId,
        },
        type: sequelize.QueryTypes.UPDATE,
      });

      console.log(
        `✅ [markAsRead] Notification ${notificationId} marked as read`
      );
      return true;
    } catch (error) {
      console.error(`❌ [markAsRead] Error:`, error.message);
      throw error;
    }
  }

  /**
   * ✅ Đánh dấu tất cả thông báo là đã đọc
   */
  static async markAllAsRead(userId) {
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

      const result = await sequelize.query(query, {
        replacements: { userId },
        type: sequelize.QueryTypes.UPDATE,
      });

      console.log(
        `✅ [markAllAsRead] All notifications for user ${userId} marked as read`
      );
      return true;
    } catch (error) {
      console.error(`❌ [markAllAsRead] Error:`, error.message);
      throw error;
    }
  }

  /**
   * ✅ Xóa thông báo
   */
  static async deleteNotification(notificationId, userId) {
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

      const result = await sequelize.query(query, {
        replacements: {
          notificationId,
          userId,
        },
        type: sequelize.QueryTypes.DELETE,
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
  static async getNotificationsByClassId(classId, types = []) {
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

      const result = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
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

module.exports = NotificationService;
