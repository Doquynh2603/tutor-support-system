import axios from 'axios';

// ✅ Vite environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Tạo axios instance với base configuration
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: isProduction ? 15000 : 10000, // Longer timeout in production
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging (only in development)
    if (isDevelopment) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('📤 Request Data:', config.data);
      }
    }

    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response (only in development)
    if (isDevelopment) {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
      console.log('📥 Response Data:', response.data);
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    const errorInfo = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    };

    if (isDevelopment) {
      console.error('❌ API Error:', errorInfo);
      if (error.response?.data) {
        console.error('📥 Error Response:', error.response.data);
      }
    }

    // Handle different error types
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Forbidden
      console.warn('🚫 Access forbidden');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('🔥 Server error occurred');

      // In production, you might want to send error to logging service
      if (isProduction) {
        // sendErrorToLoggingService(errorInfo);
      }
    }

    return Promise.reject(error);
  }
);
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.response = { data: { message } }; // For compatibility with existing code
  }
}

// Generic API service class
class ApiService {
  constructor(client) {
    this.client = client;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await this.client({
        url: endpoint,
        ...options,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        throw new ApiError(
          error.response.data?.message || 'API request failed',
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // Network error
        throw new ApiError('Network error occurred', 0, null);
      } else {
        // Other error
        throw new ApiError(error.message, 0, null);
      }
    }
  }

  async get(endpoint, params = {}) {
    return this.request(endpoint, {
      method: 'GET',
      params,
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      data,
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      data,
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      data,
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload file method
  async upload(endpoint, file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(endpoint, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }
}

// Create API service instance
const apiService = new ApiService(apiClient);

// ============================================
// TUTOR PROFILE API ENDPOINTS
// ============================================

export const tutorProfileAPI = {
  // Get current tutor's profile
  getProfile: () => apiService.get('/tutor/profile'),

  // Update tutor profile
  updateProfile: (data) => apiService.put('/tutor/profile', data),

  // Get all locations (provinces and wards)
  getLocations: () => apiService.get('/tutor/locations'),

  // Get tutor statistics
  getStatistics: () => apiService.get('/tutor/statistics'),

  // Upload profile image
  uploadImage: (file, onProgress) => apiService.upload('/tutor/profile/image', file, onProgress),

  // Delete profile image
  deleteImage: () => apiService.delete('/tutor/profile/image'),

  // Get tutor's teaching subjects
  getSubjects: () => apiService.get('/tutor/subjects'),

  // Update tutor's teaching subjects
  updateSubjects: (subjects) => apiService.put('/tutor/subjects', { subjects }),
};

// ============================================
// LOCATION API ENDPOINTS
// ============================================

export const locationAPI = {
  // Get all provinces
  getProvinces: () => apiService.get('/locations/provinces'),

  // Get wards by province ID
  getWardsByProvince: (provinceId) => apiService.get(`/locations/provinces/${provinceId}/wards`),

  // Get all wards (with province info)
  getAllWards: () => apiService.get('/locations/wards'),

  // Search locations by name
  searchLocations: (query) => apiService.get('/locations/search', { q: query }),
};

// ============================================
// AUTH API ENDPOINTS
// ============================================

export const authAPI = {
  // Login
  login: (credentials) => apiService.post('/auth/login', credentials),

  // Get current user profile (sau khi login)
  getProfile: () => apiService.get('/auth/profile'),

  // Register
  register: (userData) => apiService.post('/auth/register', userData),

  // Logout
  logout: () => apiService.post('/auth/logout'),

  // Refresh token
  refreshToken: () => apiService.post('/auth/refresh'),

  // Get current user (alias của getProfile)
  getCurrentUser: () => apiService.get('/auth/profile'),

  // Update password
  updatePassword: (passwordData) => apiService.put('/auth/password', passwordData),

  // Request password reset
  requestPasswordReset: (email) => apiService.post('/auth/password-reset', { email }),

  // Reset password with token
  resetPassword: (token, newPassword) =>
    apiService.post('/auth/password-reset/confirm', { token, newPassword }),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format API error for display
 */
export const formatApiError = (error) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error) => {
  return error.status === 0 || error.code === 'NETWORK_ERROR';
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error) => {
  return error.status === 401 || error.status === 403;
};

/**
 * Retry API call with exponential backoff
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};

// Export default API client for direct use
export default apiService;
