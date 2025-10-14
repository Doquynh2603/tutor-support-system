/**
 * File: hooks/useUsers.ts
 * Mục đích: Custom React Query hooks cho User APIs
 * Vai trò:
 *   - Wrapper React Query hooks cho user operations
 *   - Handle caching, loading, error states tự động
 * Lưu ý:
 *   - useQuery cho read operations (GET)
 *   - useMutation cho write operations (POST, PUT, DELETE)
 *   - Query key 'users' để React Query cache và invalidate
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, User } from '@/services/userService';

/**
 * Hook lấy danh sách tất cả users
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
};

/**
 * Hook lấy thông tin user theo ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id, // Chỉ fetch khi có id
  });
};

/**
 * Hook tạo user mới
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<User>) => userService.create(userData),
    onSuccess: () => {
      // Invalidate users cache để refetch danh sách
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Hook cập nhật user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Hook xóa user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
