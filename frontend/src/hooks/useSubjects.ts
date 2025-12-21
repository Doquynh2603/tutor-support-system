import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { subjectsAPI } from '../services/api';
import { AxiosError } from 'axios';
import { log } from 'console';

// ================================
// Types
// ================================
import { Subject } from '../types';
// ================================
// Hook: useSubjects
// ================================
export const useSubjects = (enabled: boolean = false) => {
  return useQuery<Subject[], AxiosError>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const data = await subjectsAPI.getSubjects();
      console.log('dữ liệu lấy được từ backend: ', data);

      return data || [];
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
  } as UseQueryOptions<Subject[], AxiosError>); // ép kiểu cho TS
};
