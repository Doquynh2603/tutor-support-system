import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom'; // ✅ THÊM
import NotificationItem from './NotificationItem'; // ✅ THÊM
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface NotificationSectionProps {
  onTabChange?: (tab: string) => void;
}

const NotificationsSection: React.FC<NotificationSectionProps> = ({ onTabChange }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchAll,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications();

  const navigate = useNavigate(); // ✅ THÊM
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div className="max-w-4xl">
      {/* Filter Tabs and Button */}
      <div className="flex justify-between items-center mb-6 gap-4 bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded transition-colors font-medium ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded transition-colors font-medium ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>
        <button
          onClick={markAllAsRead}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors font-medium"
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">Đang tải...</p>
        </div>
      )}

      {/* ✅ SỬA: Dùng NotificationItem thay vì div wrapper */}
      {!isLoading && filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.notification_id}
              notification={notification}
              // ✅ onClick: Mark as read
              onClick={() => {
                console.log('✅ Mark as read:', notification.notification_id);
                markAsRead(notification.notification_id);
              }}
              // ✅ onDelete: Delete notification
              onDelete={() => {
                console.log('🗑️ Delete notification:', notification.notification_id);
                deleteNotification(notification.notification_id);
              }}
              // ✅ onNavigate: Navigate sang trang khác (ưu tiên)
              onNavigate={(path: string) => {
                console.log('🚀 NotificationsSection.onNavigate:', path);
                navigate(path);
              }}
              // ✅ onTabChange: Fallback (nếu không có onNavigate)
              onTabChange={onTabChange}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default NotificationsSection;
