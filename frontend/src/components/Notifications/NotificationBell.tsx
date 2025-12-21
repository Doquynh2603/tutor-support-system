import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';
import styles from './styles/notification.module.css';

interface NotificationBellProps {
  className?: string;
  onTabChange?: (tab: string) => void; // ✅ THÊM: callback
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  onTabChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, fetchUnread, markAsRead, deleteNotification } =
    useNotifications();
  useEffect(() => {
    console.log('🔔 NotificationBell mounted/updated:', {
      onTabChangeExists: !!onTabChange,
      onTabChangeType: typeof onTabChange,
    });
  }, [onTabChange]);
  // ✅ Load notifications on mount
  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  const handleClosedropdown = () => {
    setIsOpen(false);
  };
  return (
    <div className={`${styles.notificationBell} ${className}`} ref={dropdownRef}>
      {/* ✅ Bell Button */}
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* ✅ Unread Badge */}
        {unreadCount > 0 && (
          <span className={styles.notificationBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* ✅ Dropdown */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
          onClose={() => {
            console.log('📭 Closing dropdown');
            setIsOpen(false);
          }}
          onTabChange={onTabChange} // ✅ Truyền callback xuống
        />
      )}
    </div>
  );
};

export default NotificationBell;
