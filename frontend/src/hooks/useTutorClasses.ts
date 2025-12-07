/**
 * Hooks for Tutor Classes Management — TypeScript Version
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { apiClient } from '../services/api';

// ===============================
// TYPES
// ===============================

export type Role = 'tutor' | 'student' | 'admin' | string;

export interface User {
  id: number | string;
  fullName?: string;
  name?: string;
  role: Role;
  email: string;
}

// Class detail
import { ClassDetail, StudentProfile, TutorClass } from '../types';

// API response interfaces
interface ApiTutorClass {
  class_id: string;
  subject_name?: string;
  subject_id?: string;
  hourly_price?: number;
  tutor_id?: string;
  schedules?: unknown[];
}

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
      return classesData.map((cls: ApiTutorClass) => ({
        class_id: cls.class_id,
        tutor_user_id: cls.tutor_id || '',
        subject_id: cls.subject_id || '',
        subject_name: cls.subject_name || '',
        hourly_price: cls.hourly_price || 0,
        schedules: cls.schedules || [],
      })) as TutorClass[];
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
