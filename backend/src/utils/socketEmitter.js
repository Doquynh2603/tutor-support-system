/**
 * Socket.IO Event Emitter
 * Gửi notification real-time tới users
 */

const { create } = require("../models/User");

class SocketEmitter {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize io instance từ server.js
   */
  setIO(io) {
    this.io = io;
    console.log("✅ Socket.IO initialized in SocketEmitter");
  }

  /**
   * ✅ Check if io is initialized
   */
  isInitialized() {
    return this.io !== null;
  }

  /**
   * ✅ Send notification to specific user
   * @param {string} receiverId - User ID của người nhận
   * @param {object} data - Notification data { type, title, message, classId, ... }
   */
  sendNotification(receiverId, data) {
    try {
      // Kiểm tra io đã initialized
      if (!this.io) {
        console.error("❌ Socket.IO not initialized in SocketEmitter");
        return false;
      }

      // Kiểm tra receiverId
      if (!receiverId) {
        console.error("❌ receiverId is required");
        return false;
      }

      // ✅ Tự động tạo notification object đầy đủ
      const notification = {
        notification_id: data.notification_id || require("uuid").v4(),
        receiver_id: receiverId,
        sender_id: data.sender_id || null,
        type: data.type || "UNKNOWN",
        title: data.title || "Thông báo",
        message: data.message || "",
        metadata: {
          classId: data.classId,
          applicationId: data.applicationId,
          reason: data.reason,
          ...data.metadata,
        },
        created_at: data.created_at,
        timestamp: new Date().toISOString(),
      };

      // ✅ Emit đến user cụ thể thông qua room
      const userRoom = `user_${receiverId}`;
      this.io.to(userRoom).emit("notification", notification);
      // if (data.type) {
      //   this.io.to(userRoom).emit(data.type, notification);
      // }
      console.log(`✅ Socket notification sent to ${userRoom}: ${data.type}`);
      return true;
    } catch (error) {
      console.error(
        `❌ Error sending socket notification to user_${receiverId}:`,
        error.message || error.toString()
      );
      return false;
    }
  }

  /**
   * ✅ Broadcast notification to room
   */
  broadcastNotification(room, data) {
    try {
      if (!this.io) {
        console.error("❌ Socket.IO not initialized");
        return false;
      }

      this.io.to(room).emit("notification", {
        notification_id: require("uuid").v4(),
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Broadcast notification to room ${room}`);
      return true;
    } catch (error) {
      console.error("❌ Error broadcasting notification:", error.message);
      return false;
    }
  }

  /**
   * ✅ Send notification to multiple users
   */
  sendToMultipleUsers(userIds, data) {
    try {
      if (!this.io) {
        console.error("❌ Socket.IO not initialized");
        return false;
      }

      if (!Array.isArray(userIds)) {
        console.error("❌ userIds must be an array");
        return false;
      }

      let sentCount = 0;
      userIds.forEach((userId) => {
        if (this.sendNotification(userId, data)) {
          sentCount++;
        }
      });

      console.log(
        `✅ Sent notification to ${sentCount}/${userIds.length} users`
      );
      return true;
    } catch (error) {
      console.error("❌ Error sending to multiple users:", error.message);
      return false;
    }
  }
}

// ✅ Export singleton instance
module.exports = new SocketEmitter();
