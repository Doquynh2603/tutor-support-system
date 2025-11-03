/**
 * File: hooks/useSearchClasses.js
 * Mục đích: React Query hooks cho tìm kiếm và ứng tuyển lớp học
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

/**
 * Hook tìm kiếm lớp học với bộ lọc
 * @param {Object} filters - {status, province, min_wage, max_wage, subject, gradeLevel, educationLevel}
 * @param {Boolean} enabled - Chỉ search khi enabled = true
 * @returns {Object} - {data, isLoading, error, isFetching, ...}
 */
export const useSearchClasses = (filters, enabled = false) => {
  return useQuery({
    queryKey: ['searchClasses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', 'recruiting'); // chỉ tìm lớp đang tuyển gia sư
      if (filters.subject_id) params.append('subject_id', filters.subject_id);
      if (filters.province_id) params.append('province_id', filters.province_id);
      if (filters.ward_id) params.append('ward_id', filters.ward_id);
      if (filters.min_wage) params.append('min_wage', filters.min_wage);
      if (filters.max_wage) params.append('max_wage', filters.max_wage);
      if (filters.grade_level) params.append('grade_level', filters.grade_level);
      if (filters.education_level) params.append('education_level', filters.education_level);

      const response = await apiClient.get(`/search/classes?${params.toString()}`);
      console.log('kết quả trả về khi tìm kiếm: ', response);

      return response.data.data || []; // api trả về {data: [...]}
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false, // ❌ Không refetch khi focus window
    refetchOnMount: false, // ❌ Không refetch khi mount
    enabled: enabled, // ✅ Chỉ fetch khi enabled = true
    onError: (error) => {
      console.error('❌ Lỗi tìm kiếm lớp học', error.message);
    },
  });
};

/**
 * Hook lấy chi tiết lớp học
 * @param {BIGINT} classId - ID của lớp học
 * @returns {Object} - {data, isLoading, error, ...}
 */

export const useClassDetailForSearch = (classId) => {
  return useQuery({
    queryKey: ['classDetailForSearch', classId],
    queryFn: async () => {
      const response = await apiClient.get(`/search/classes/${classId}`);
      console.log(`chi tiết lớp học có ${classId}: `, response.data);
      return response.data.data;
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      console.error(`❌ Lỗi lấy chi tiết lớp học ${classId}: `, error.message);
    },
  });
};

/**
 * Hook lấy danh sách môn học (subjects)
 * @param {Boolean} enabled - Chỉ fetch khi enabled = true (lazy-load)
 * @returns {Object} - {data, isLoading, error, ...}
 */

export const useSubjects = (enabled = false) => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await apiClient.get('/tutor/subjects');
      console.log('Danh sách môn học lấy được từ database: ', response.data);

      return response.data.data || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 giờ
    gcTime: Infinity,
    retry: 1,
    enabled: !!enabled, // ⚠️ ENSURE STRICT BOOLEAN
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Hook lấy danh sách tỉnh/thành phố
 * @returns {Object} - {data, isLoading, error, ...}
 */

export const useProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const response = await apiClient.get('/locations/provinces');
      return response.data.data || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache 24 giờ
    gcTime: Infinity,
    retry: 1,
  });
};

/**
 * Hook ứng tuyển cho lớp học
 * @returns {Object} - mutation object với mutate, isPending, etc.
 */
export const useApplyForClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 Applying for class with data:', data);
      const response = await apiClient.post('/applications', data);
      console.log('✅ Application submitted:', response.data);
      return response.data;
    },
    onSuccess: (_data) => {
      console.log('✅ Application submitted successfully');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      alert('✅ Ứng tuyển thành công!');
    },
    onError: (error) => {
      console.error('❌ Application submission failed:', error);
      const message = error.response?.data?.message || 'Ứng tuyển thất bại';
      alert('❌ ' + message);
    },
  });
};
