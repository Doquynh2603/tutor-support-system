/**
 * Socket.IO Event Emitter
 * Gửi notification real-time tới users
 */
import { log } from "node:console";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

interface NotificationData {
  notification_id?: string;
  receiver_id?: string;
  sender_id?: string | null;
  type?: string;
  title?: string;
  message?: string | null;
  metadata?: any;
  created_at?: string | Date;
  is_read?: boolean;
}
class SocketEmitter {
  private io: Server | null;

  /**
   * Initialize io instance từ server.js
   */
  public setIO(io: Server): void {
    this.io = io;
    console.log("✅ Socket.IO initialized in SocketEmitter");
  }
  /**
   * ✅ Check if io is initialized
   */
  /**
   * ✅ Send notification to specific user
   * @param {string} receiverId - User ID của người nhận
   * @param {object} data - Notification data { type, title, message, classId, ... }
   */
  public sendNotification(receiverId: string, data: NotificationData): boolean {
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
        notification_id: data.notification_id || uuidv4(),
        receiver_id: receiverId,
        sender_id: data.sender_id || null,
        type: data.type || "UNKNOWN",
        title: data.title || "Thông báo",
        message: data.message || "",
        metadata: data.metadata || {},
        created_at: data.created_at,
        is_read: data.is_read || false,
        timestamp: new Date().toISOString(),
      };

      // ✅ Emit đến user cụ thể thông qua room
      const userRoom = `user_${receiverId}`;
      console.log(`📡 [sendNotification] Emitting to room: ${userRoom}`);
      console.log(`   Type: ${data.type}`);
      console.log(`   Title: ${data.title}`);
      this.io.to(userRoom).emit("notification", notification);
      console.log(`✅ [sendNotification] Sent to ${userRoom}: ${data.type}`);
      console.log(`   ID: ${notification.notification_id}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Title: ${notification.title}`);
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
   * ✅ emitToUser - Emit ping notification (nhẹ)
   * Dùng khi không cần gửi full data
   */
  public emitToUser(
    userId: string,
    eventName: string,
    notificationData: {
      type: string;
      classId?: string;
      applicationId?: string;
      message?: string;
      [key: string]: any;
    }
  ): void {
    if (!this.io) {
      console.warn("⚠️ Socket.IO not initialized");
      return;
    }

    const socketId = `user_${userId}`;
    console.log(
      `📡 [emitToUser] Emitting to ${socketId}:`,
      notificationData.type
    );

    this.io.to(socketId).emit(eventName, {
      type: notificationData.type,
      classId: notificationData.classId || null,
      applicationId: notificationData.applicationId || null,
      message: notificationData.message || null,
      timestamp: new Date().toISOString(),
    });
  }
  /**
   * ✅ Broadcast notification to room
   */
  public broadcastNotification(room: string, data: NotificationData): boolean {
    try {
      if (!this.io) {
        console.error("❌ Socket.IO not initialized");
        return false;
      }

      this.io.to(room).emit("notification", {
        notification_id: uuidv4(),
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
  public sendToMultipleUsers(
    userIds: string[],
    data: NotificationData
  ): boolean {
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
  isInitialized(): boolean {
    if (!this.io) {
      console.error("❌ [isInitialized] Socket.IO not initialized!");
      return false;
    }
    return true;
  }

  /**
   * ✅ Get IO instance
   */
  getIO(): Server | null {
    return this.io;
  }
}

// ✅ Export singleton instance
export default new SocketEmitter();
