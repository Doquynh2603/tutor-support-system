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
      console.log('dữ liệu thông báo chưa đọc lấy được từ backend ', response);

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
      console.log('dữ liệu tất cả thông báo lấy được từ backend ', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  },
  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiService.get<UnreadCountResponse>('/notifications/unread-count');
      return response.unreadCount || 0;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      throw error;
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
};
export default notificationAPI;
