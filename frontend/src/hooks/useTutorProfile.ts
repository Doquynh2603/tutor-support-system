import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { tutorProfileAPI } from '../services/tutorApi';

// ================================
// Types
// ================================

import { TutorProfile, UserAccount, UpdateTutorProfilePayload } from '@/types';

export interface ValidationErrors {
  [key: string]: string;
}

interface RootState {
  auth: {
    user: UserAccount | null;
  };
}

interface MutationContext {
  previousProfileData?: TutorProfile;
}

// ================================
// Selectors
// ================================
const selectUser = (state: RootState): UserAccount | null => state.auth?.user;
const selectIsTutor = (state: RootState): boolean => state.auth?.user?.role === 'tutor';

// ================================
// Mock Actions
// ================================
const showSuccess = (message: string) => ({ type: 'ui/showSuccess', payload: message });
const showError = (message: string) => ({ type: 'ui/showError', payload: message });

// ================================
// Query Keys
// ================================
export const tutorQueryKeys = {
  all: ['tutor'] as const,
  profile: (userId: string | number | undefined) =>
    [...tutorQueryKeys.all, 'profile', userId] as const,
};

// ================================
// Hook: Lấy tutor profile
// ================================
export const useTutorProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  console.log('🔍 useTutorProfile DEBUG:');
  console.log('   - user:', user);
  console.log('   - user?.id:', user?.user_id);
  console.log('   - isTutor:', isTutor);
  console.log('   - enabled condition:', !!user?.user_id && isTutor);

  return useQuery<TutorProfile, Error>({
    queryKey: tutorQueryKeys.profile(user?.user_id),
    queryFn: async () => {
      try {
        console.log('📡 Fetching tutor profile...');
        const profile = await tutorProfileAPI.getProfile();
        console.log('✅ Tutor profile fetched:', profile);
        return profile;
      } catch (error) {
        console.error('Error fetching tutor profile:', error);
        throw error;
      }
    },
    enabled: !!user?.user_id && isTutor,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// ================================
// Hook: Update tutor profile
// ================================
export const useUpdateTutorProfile = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);

  return useMutation<TutorProfile, Error, UpdateTutorProfilePayload, MutationContext>({
    mutationFn: async (newProfileData) => {
      try {
        console.log('🔄 [useUpdateTutorProfile] Starting update with data:', newProfileData);
        // Convert types to match backend expectations
        let subjects = newProfileData.subjects || [];
        if (Array.isArray(subjects) && subjects.length > 0) {
          // Nếu subjects là objects {subject_id, name}, extract chỉ IDs
          if (typeof subjects[0] === 'object' && 'subject_id' in subjects[0]) {
            console.log('⚠️ Subjects là objects, extracting IDs...');
            subjects = subjects.map((s: any) => s.subject_id);
            console.log('✅ Extracted subject IDs:', subjects);
          }
        }

        const payload = {
          ...newProfileData,
          experience_years: newProfileData.experience_years
            ? parseInt(String(newProfileData.experience_years))
            : undefined,
          address_id: newProfileData.address_id ? String(newProfileData.address_id) : undefined,
          subjects: subjects, // ✅ Ensure array of string IDs only
        };

        console.log('🔄 [useUpdateTutorProfile] Converted payload:', payload);
        const updatedProfile = await tutorProfileAPI.updateProfile(payload);
        console.log('✅ [useUpdateTutorProfile] Update successful:', updatedProfile);
        return updatedProfile;
      } catch (error) {
        console.error('❌ [useUpdateTutorProfile] Error:', error);
        throw error;
      }
    },
    onMutate: async (newProfileData) => {
      await queryClient.cancelQueries({ queryKey: tutorQueryKeys.profile(user?.user_id) });

      const previousProfileData = queryClient.getQueryData<TutorProfile>(
        tutorQueryKeys.profile(user?.user_id)
      );

      queryClient.setQueryData<TutorProfile>(tutorQueryKeys.profile(user?.user_id), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          ...newProfileData,
        };
      });

      return { previousProfileData };
    },
    onError: (
      error: Error,
      _newProfileData: UpdateTutorProfilePayload,
      context?: MutationContext
    ) => {
      if (context?.previousProfileData) {
        queryClient.setQueryData(
          tutorQueryKeys.profile(user?.user_id),
          context.previousProfileData
        );
      }
      const errorMessage = error?.message || 'Cập nhật thông tin profile thất bại';
      console.error('❌ Mutation error:', errorMessage);
    },
    onSuccess: () => {
      console.log('✅ Cập nhật profile thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tutorQueryKeys.profile(user?.user_id) });
    },
  });
};

// ================================
// Hook: Prefetch profile
// ================================
export const usePrefetchProfile = () => {
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  return () => {
    if (user?.user_id && isTutor) {
      queryClient.prefetchQuery({
        queryKey: tutorQueryKeys.profile(user?.user_id),
        queryFn: async () => {
          try {
            const response = await tutorProfileAPI.getProfile();
            return response.data as TutorProfile;
          } catch (error) {
            console.error('Error prefetching tutor profile:', error);
            throw error;
          }
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  };
};

// ================================
// Hook: Profile validation
// ================================
export const useProfileValidation = () => {
  const validateProfile = (
    formData: Record<string, any>
  ): {
    errors: ValidationErrors;
    isValid: boolean;
  } => {
    const errors: ValidationErrors = {};

    // Validate fullName
    if (formData.fullName) {
      if (formData.fullName.length < 2 || formData.fullName.length > 255) {
        errors.fullName = 'Họ tên phải từ 2-255 ký tự';
      }
    }

    // Validate dateOfBirth
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        errors.dateOfBirth = 'Ngày sinh không thể trong tương lai';
      } else if (age < 16) {
        errors.dateOfBirth = 'Tuổi phải từ 16 trở lên';
      } else if (age > 100) {
        errors.dateOfBirth = 'Tuổi không hợp lệ';
      }
    }

    // Validate phone
    if (formData.phone) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = 'Số điện thoại phải có 10-11 chữ số';
      }
    }

    // Validate experienceYears
    if (formData.experienceYears !== undefined && formData.experienceYears !== '') {
      const years = parseInt(formData.experienceYears);
      if (isNaN(years) || years < 0 || years > 50) {
        errors.experienceYears = 'Số năm kinh nghiệm phải từ 0-50';
      }
    }

    // Validate text lengths
    const textFields: Array<{
      field: string;
      max: number;
      name: string;
    }> = [
      { field: 'locationDetail', max: 500, name: 'Chi tiết địa chỉ' },
      { field: 'introduction', max: 1000, name: 'Giới thiệu' },
    ];

    textFields.forEach(({ field, max, name }) => {
      if (formData[field] && formData[field].length > max) {
        errors[field] = `${name} không được quá ${max} ký tự`;
      }
    });

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  };

  return { validateProfile };
};
