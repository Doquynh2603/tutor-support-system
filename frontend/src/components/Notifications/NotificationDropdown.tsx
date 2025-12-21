import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';
import NotificationItem from './NotificationItem';
import styles from './styles/notification.module.css';
import { highlightAndExpand } from '../../utils/highlightUtils';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onTabChange?: (tab: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onDelete,
  onClose,
  onTabChange,
}) => {
  const navigate = useNavigate();

  /**
   * Handle notification click
   */
  const handleNotificationClick = (notification: Notification) => {
    console.log('📬 NotificationDropdown handleNotificationClick:', {
      type: notification.type,
      metadata: notification.metadata,
      onTabChangeExists: !!onTabChange,
    });

    try {
      let metadata = notification.metadata;

      // ✅ Parse metadata nếu là string
      if (typeof metadata === 'string') {
        metadata = JSON.parse(metadata);
        console.log('📝 Parsed metadata:', metadata);
      }

      console.log('🔍 Metadata sau parse:', metadata);

      // ✅ Mark as read
      onMarkAsRead(notification.notification_id);

      // ✅ Kiểm tra metadata có targetPage không
      if (metadata?.targetPage) {
        console.log('✅ Có targetPage:', metadata.targetPage);

        // ✅ THÊM: Lưu targetTab (cho ManageApplicationsPage hoặc ManageClassesPage)
        if (metadata.tab) {
          sessionStorage.setItem('targetTab', String(metadata.tab));
          console.log('💾 Lưu targetTab:', metadata.tab);
        }

        // ✅ THÊM: Lưu targetFilter (cho ManageClassesPage)
        if (metadata.targetFilter) {
          sessionStorage.setItem('targetFilter', String(metadata.targetFilter));
          console.log('💾 Lưu targetFilter:', metadata.targetFilter);
        }

        // ✅ FIX: Đóng dropdown TRƯỚC khi chuyển tab để tránh race condition
        onClose();

        // ✅ Chuyển tab
        if (onTabChange) {
          console.log('📍 Gọi onTabChange với tab:', metadata.targetPage);
          onTabChange(metadata.targetPage);
        } else {
          console.warn('⚠️ onTabChange không có!');
        }
      } else {
        console.warn('⚠️ Không có targetPage trong metadata');
        onClose();
      }
    } catch (error) {
      console.error('❌ Lỗi khi xử lý notification:', error);
      onClose();
    }
  };
  return (
    <div className={styles.dropdown}>
      {/* Header */}
      <div className={styles.dropdownHeader}>
        <h3>Thông báo {unreadCount > 0 && `(${unreadCount})`}</h3>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // ✅ SỬA: Chuyển sang tab notifications thay vì navigate
            if (onTabChange) {
              onTabChange('notifications');
            }
            onClose();
          }}
          className={styles.viewAll}
        >
          Xem tất cả
        </a>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className={styles.notificationsList}>
          {notifications.slice(0, 5).map((notification) => (
            <NotificationItem
              key={notification.notification_id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
              onDelete={() => onDelete(notification.notification_id)}
              onTabChange={onTabChange}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Không có thông báo nào</p>
        </div>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <div className={styles.dropdownFooter}>
          <button
            className={styles.markAllRead}
            onClick={(e) => {
              e.preventDefault();
              // ✅ TODO: Implement mark all as read
              console.log('🔔 Mark all as read');
            }}
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
