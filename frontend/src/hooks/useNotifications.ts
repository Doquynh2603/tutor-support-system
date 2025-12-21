import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchAllNotifications,
  fetchUnreadNotifications,
  fetchUnreadCount,
  markAsReadAsync,
  markAllAsReadAsync,
  deleteNotificationAsync,
  addNotificationFromSocket,
} from '../store/slices/notificationSlice';
import { useCallback } from 'react';

/**
 * Custom hook để quản lý notifications
 */
export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isLoading, error } = useSelector(
    (state: RootState) => state.notification
  );
  const fetchAll = useCallback(() => {
    console.log('📥 [Hook] Fetching all notifications');
    dispatch(fetchAllNotifications());
  }, [dispatch]);
  /**
   * Fetch unread notifications
   */
  const fetchUnread = useCallback(() => {
    dispatch(fetchUnreadNotifications());
  }, [dispatch]);

  /**
   * Fetch unread count
   */
  const fetchCount = useCallback(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  /**
   * Mark as read
   */
  const markAsRead = useCallback(
    (notificationId: string) => {
      dispatch(markAsReadAsync(notificationId));
    },
    [dispatch]
  );

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(() => {
    dispatch(markAllAsReadAsync());
  }, [dispatch]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    (notificationId: string) => {
      dispatch(deleteNotificationAsync(notificationId));
    },
    [dispatch]
  );

  /**
   * Add notification from socket (local update)
   */
  const addNotification = useCallback(
    (notification) => {
      dispatch(addNotificationFromSocket(notification));
    },
    [dispatch]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchAll,
    fetchUnread,
    fetchCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
};

export default useNotifications;
