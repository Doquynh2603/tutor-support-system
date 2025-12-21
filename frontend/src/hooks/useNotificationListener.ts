import { useEffect } from 'react';
import socketService from '../services/socketService';
import { useNotifications } from './useNotifications';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useNotificationListener = () => {
  const { addNotification } = useNotifications();

  // ✅ Kiểm tra xem user đã authenticated chưa
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // ✅ Chỉ setup listener nếu user đã authenticated
    if (!isAuthenticated || !user) {
      console.log('⏳ Waiting for authentication...');
      return;
    }

    console.log(`🔌 [Notification] Setting up for user: ${user.user_id}`);

    // ✅ Lấy socket instance
    let socket = socketService.getSocket();
    if (!socket) {
      console.log('🔌 [Notification] Connecting socket...');
      socket = socketService.connect(localStorage.getItem('token') || '', user.user_id, user.role);
    }
    const handleConnect = () => {
      console.log('✅ [Notification] Socket connected:', socket?.id);

      // ✅ QUAN TRỌNG: Emit authenticate event
      socket?.emit('authenticate', user.user_id);
      console.log(`📍 [Notification] Sent authenticate for user: ${user.user_id}`);

      // ✅ Lắng nghe notification event
      socket?.on('notification', (data) => {
        console.log('📬 [Notification] Received:', {
          type: data.type,
          title: data.title,
          created_at: data.created_at,
          receiver_id: data.receiver_id,
        });

        addNotification(data);
      });
    };

    if (socket.connected) {
      // Socket already connected, authenticate immediately
      handleConnect();
    } else {
      // Wait for connection
      socket.once('connect', handleConnect);
    }

    // Cleanup
    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('notification');
    };
  }, [isAuthenticated, user?.user_id, addNotification]);
};

export default useNotificationListener;
