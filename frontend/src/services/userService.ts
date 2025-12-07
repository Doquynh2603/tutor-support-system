/**
 * File: services/userService.ts
 * Mục đích: Service layer cho User APIs
 * Vai trò:
 *   - Wrapper functions cho các API calls liên quan đến Users
 *   - Sử dụng apiClient đã config sẵn
 * Lưu ý:
 *   - Tất cả methods đều async và return Promise
 *   - Response được unwrap để trả về data trực tiếp
 *   - User interface nên match với backend User model
 */

import { apiClient } from './api';

import { UserAccount } from '@/types';

export const userService = {
  // Lấy danh sách tất cả users
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: UserAccount[] }>('/users');
    return response.data.data;
  },

  // Lấy thông tin user theo ID
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: UserAccount }>(`/users/${id}`);
    return response.data.data;
  },

  // Tạo user mới
  create: async (userData: Partial<UserAccount>) => {
    const response = await apiClient.post<{ success: boolean; data: UserAccount }>(
      '/users',
      userData
    );
    return response.data.data;
  },

  // Cập nhật thông tin user
  update: async (id: string, userData: Partial<UserAccount>) => {
    const response = await apiClient.put<{ success: boolean; data: UserAccount }>(
      `/users/${id}`,
      userData
    );
    return response.data.data;
  },

  // Xóa user
  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
