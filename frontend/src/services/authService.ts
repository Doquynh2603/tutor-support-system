/**
 * Authentication API Service - TypeScript
 * Xử lý các request liên quan đến authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Helper để lấy token từ localStorage
export const getToken = (): string | null => localStorage.getItem('authToken');

// Helper để set token vào localStorage
export const setToken = (token: string) => localStorage.setItem('authToken', token);

// Helper để xóa token khỏi localStorage
export const removeToken = () => localStorage.removeItem('authToken');

// Helper để lấy headers với auth token
export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Đăng nhập
 */
export const login = async (credentials: LoginCredentials): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    if (data.data?.token) {
      setToken(data.data.token);
    }

    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Đăng ký
 */
export const register = async (userData: RegisterData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    if (data.data?.token) {
      setToken(data.data.token);
    }

    return data;
  } catch (error: any) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin profile người dùng hiện tại
 */
export const getProfile = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw new Error(data.message || 'Lấy thông tin profile thất bại');
    }

    return data;
  } catch (error: any) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Verify token
 */
export const verifyToken = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Token không hợp lệ');
      }
      throw new Error(data.message || 'Verify token thất bại');
    }

    return data;
  } catch (error: any) {
    console.error('Verify token error:', error);
    throw error;
  }
};

/**
 * Đăng xuất
 */
export const logout = (): Promise<ApiResponse> => {
  removeToken();
  return Promise.resolve({ success: true });
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 */
export const isAuthenticated = (): boolean => !!getToken();

/**
 * Lấy user từ token (decode JWT token)
 */
export const getUserFromToken = (): any | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    removeToken();
    return null;
  }
};
