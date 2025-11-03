/**
 * Hooks for Tutor Classes Management
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { apiClient } from '../services/api';

const selectUser = (state) => state.auth?.user;
const selectIsTutor = (state) => state.auth?.user?.role === 'tutor';

export const tutorClassesQueryKeys = {
  all: ['tutorClasses'],
  list: (status) => [...tutorClassesQueryKeys.all, 'list', status],
  detail: (classId) => [...tutorClassesQueryKeys.all, 'detail', classId],
  student: (classId) => [...tutorClassesQueryKeys.all, 'student', classId],
  applications: (status) => [...tutorClassesQueryKeys.all, 'applications', status],
};

/**
 * Hook lấy danh sách lớp học của gia sư
 * @param {string} status - Trạng thái lớp: 'in_progress', 'has_tutor', 'recruiting', 'completed'
 */
export const useTutorClasses = (status = null) => {
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  console.log('🎓 useTutorClasses DEBUG:');
  console.log('   - status:', status);
  console.log('   - isTutor:', isTutor);

  return useQuery({
    queryKey: tutorClassesQueryKeys.list(status),
    queryFn: async () => {
      try {
        console.log('📡 Fetching tutor classes with status:', status);
        const params = status ? { status } : {};
        const response = await apiClient.get('/tutor/classes', { params });
        console.log('✅ Tutor classes fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching tutor classes:', error);
        throw error;
      }
    },
    enabled: !!user?.id && isTutor,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook lấy chi tiết lớp học
 */
export const useTutorClassDetail = (classId) => {
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  return useQuery({
    queryKey: tutorClassesQueryKeys.detail(classId),
    queryFn: async () => {
      try {
        console.log('📡 Fetching tutor class detail:', classId);
        const response = await apiClient.get(`/tutor/classes/${classId}`);
        console.log('✅ Class detail fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching class detail:', error);
        throw error;
      }
    },
    enabled: !!user?.id && isTutor && !!classId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook lấy thông tin học viên của lớp
 */
export const useClassStudentProfile = (classId, enabled = false) => {
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  console.log('👤 useClassStudentProfile - enabled:', enabled);

  return useQuery({
    queryKey: tutorClassesQueryKeys.student(classId),
    queryFn: async () => {
      try {
        console.log('📡 Fetching student profile for class:', classId);
        const response = await apiClient.get(`/tutor/classes/${classId}/student`);
        console.log('✅ Student profile fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching student profile:', error);
        throw error;
      }
    },
    enabled: !!user?.id && isTutor && !!classId && enabled,
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook lấy danh sách ứng tuyển của gia sư
 */
export const useTutorApplications = (status = null) => {
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  return useQuery({
    queryKey: tutorClassesQueryKeys.applications(status),
    queryFn: async () => {
      try {
        console.log('📋 Fetching tutor applications with status:', status);
        const params = status ? { status } : {};
        const response = await apiClient.get('/tutor/classes/applications', { params });
        console.log('✅ Applications fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
    },
    enabled: !!user?.id && isTutor,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook để invalidate tutor classes cache
 */
export const useRefreshTutorClasses = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: tutorClassesQueryKeys.all });
  };
};
