/**
 * Hooks for Tutor Classes Management — TypeScript Version
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { apiClient, searchAPI } from '../services/api';
// ===============================
// TYPES
// ===============================

export type Role = 'tutor' | 'student' | 'admin' | string;

// Class detail
import { ClassDetail, StudentProfile, TutorClass, UserAccount } from '../types';

// Application
export interface TutorApplication {
  id: number | string;
  classId: number | string;
  status: string;
  createdAt?: string;
}

// Redux state type
interface RootState {
  auth: {
    user: UserAccount | null;
  };
}

// ===============================
// SELECTORS
// ===============================
const selectUser = (state: RootState) => state.auth?.user;
const selectIsTutor = (state: RootState) => state.auth?.user?.role === 'tutor';

// ===============================
// QUERY KEYS
// ===============================
export const tutorClassesQueryKeys = {
  all: ['tutorClasses'] as const,
  list: (status?: string | null) => [...tutorClassesQueryKeys.all, 'list', status] as const,
  detail: (classId?: string | number | null) =>
    [...tutorClassesQueryKeys.all, 'detail', classId] as const,
  student: (classId?: string | number | null) =>
    [...tutorClassesQueryKeys.all, 'student', classId] as const,
  applications: (status?: string | null) =>
    [...tutorClassesQueryKeys.all, 'applications', status] as const,
};

// ===============================
// HOOK 1: Danh sách lớp học gia sư
// ===============================
export const useTutorClasses = (status: string | null = null) => {
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  return useQuery<TutorClass[]>({
    queryKey: tutorClassesQueryKeys.list(status),
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await apiClient.get('/tutor/classes', { params });

      // Transform API response to match TutorClass interface
      const classesData = response.data?.data || response.data || [];
      return classesData as TutorClass[];
    },
    enabled: Boolean(user?.user_id && isTutor),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

// ===============================
// HOOK 2: Chi tiết lớp học
// ===============================
export const useTutorClassDetail = (classId?: string | number | null) => {
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  return useQuery<ClassDetail>({
    queryKey: tutorClassesQueryKeys.detail(classId),
    queryFn: async () => {
      const response = await apiClient.get(`/tutor/classes/${classId}`);

      // API returns {success: true, data: classDetail}
      const apiResponse = response.data;
      if (apiResponse?.success && apiResponse?.data) {
        return apiResponse.data as ClassDetail;
      }
      return apiResponse as ClassDetail;
    },
    enabled: Boolean(user?.user_id && isTutor && classId),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

// ===============================
// HOOK 3: Thông tin học viên của lớp
// ===============================
export const useClassStudentProfile = (
  classId?: string | number | null,
  enabled: boolean = false
) => {
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  return useQuery<StudentProfile>({
    queryKey: tutorClassesQueryKeys.student(classId),
    queryFn: async () => {
      const response = await apiClient.get(`/tutor/classes/${classId}/student`);

      // API returns {success: true, data: studentProfile}
      const apiResponse = response.data;
      if (apiResponse?.success && apiResponse?.data) {
        return apiResponse.data as StudentProfile;
      }
      return apiResponse as StudentProfile;
    },
    enabled: Boolean(user?.user_id && isTutor && classId && enabled),
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });
};

// ===============================
// HOOK 4: Danh sách ứng tuyển
// ===============================
export const useTutorApplications = (status: string | null = null) => {
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  return useQuery<TutorApplication[]>({
    queryKey: tutorClassesQueryKeys.applications(status),
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await apiClient.get('/tutor/classes/applications', {
        params,
      });
      return response.data as TutorApplication[];
    },
    enabled: Boolean(user?.user_id && isTutor),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

// ===============================
// HOOK 5: Invalidate cache
// ===============================
export const useRefreshTutorClasses = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: tutorClassesQueryKeys.all });
  };
};

// export const useSearchClasses = (filters: Record<string, unknown>) => {
//   return useQuery({
//     queryKey: ['searchClasses', filters],
//     queryFn: () => {
//       console.log('🚀 Gọi searchClasses với filters:', filters); // ✅ THÊM
//       return searchAPI.searchClasses({
//         province_id: filters.province_id || '', // ✅ Giữ province_id
//         subject_id: filters.subject_id || '',
//         classLevel: filters.classLevel ? String(filters.classLevel) : '',
//         min_hourly_price: String(filters.minRate || 0), // ✅ Đổi minRate → min_hourly_price
//         max_hourly_price: String(filters.maxRate || 999999), // ✅ Đổi maxRate → max_hourly_price
//       });
//     },
//     enabled: true,
//     staleTime: 5 * 60 * 1000,
//   });
// };
export const useSearchClasses = (filters: Record<string, unknown>) => {
  // ✅ Tạo key stable để tránh re-query
  const filterKey = JSON.stringify(filters);

  return useQuery({
    queryKey: ['searchClasses', filterKey],
    queryFn: async () => {
      console.log('🚀 Gọi searchClasses với filters:', filters);

      try {
        const response = await searchAPI.searchClasses({
          province_id: filters.province_id ? String(filters.province_id) : '',
          subject_id: filters.subject_id ? String(filters.subject_id) : '',
          classLevel: filters.classLevel ? String(filters.classLevel) : '',
          min_hourly_price: String(filters.minRate || 0),
          max_hourly_price: String(filters.maxRate || 999999),
        });
        return response.data || response;
      } catch (error) {
        console.error('❌ Lỗi tìm kiếm:', error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // ✅ Giữ cache 10 phút
    retry: 1, // ✅ Chỉ retry 1 lần thay vì 3 lần
  });
};
