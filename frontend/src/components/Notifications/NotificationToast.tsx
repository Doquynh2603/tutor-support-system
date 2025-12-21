import React, { useEffect } from 'react';
import styles from './styles/notification.module.css';

interface NotificationToastProps {
  notification: any;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    const icons: { [key: string]: string } = {
      TUTOR_INVITED: '📨',
      APPLICATION_APPROVED: '🎉',
      APPLICATION_REJECTED: '❌',
      CLASS_UPDATED: '📝',
      CLASS_CANCELLED: '🚫',
      CLASS_CONFIRMED_BY_TUTOR: '✅',
      CLASS_REJECTED_BY_TUTOR: '❌',
    };
    return icons[notification.type] || '🔔';
  };

  return (
    <div className={styles.toast}>
      <span className={styles.toastIcon}>{getIcon()}</span>
      <div className={styles.toastContent}>
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
      </div>
      <button className={styles.toastClose} onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default NotificationToast;
