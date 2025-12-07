import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { subjectsAPI } from '../services/api';
import { AxiosError } from 'axios';

// ================================
// Types
// ================================
export interface Subject {
  id: string | number;
  name: string;
  description?: string;
}

// ================================
// Hook: useSubjects
// ================================
export const useSubjects = (enabled: boolean = false) => {
  return useQuery<Subject[], AxiosError>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const data = await subjectsAPI.getSubjects();
      return data || [];
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
  } as UseQueryOptions<Subject[], AxiosError>); // ép kiểu cho TS
};
