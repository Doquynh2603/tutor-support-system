import { Notification, NotificationType } from '../types';

/**
 * Format notification message cho display
 */
export const formatNotificationMessage = (notification: Notification): string => {
  return notification.message;
};

/**
 * Get notification icon
 */
export const getNotificationIcon = (type: NotificationType): string => {
  const icons: { [key: string]: string } = {
    TUTOR_INVITED: '📨',
    APPLICATION_APPROVED: '🎉',
    APPLICATION_REJECTED: '❌',
    CLASS_UPDATED: '📝',
    CLASS_CANCELLED: '🚫',
    CLASS_CONFIRMED_BY_TUTOR: '✅',
    CLASS_REJECTED_BY_TUTOR: '❌',
    APPLICATION_SUBMITTED: '📋',
  };
  return icons[type] || '🔔';
};

/**
 * Get notification color
 */
export const getNotificationColor = (type: NotificationType): string => {
  const colors: { [key: string]: string } = {
    TUTOR_INVITED: '#2196f3',
    APPLICATION_APPROVED: '#4caf50',
    APPLICATION_REJECTED: '#f44336',
    CLASS_UPDATED: '#ff9800',
    CLASS_CANCELLED: '#f44336',
    CLASS_CONFIRMED_BY_TUTOR: '#4caf50',
    CLASS_REJECTED_BY_TUTOR: '#f44336',
    APPLICATION_SUBMITTED: '#2196f3',
  };
  return colors[type] || '#999';
};
