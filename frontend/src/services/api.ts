import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosProgressEvent } from 'axios';

// ✅ Vite environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// ✅ Type for API response
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

// Tạo axios instance với base configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: isProduction ? 15000 : 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDevelopment) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('📤 Request Data:', config.data);
      }
    }

    return config;
  },
  (error) => {
    if (isDevelopment) console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
      console.log('📥 Response Data:', response.data);
    }
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    const errorInfo = {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    };

    if (isDevelopment) {
      console.error('❌ API Error:', errorInfo);
      if (error.response?.data) console.error('📥 Error Response:', error.response.data);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.warn('🚫 Access forbidden');
    } else if (error.response?.status && error.response.status >= 500) {
      console.error('🔥 Server error occurred');
    }

    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  status?: number;
  data?: any;
  response?: { data: { message: string } };

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.response = { data: { message } };
  }
}

// Generic API service class
class ApiService {
  client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async request<T = any>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        url: endpoint,
        ...options,
      });

      // ✅ SỬA: Extract data properly
      const responseData = response.data;

      // Nếu response có structure { success, data: T }, trả về T
      if (responseData && 'data' in responseData && responseData.data !== undefined) {
        return responseData.data as T;
      }

      // Nếu không, trả về toàn bộ response
      return responseData as T;
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data as ApiResponse;
        throw new ApiError(
          errorData?.message || 'API request failed',
          error.response.status,
          errorData
        );
      } else if (error.request) {
        throw new ApiError('Network error occurred', 0, null);
      } else {
        throw new ApiError(error.message || 'Unknown error', 0, null);
      }
    }
  }

  get<T = any>(endpoint: string, params: Record<string, any> = {}) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T = any>(endpoint: string, data: any = {}) {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  put<T = any>(endpoint: string, data: any = {}) {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }

  patch<T = any>(endpoint: string, data: any = {}) {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  upload<T = any>(
    endpoint: string,
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  }
}

const apiService = new ApiService(apiClient);

// Export apiService for use in other modules
export { apiService };

// ============================================
// LOCATION API ENDPOINTS
// ============================================

export const locationAPI = {
  getProvinces: () => apiService.get('/locations/provinces'),
  getDistricts: (provinceId: string) => apiService.get(`/locations/districts/${provinceId}`),
  getWards: (districtId: string) => apiService.get(`/locations/wards/${districtId}`),
  getAllWards: () => apiService.get('/locations/wards'),
  searchLocations: (query: string) => apiService.get('/locations/search', { q: query }),
};

// ============================================
// SUBJECTS API ENDPOINTS
// ============================================

export const subjectsAPI = {
  getSubjects: () => apiService.get('/subjects'),
};

// ============================================
// AUTH API ENDPOINTS
// ============================================

export const authAPI = {
  login: (data: { email: string; password: string }) => apiService.post('/auth/login', data),
  getProfile: () => apiService.get('/auth/profile'),
  register: (userData: Record<string, any>) => apiService.post('/auth/register', userData),
  logout: () => apiService.post('/auth/logout'),
  refreshToken: () => apiService.post('/auth/refresh'),
  getCurrentUser: () => apiService.get('/auth/profile'),
  verifyToken: (token?: string) =>
    apiService.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
    }),
  updatePassword: (passwordData: { oldPassword?: string; newPassword: string }) =>
    apiService.put('/auth/password', passwordData),
  requestPasswordReset: (email: string) => apiService.post('/auth/password-reset', { email }),
  resetPassword: (token: string, newPassword: string) =>
    apiService.post('/auth/password-reset/confirm', { token, newPassword }),
};

// ============================================
// APPLICATION API ENDPOINTS
// ============================================

export const applicationAPI = {
  getMyApplications: (status?: string) => {
    const params = status ? { status } : {};
    return apiService.get('/applications', params);
  },
  getApplicationDetail: (application_id: string) =>
    apiService.get(`/applications/${application_id}`),
  withdrawApplication: (application_id: string, withdrawReason?: string | null) =>
    apiService.post(`/applications/${application_id}/withdraw`, {
      withdrawReason: withdrawReason || null,
    }),
  confirmApplication: (
    application_id: string,
    isConfirmed: boolean,
    declineReason?: string | null
  ) =>
    apiService.post(`/applications/${application_id}/confirm`, {
      applicationId: application_id,
      isConfirmed,
      declineReason: declineReason || null,
    }),
};

// ============================================
// SEARCH API ENDPOINTS
// ============================================

export const searchAPI = {
  searchClasses: (filters: Record<string, unknown>) => apiService.get('/search/classes', filters),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const formatApiError = (error: unknown): string => {
  if (error instanceof ApiError) return error.message;
  if (
    error instanceof Error &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
  ) {
    return (error.response.data as { message: string }).message;
  }
  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi không xác định';
};

export const isNetworkError = (error: unknown): boolean =>
  (error instanceof Error && 'status' in error && error.status === 0) ||
  (error instanceof Error && 'code' in error && error.code === 'NETWORK_ERROR');

export const isAuthError = (error: unknown): boolean =>
  error instanceof Error && 'status' in error && (error.status === 401 || error.status === 403);

export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error: unknown) {
      lastError = error;
      if (
        error instanceof AxiosError &&
        error.response?.status &&
        error.response.status >= 400 &&
        error.response.status < 500
      )
        throw error;
      if (i < maxRetries - 1) await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
};
// ============================================
// CLASS API ENDPOINTS (NEW)
// ============================================

export const classAPI = {
  createClass: (data: any) => apiService.post('/student/class', data),
  getMyClasses: (status?: string) => {
    const params = status ? { status } : {};
    return apiService.get('/student/class', params);
  },
  getClassDetails: (classId: string) => apiService.get(`/student/class/${classId}`),
  getSuggestedTutors: (subjectId: string) =>
    apiService.get('/student/class/suggested-tutors', { subject_id: subjectId }),
  inviteTutor: (classId: string, tutorUserId: string) =>
    apiService.post(`/student/class/${classId}/invite`, { tutor_id: tutorUserId }),
  approveApplication: (classId: string, applicationId: string) =>
    apiService.post(`/student/class/${classId}/approve`, { application_id: applicationId }),
  updateClass: (
    classId: string,
    data: {
      description: string | null;
      requirement: string | null;
      hourly_price: number;
    }
  ) => apiService.put(`/student/class/${classId}`, data),
  cancelClass: (classId: string, cancellationReason: string) =>
    apiService.patch(`/student/class/${classId}`, {
      cancellation_reason: cancellationReason,
    }),
};
// =====================================================
// STUDENT - APPLICATIONS (Duyệt/Từ chối Gia sư)
// =====================================================
export const studentApplicationAPI = {
  // ✅ Lấy danh sách gia sư ứng tuyển cho 1 lớp
  getApplicationsByClass: (classId: string) =>
    apiService.get(`/student/class/${classId}/applications`),

  // ✅ Lấy chi tiết gia sư
  getTutorDetail: async (tutorId: string, classId: string) => {
    console.log('📤 getTutorDetail API called:', { tutorId, classId });

    if (!tutorId || !classId) {
      throw new Error('Vui lòng cung cấp tutor_id và class_id');
    }
    try {
      const response = await apiService.post(`/student/tutor/${tutorId}/detail`, {
        class_id: classId,
      });
      console.log('✅ API response:', response);
      return response?.data || response;
    } catch (error) {
      console.error('❌ API error:', error);
      throw error;
    }
  },

  // ✅ Duyệt/Từ chối gia sư (GỘP)
  reviewApplication: (
    applicationId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ) =>
    apiService.post(`/student/applications/review`, {
      application_id: applicationId,
      action,
      rejection_reason: rejectionReason || null,
    }),
};
