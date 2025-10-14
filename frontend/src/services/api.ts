/**
 * File: services/api.ts
 * Mục đích: Cấu hình Axios client cho API calls
 * Vai trò:
 *   - Tạo axios instance với base config
 *   - Setup request/response interceptors
 * Lưu ý:
 *   - Tự động thêm Bearer token vào header nếu có
 *   - Redirect đến /login khi response 401 (unauthorized)
 *   - API URL lấy từ env variable VITE_API_URL
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Tạo axios instance với base configuration
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect đến login nếu unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
