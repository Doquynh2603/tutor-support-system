import React from 'react';
import { Notification } from '../../types';
import styles from './styles/notification.module.css';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
  onTabChange?: (tab: string) => void;
  onNavigate?: (path: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onDelete,
  onTabChange,
  onNavigate,
}) => {
  /**
   * Get icon based on type
   */
  const getIcon = () => {
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
    return icons[notification.type] || '🔔';
  };

  /**
   * Format time
   */
  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}m trước`;
    if (hours < 24) return `${hours}h trước`;
    if (days < 7) return `${days}d trước`;

    return notifDate.toLocaleDateString('vi-VN');
  };
  const handleClick = () => {
    console.log('📬 Click notification:', {
      type: notification.type,
      metadata: notification.metadata,
    });

    try {
      let metadata = notification.metadata;
      if (typeof metadata === 'string') {
        metadata = JSON.parse(metadata);
        console.log('📝 Parsed metadata:', metadata);
      }

      console.log('🔍 Metadata:', metadata);
      // ✅ Kiểm tra metadata có targetPage không
      if (metadata?.tab) {
        sessionStorage.setItem('targetTab', String(metadata.tab));
        console.log('💾 Lưu targetTab:', metadata.tab);
      }

      // ✅ THÊM: Lưu targetFilter (cho ManageClassesPage)
      if (metadata?.targetFilter) {
        sessionStorage.setItem('targetFilter', String(metadata.targetFilter));
        console.log('💾 Lưu targetFilter:', metadata.targetFilter);
      }

      // ✅ Kiểm tra metadata có targetPage không
      if (metadata?.targetPage) {
        console.log('🎯 targetPage:', metadata.targetPage);

        const fullPath = `?tab=${metadata.targetPage}`;

        console.log('🎯 targetPage:', metadata.targetPage);
        console.log('📊 filter (metadata.tab):', metadata.tab);
        console.log('🚀 fullPath:', fullPath);

        // ✅ Ưu tiên onNavigate
        if (onNavigate) {
          console.log('📍 Gọi onNavigate:', fullPath);
          onNavigate(fullPath);
        }
        // ✅ Chuyển tab
        else if (onTabChange) {
          console.log('📍 Chuyển sang tab:', metadata.targetPage);
          onTabChange(metadata.targetPage);
        } else {
          console.warn('⚠️ Không có targetPage trong metadata');
        }
      }

      // ✅ Gọi onClick callback nếu có
      onClick?.();
    } catch (error) {
      console.error('❌ Lỗi khi xử lý notification:', error);
      onClick?.();
    }
  };
  return (
    <div
      className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={styles.icon}>{getIcon()}</div>

      {/* Content */}
      <div className={styles.content}>
        <h4 className={styles.title}>{notification.title}</h4>
        <p className={styles.message}>{notification.message}</p>
        <span className={styles.time}>{formatTime(notification.created_at)}</span>
      </div>

      {/* Delete Button */}
      <button
        className={styles.deleteBtn}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete"
      >
        ✕
      </button>

      {/* Unread Indicator */}
      {!notification.is_read && <div className={styles.unreadDot} />}
    </div>
  );
};

export default NotificationItem;
