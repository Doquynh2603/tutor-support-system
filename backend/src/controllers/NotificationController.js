/**
 * HTTP Request/Response Handler
 * - Gọi Service để lấy data
 * - Format response cho client
 */
const {
  responseFormatter,
  errorFormatter,
} = require("../utils/responseFormatter.js");
const NotificationService = require("../service/NotificationService");

class NotificationController {
  // ✅ GET /api/notifications/unread
  static async getUnreadNotifications(req, res) {
    try {
      const userId = req.user?.user_id;
      // ✅ FIX: Parse limit/offset thành number
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      console.log("📥 [getUnreadNotifications]");
      console.log("  userId:", userId);
      console.log("  limit:", limit, "type:", typeof limit);
      console.log("  offset:", offset, "type:", typeof offset);

      if (!userId) {
        return res
          .status(401)
          .json(errorFormatter("Không được phép truy cập", 401));
      }

      // ✅ Pass limit/offset correctly
      const notifications = await NotificationService.getUnreadNotifications(
        userId,
        limit,
        offset
      );

      console.log(`✅ Found ${notifications.length} unread notifications`);

      return res
        .status(200)
        .json(
          responseFormatter(
            notifications,
            "Lấy thông báo chưa đọc thành công",
            200
          )
        );
    } catch (error) {
      console.error(
        "❌ [getUnreadNotifications] Error:",
        error.message || error.toString()
      );
      return res.status(500).json(errorFormatter(error.message, 500, error));
    }
  }

  // ✅ GET /api/notifications
  static async getAllNotifications(req, res) {
    try {
      const userId = req.user?.user_id;
      // ✅ FIX: Change from page/limit to limit/offset
      // Frontend send: ?limit=100&offset=0
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      console.log("📥 [getAllNotifications]");
      console.log("  userId:", userId);
      console.log("  limit:", limit, "type:", typeof limit);
      console.log("  offset:", offset, "type:", typeof offset);

      if (!userId) {
        return res
          .status(401)
          .json(errorFormatter("Không được phép truy cập", 401));
      }

      // ✅ Pass limit/offset correctly (NOT page/limit)
      const notifications = await NotificationService.getAllNotifications(
        userId,
        limit,
        offset
      );

      console.log(`✅ Found ${notifications.length} notifications`);
      if (notifications.length > 0) {
        console.log("  First notification:", notifications[0]);
      }

      return res
        .status(200)
        .json(
          responseFormatter(
            notifications,
            "Lấy tất cả thông báo thành công",
            200
          )
        );
    } catch (error) {
      console.error(
        "❌ [getAllNotifications] Error:",
        error.message || error.toString()
      );
      return res.status(500).json(errorFormatter(error.message, 500, error));
    }
  }

  // ✅ GET /api/notifications/unread-count
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user?.user_id;

      console.log("📥 [getUnreadCount]");
      console.log("  userId:", userId);

      if (!userId) {
        return res
          .status(401)
          .json(errorFormatter("Không được phép truy cập", 401));
      }

      const count = await NotificationService.getUnreadCount(userId);

      console.log(`✅ Unread count: ${count}`);

      return res
        .status(200)
        .json(
          responseFormatter(
            { unreadCount: count },
            "Lấy số thông báo chưa đọc thành công",
            200
          )
        );
    } catch (error) {
      console.error(
        "❌ [getUnreadCount] Error:",
        error.message || error.toString()
      );
      return res.status(500).json(errorFormatter(error.message, 500, error));
    }
  }

  // ✅ PUT /api/notifications/:notificationId/read
  static async markAsRead(req, res) {
    try {
      // ✅ FIX: Use notificationId from req.params
      const { notificationId } = req.params;
      const userId = req.user?.user_id;

      console.log("📝 [markAsRead]");
      console.log("  notificationId:", notificationId);
      console.log("  userId:", userId);

      if (!notificationId) {
        console.warn("⚠️ [markAsRead] Missing notificationId in URL params");
        return res
          .status(400)
          .json(errorFormatter("notificationId is required", 400));
      }

      if (!userId) {
        return res
          .status(401)
          .json(errorFormatter("Không được phép truy cập", 401));
      }

      await NotificationService.markAsRead(notificationId, userId);

      console.log(`✅ Marked ${notificationId} as read`);

      return res
        .status(200)
        .json(responseFormatter(null, "Đánh dấu đã đọc thành công", 200));
    } catch (error) {
      console.error(
        "❌ [markAsRead] Error:",
        error.message || error.toString()
      );
      return res.status(500).json(errorFormatter(error.message, 500, error));
    }
  }

  // ✅ PUT /api/notifications/read-all
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user?.user_id;

      console.log("📝 [markAllAsRead]");
      console.log("  userId:", userId);

      if (!userId) {
        return res
          .status(401)
          .json(errorFormatter("Không được phép truy cập", 401));
      }

      await NotificationService.markAllAsRead(userId);

      console.log(`✅ Marked all notifications as read`);

      return res
        .status(200)
        .json(
          responseFormatter(null, "Đánh dấu tất cả đã đọc thành công", 200)
        );
    } catch (error) {
      console.error(
        "❌ [markAllAsRead] Error:",
        error.message || error.toString()
      );
      return res.status(500).json(errorFormatter(error.message, 500, error));
    }
  }

  // ✅ DELETE /api/notifications/:id
  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.user_id;

      console.log("🗑️ [deleteNotification]");
      console.log("  notificationId:", notificationId);
      console.log("  userId:", userId);

      if (!notificationId) {
        console.warn(
          "⚠️ [deleteNotification] Missing notificationId in URL params"
        );
        return res
          .status(400)
          .json(errorFormatter("Notification id is required", 400));
      }

      if (!userId) {
        return res
          .status(401)
          .json(errorFormatter("Không được phép truy cập", 401));
      }

      await NotificationService.deleteNotification(notificationId, userId);

      console.log(`✅ Deleted notification ${notificationId}`);

      return res
        .status(200)
        .json(responseFormatter(null, "Xóa thông báo thành công", 200));
    } catch (error) {
      console.error(
        "❌ [deleteNotification] Error:",
        error.message || error.toString()
      );
      return res.status(500).json(errorFormatter(error.message, 500, error));
    }
  }
}

module.exports = NotificationController;
