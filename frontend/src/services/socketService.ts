/**
 * File: services/socketService.ts
 * Mục đích: Service quản lý Socket.IO connection
 * Vai trò:
 *   - Singleton instance để quản lý WebSocket connection
 *   - Wrapper methods cho Socket.IO events
 * Lưu ý:
 *   - Chỉ có 1 socket connection trong toàn app (singleton pattern)
 *   - Cần gọi connect() trước khi sử dụng
 *   - Nhớ removeAllListeners() khi component unmount để tránh memory leaks
 *   - Socket URL lấy từ env variable VITE_SOCKET_URL
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  /**
   * Khởi tạo kết nối Socket.IO
   * @returns Socket instance
   */
  connect(token?: string, userId?: string, userRole?: string) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token || localStorage.getItem('token'),
          userId: userId || localStorage.getItem('userId'),
          userRole: userRole || localStorage.getItem('userRole') || 'student',
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.setupListeners();
    }
    return this.socket;
  }
  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
    this.socket.on('authenticated', (data) => {
      console.log('✅ [Socket] Authenticated:', data);
    });
  }
  /**
   * Ngắt kết nối Socket.IO
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Lấy socket instance
   */
  getSocket() {
    return this.socket;
  }
  /**
   * ✅ NEW: Lắng nghe thông báo mới
   */
  onNewNotification(callback: (data: any) => void) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.on('notification:new', (data) => {
      console.log('📬 New notification received:', data);
      callback(data);
    });
  }

  /**
   * ✅ NEW: Emit notification read event
   */
  emitNotificationRead(notificationId: string) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('notification:read', notificationId, (response: any) => {
      console.log('✅ Notification marked as read:', response);
    });
  }
  /**
   * ✅ NEW: Request unread count
   */
  requestUnreadCount() {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('notification:unread-count', (response: any) => {
      console.log('✅ Unread count:', response);
      return response;
    });
  }

  /**
   * ✅ NEW: Remove notification listener
   */
  removeNotificationListener() {
    if (this.socket) {
      this.socket.off('notification:new');
    }
  }

  /**
   * Tham gia một room
   */
  joinRoom(roomId: string) {
    this.socket?.emit('join-room', roomId);
  }

  /**
   * Rời khỏi một room
   */
  leaveRoom(roomId: string) {
    this.socket?.emit('leave-room', roomId);
  }

  /**
   * Gửi tin nhắn chat
   */
  sendMessage(roomId: string, message: string) {
    this.socket?.emit('chat-message', { roomId, message });
  }

  /**
   * Lắng nghe tin nhắn chat
   */
  onMessage(callback: (data: { userId: string; message: string; timestamp: string }) => void) {
    this.socket?.on('chat-message', callback);
  }

  /**
   * Xóa tất cả listeners (gọi khi component unmount)
   */
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

// Export singleton instance
export default new SocketService();
