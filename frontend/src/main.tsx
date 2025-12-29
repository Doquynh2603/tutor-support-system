/**
 * File: main.tsx
 * Mục đích: Entry point của React application
 * Vai trò:
 *   - Mount React app vào DOM
 *   - Wrap app với StrictMode để detect potential problems
 * Lưu ý:
 *   - File này chạy đầu tiên khi app khởi động
 *   - StrictMode chỉ chạy ở development, không ảnh hưởng production
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';
import store from './store/index.ts';
import socketService from './services/socketService.ts';
import { addNotificationFromSocket } from './store/slices/notificationSlice.ts';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

let isInitialized = false;

const setupGlobalSocketListener = () => {
  if (isInitialized) {
    console.log('⏭️ [main.tsx] Socket listener already initialized');
    return;
  }

  console.log('🔌 [main.tsx] Initializing global socket listener...');

  const socket = socketService.getSocket();

  if (!socket) {
    console.warn('⚠️ [main.tsx] Socket not connected yet, will retry...');
    setTimeout(setupGlobalSocketListener, 1000);
    return;
  }

  // ✅ Lắng nghe 'notification' event
  socket.on('notification', (data: any) => {
    console.log('📬 [GLOBAL] Received notification event:', {
      notification_id: data.notification_id,
      type: data.type,
      title: data.title,
      receiver_id: data.receiver_id,
    });

    try {
      // ✅ Dispatch Redux action
      store.dispatch(
        addNotificationFromSocket({
          notification_id: data.notification_id,
          receiver_id: data.receiver_id,
          sender_id: data.sender_id,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {},
          is_read: data.is_read || false,
          created_at: data.created_at,
        })
      );

      console.log('✅ [GLOBAL] Notification added to Redux store');
    } catch (error) {
      console.error('❌ [GLOBAL] Error processing notification:', error);
    }
  });

  isInitialized = true;
  console.log('✅ [main.tsx] Global socket listener initialized');
};

// ✅ Setup listener ngay khi app mount
setTimeout(setupGlobalSocketListener, 500);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
