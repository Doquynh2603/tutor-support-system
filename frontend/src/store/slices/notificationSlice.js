import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    sound: true,
    desktop: true,
    email: false,
  },
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    markAsRead: (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Development helpers
    addMockNotification: (state) => {
      const mockNotifications = [
        {
          type: 'info',
          title: 'Thông báo hệ thống',
          message: 'Hệ thống đang hoạt động bình thường',
        },
        { type: 'success', title: 'Kết nối thành công', message: 'Đã kết nối với server' },
        { type: 'warning', title: 'Cảnh báo', message: 'Vui lòng kiểm tra kết nối' },
        { type: 'error', title: 'Lỗi', message: 'Không thể kết nối với cơ sở dữ liệu' },
      ];

      const randomNotification =
        mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...randomNotification,
      };

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  updateSettings,
  addMockNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
