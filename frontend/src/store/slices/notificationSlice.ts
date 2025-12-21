import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationState } from '../../types';
import notificationAPI from '../../services/notificationService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const buildMessageFromMetadata = (notification: Notification): string => {
  const { type, message, metadata } = notification;

  // Nếu message đã chi tiết, dùng message
  if (message && message.trim().length > 0) {
    return message;
  }

  // Nếu message generic, build từ metadata
  const className = metadata?.className || 'lớp học';
  const reason = metadata?.reason || 'không rõ lý do';
  switch (type) {
    case 'CLASS_UPDATED':
      return `Lớp ${className} đã được cập nhật thông tin mới`;

    case 'CLASS_CONFIRMED_BY_TUTOR':
      return `Gia sư đã xác nhận sẵn sàng dạy lớp: ${className}`;

    case 'CLASS_REJECTED_BY_TUTOR':
      return `Gia sư từ chối lớp ${className}. Lý do: ${reason}`;

    case 'APPLICATION_APPROVED_BY_STUDENT':
      return `Phụ huynh đã chấp nhận ứng tuyển cho lớp: ${className}`;

    case 'APPLICATION_REJECTED_BY_STUDENT':
      return `Phụ huynh từ chối ứng tuyển. Lớp: ${className}. Lý do: ${reason}`;

    case 'APPLICATION_AUTO_REJECTED_BY_SYSTEM':
      return `Lớp ${className} đã được gia sư khác xác nhận. Ứng tuyển của bạn bị từ chối.`;

    case 'TUTOR_INVITED':
      return `Bạn được mời dạy lớp: ${className}`;

    case 'CLASS_CANCELLED':
      return `Lớp ${className} đã bị hủy.`;

    default:
      return message || 'Bạn có thông báo mới';
  }
};

const formatTimeUTC = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return dayjs.utc(dateString).format('DD/MM/YYYY HH:mm');
  } catch (error) {
    console.error('❌ Error formatting time:', error);
    return dateString || '';
  }
};

const enrichNotification = (notification: Notification): Notification => {
  return {
    ...notification,
    // ✅ Ensure message luôn chi tiết
    message: buildMessageFromMetadata(notification),
    // ✅ Ensure metadata là object
    metadata: notification.metadata || {},
    // ✅ Ensure created_at có giá trị
    created_at: notification.created_at || new Date().toISOString(),
    // ✅ Ensure is_read
    is_read: notification.is_read || false,
  };
};
// ✅ Async thunks
export const fetchAllNotifications = createAsyncThunk(
  'notification/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 [Redux] fetchAllNotifications - calling API');

      // Service return: { success, data: Array(9), message, statusCode, ... }
      const response = await notificationAPI.getAllNotifications(100, 0);

      console.log('✅ [Redux] Service response:', response);

      // ✅ FIX: Extract data array từ response object
      const notifications = Array.isArray(response)
        ? response // ✅ response.data = Array(4)
        : [];

      console.log('✅ [Redux] Extracted notifications:', notifications);

      return notifications;
    } catch (error: any) {
      console.error('❌ [Redux] fetchAllNotifications error:', error);
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notification/fetchUnread',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 [Redux] fetchUnreadNotifications - calling API');

      const response = await notificationAPI.getUnReadNotifications(20, 0);

      console.log('✅ [Redux] Service response:', response);

      // ✅ FIX: Extract data array
      const notifications = Array.isArray(response?.data) ? response.data : [];

      console.log('✅ [Redux] Extracted unread notifications:', notifications);

      return notifications;
    } catch (error: any) {
      console.error('❌ [Redux] fetchUnreadNotifications error:', error);
      return rejectWithValue(error.message || 'Failed to fetch unread notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 [Redux] fetchUnreadCount - calling API');

      const count = await notificationAPI.getUnreadCount();

      console.log('✅ [Redux] Unread count:', count);

      return count;
    } catch (error: any) {
      console.error('❌ [Redux] fetchUnreadCount error:', error);
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsReadAsync = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsReadAsync = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationAPI.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotificationAsync = createAsyncThunk(
  'notification/delete',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// ✅ Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotificationFromSocket: (state, action: PayloadAction<Notification>) => {
      const enrichedNotification = enrichNotification(action.payload);

      console.log('📬 [Redux] Adding notification from Socket:', {
        type: enrichedNotification.type,
        title: enrichedNotification.title,
        message: enrichedNotification.message,
        metadata: enrichedNotification.metadata,
        created_at: enrichedNotification.created_at,
      });

      state.notifications.unshift(enrichedNotification);

      if (!enrichedNotification.is_read) {
        state.unreadCount += 1;
      }
    },
    markAsReadLocal: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.notification_id === action.payload);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    deleteLocal: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n.notification_id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    clearAll: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch all notifications
    builder
      .addCase(fetchAllNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        // ✅ Enrich tất cả notifications từ API
        const enrichedNotifications = action.payload.map(enrichNotification);

        console.log('✅ [Redux] Setting notifications state:', enrichedNotifications);

        state.notifications = enrichedNotifications;
        state.unreadCount = enrichedNotifications.filter((n: Notification) => !n.is_read).length;
        state.isLoading = false;
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unread
    builder
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        // ✅ Enrich tất cả unread notifications
        const enrichedNotifications = action.payload.map(enrichNotification);

        state.notifications = enrichedNotifications;
        state.unreadCount = enrichedNotifications.filter((n: Notification) => !n.is_read).length;
        state.isLoading = false;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markAsReadAsync.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.notification_id === action.payload);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsReadAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark all as read
    builder
      .addCase(markAllAsReadAsync.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.is_read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsReadAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(deleteNotificationAsync.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.notification_id === action.payload);
        if (index !== -1) {
          const notification = state.notifications[index];
          if (!notification.is_read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
        }
      })
      .addCase(deleteNotificationAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { addNotificationFromSocket, markAsReadLocal, deleteLocal, clearAll } =
  notificationSlice.actions;

export default notificationSlice.reducer;
