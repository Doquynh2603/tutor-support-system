/**
 * Authentication API Service
 * Xử lý các request liên quan đến authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper để lấy token từ localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Helper để set token vào localStorage
const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper để xóa token khỏi localStorage
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Helper để lấy headers với auth token
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Đăng nhập
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    // Lưu token vào localStorage
    if (data.data?.token) {
      setToken(data.data.token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Đăng ký
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    // Lưu token vào localStorage
    if (data.data?.token) {
      setToken(data.data.token);
    }

    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin profile người dùng hiện tại
 */
export const getProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token hết hạn, xóa token và redirect to login
        removeToken();
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw new Error(data.message || 'Lấy thông tin profile thất bại');
    }

    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Verify token
 */
export const verifyToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        throw new Error('Token không hợp lệ');
      }
      throw new Error(data.message || 'Verify token thất bại');
    }

    return data;
  } catch (error) {
    console.error('Verify token error:', error);
    throw error;
  }
};

/**
 * Đăng xuất
 */
export const logout = () => {
  removeToken();
  // Có thể thêm logic để call API logout nếu cần
  return Promise.resolve({ success: true });
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Lấy user từ token (decode JWT token)
 */
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    // Decode JWT token (chỉ lấy payload, không verify)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    removeToken();
    return null;
  }
};

export { getToken, setToken, removeToken };
