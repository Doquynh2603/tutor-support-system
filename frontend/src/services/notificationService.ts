import { GetNotificationsResponse, UnreadCountResponse } from '@/types';
import { apiService } from './api';

export const notificationAPI = {
  /**
   * Lấy thông báo chưa đọc
   */
  getUnReadNotifications: async (limit: number = 10, offset: number = 0) => {
    try {
      const response = await apiService.get<GetNotificationsResponse>('/notifications/unread', {
        limit,
        offset,
      });
      console.log('✅ Unread notifications fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching unread notifications:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả thông báo (phân trang)
   */
  getAllNotifications: async (limit: number = 100, offset: number = 0) => {
    try {
      const response = await apiService.get<GetNotificationsResponse>('/notifications', {
        limit,
        offset,
      });
      console.log('✅ All notifications fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * ✅ SỬA: Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      const response = await apiService.get<UnreadCountResponse>('/notifications/unread-count');

      console.log('✅ Unread count response:', response);

      // ✅ Xử lý response từ API
      if (response && response.data) {
        // Nếu response.data là number
        if (typeof response.data === 'number') {
          return { count: response.data };
        }
        // Nếu response.data là object có property count
        if (response.data.count !== undefined) {
          return { count: response.data.count };
        }
        // Nếu response.data là object có property unreadCount
        if (response.data.count !== undefined) {
          return { count: response.data.count };
        }
      }

      // ✅ Fallback: return 0
      console.warn('⚠️ Could not parse unread count, returning 0');
      return { count: 0 };
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      // ✅ Không throw, return fallback value
      return { count: 0 };
    }
  },

  /**
   * Đánh dấu notification là đã đọc
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await apiService.put(`/notifications/${notificationId}/read`);
      console.log(`✅ Marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await apiService.put('/notifications/read-all');
      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Xóa notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await apiService.delete(`/notifications/${notificationId}`);
      console.log(`✅ Deleted notification ${notificationId}`);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * ✅ THÊM: Xóa tất cả notifications
   */
  deleteAllNotifications: async (): Promise<void> => {
    try {
      await apiService.delete('/notifications/all');
      console.log('✅ Deleted all notifications');
    } catch (error) {
      console.error('❌ Error deleting all notifications:', error);
      throw error;
    }
  },
};

export default notificationAPI;
