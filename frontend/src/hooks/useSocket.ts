/**
 * File: hooks/useSocket.ts
 * Mục đích: Custom hook để sử dụng Socket.IO
 * Vai trò:
 *   - Quản lý lifecycle của socket connection
 *   - Auto connect khi component mount
 *   - Auto disconnect khi component unmount
 * Lưu ý:
 *   - Socket connection là singleton (dùng chung 1 instance)
 *   - Cleanup function chạy khi component unmount
 *   - Return socketService instance để gọi các methods
 */

import { useEffect } from 'react';
import socketService from '@/services/socketService';

/**
 * Hook kết nối và quản lý Socket.IO
 * @returns socketService instance
 */
export const useSocket = () => {
  useEffect(() => {
    // Connect khi component mount
    const socket = socketService.connect();

    // Cleanup: disconnect khi component unmount
    return () => {
      socketService.disconnect();
    };
  }, []); // Empty deps: chỉ chạy 1 lần

  return socketService;
};
