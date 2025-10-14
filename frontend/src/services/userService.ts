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

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export const userService = {
  // Lấy danh sách tất cả users
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/users');
    return response.data.data;
  },

  // Lấy thông tin user theo ID
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data.data;
  },

  // Tạo user mới
  create: async (userData: Partial<User>) => {
    const response = await apiClient.post<{ success: boolean; data: User }>('/users', userData);
    return response.data.data;
  },

  // Cập nhật thông tin user
  update: async (id: string, userData: Partial<User>) => {
    const response = await apiClient.put<{ success: boolean; data: User }>(
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
