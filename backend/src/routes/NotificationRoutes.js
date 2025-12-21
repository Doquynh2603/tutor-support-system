const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect"); // ✅ Existing
const roleCheck = require("../middlewares/roleCheck"); // ✅ Existing
const NotificationController = require("../controllers/NotificationController");

/**
 * Notification Routes
 * Tất cả routes yêu cầu xác thực (protect) và có role tutor hoặc student
 */

// ✅ Get all unread notifications
router.get(
  "/unread-count",
  protect,
  roleCheck("tutor", "student"),
  NotificationController.getUnreadCount
);
router.get(
  "/unread",
  protect,
  roleCheck("tutor", "student"),
  NotificationController.getUnreadNotifications
);

// ✅ Get all notifications (paginated)
router.get(
  "/",
  protect,
  roleCheck("tutor", "student"),
  NotificationController.getAllNotifications
);

// ✅ Get unread count

// ✅ Mark notification as read
router.put(
  "/:notificationId/read",
  protect,
  roleCheck("tutor", "student"),
  NotificationController.markAsRead
);

// ✅ Mark all as read
router.put(
  "/read-all",
  protect,
  roleCheck("tutor", "student"),
  NotificationController.markAllAsRead
);

// ✅ Delete notification
router.delete(
  "/:notificationId",
  protect,
  roleCheck("tutor", "student"),
  NotificationController.deleteNotification
);

module.exports = router;
