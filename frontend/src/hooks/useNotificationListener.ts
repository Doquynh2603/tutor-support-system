import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '../services/socketService';
import { RootState } from '../store';
import { addNotificationFromSocket } from '@/store/slices/notificationSlice';

/**
 * ✅ Hook này chỉ để subscribe component vào notification updates
 * Global listeners đã được setup ở main.tsx
 */
export const useNotificationListener = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user?.user_id) {
      console.log('⏳ [Hook] No user');
      return;
    }

    const socket = socketService.getSocket();

    if (!socket?.connected) {
      console.log('⏳ [Hook] Socket not connected yet');
      return;
    }

    console.log(`✅ [Hook] Subscribing to notifications for ${user.user_id}`);

    // ✅ Subscribe to notification events
    const handleNotification = (data: any) => {
      console.log('📬 [Hook] Notification received:', data.type);
      dispatch(addNotificationFromSocket(data));
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [user?.user_id, dispatch]);
};

export default useNotificationListener;
