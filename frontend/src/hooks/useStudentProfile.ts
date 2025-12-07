import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { studentAPI } from '../services/studentApi';

// ================================
// Types
// ================================
import {
  UserAccount,
  StudentProfile,
  Province,
  District,
  Ward,
  StudentProfileFormProps,
  UpdateStudentProfilePayload,
} from '@/types';
import { School } from 'lucide-react';

export interface ValidationErrors {
  [key: string]: string;
}

interface RootState {
  auth: {
    user: UserAccount | null;
  };
}

// ================================
// Selectors
// ================================
const selectUser = (state: RootState): UserAccount | null => state.auth?.user;
const selectIsStudent = (state: RootState): boolean => state.auth?.user?.role === 'student';

// ================================
// Query Keys
// ================================
export const studentQueryKeys = {
  all: ['student'] as const,
  profile: (userId: string | number | undefined) =>
    [...studentQueryKeys.all, 'profile', userId] as const,
};

// ================================
// Hook: Lấy student profile
// ================================
export const useStudentProfile = () => {
  const user = useSelector(selectUser);
  const isStudent = useSelector(selectIsStudent);

  console.log('🔍 useStudentProfile DEBUG:');
  console.log('   - user:', user);
  console.log('   - user?.user_id:', user?.user_id);
  console.log('   - isStudent:', isStudent);
  console.log('   - enabled condition:', !!user?.user_id && isStudent);

  return useQuery<StudentProfile, Error>({
    queryKey: studentQueryKeys.profile(user?.user_id),
    queryFn: async () => {
      try {
        console.log('📡 Fetching student profile...');
        const response = await studentAPI.getStudentProfile();
        console.log('✅ Student profile response:', response);
        const profileData = response;
        console.log('✅ Student profile data:', profileData);
        console.log('✅ Profile data type:', typeof profileData);
        if (!profileData) {
          console.error('❌ No profile data received');
          throw new Error('No profile data received');
        }
        console.log('✅ Returning profile data:', profileData);
        return profileData as StudentProfile;
      } catch (error) {
        console.error('❌ Failed to fetch student profile:', error);
        throw error;
      }
    },
    enabled: !!user?.user_id && isStudent,
  });
};

// ================================
// Hook: Update student profile
// ================================
export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);

  return useMutation<
    StudentProfile,
    Error,
    UpdateStudentProfilePayload,
    { previousProfileData?: StudentProfile }
  >({
    mutationFn: async (newProfileData) => {
      const payload = {
        ...newProfileData,
        address_id: newProfileData.address_id ? String(newProfileData.address_id) : undefined,
      };
      console.log('🔄 [useUpdateStudentProfile] Converted payload:', payload);

      const updateProfile = await studentAPI.updateStudentProfile(payload);
      return updateProfile;
    },
    onMutate: async (newProfileData) => {
      await queryClient.cancelQueries({ queryKey: studentQueryKeys.profile(user?.id) });

      const previousProfileData = queryClient.getQueryData<StudentProfile>(
        studentQueryKeys.profile(user?.user_id)
      );

      queryClient.setQueryData<StudentProfile>(
        studentQueryKeys.profile(user?.user_id),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            ...newProfileData,
          };
        }
      );

      return { previousProfileData };
    },
    onError: (
      error: Error,
      _newProfileData: UpdateStudentProfilePayload,
      context?: { previousProfileData?: StudentProfile }
    ) => {
      if (context?.previousProfileData) {
        queryClient.setQueryData(
          studentQueryKeys.profile(user?.user_id),
          context.previousProfileData
        );
      }
      console.error('❌ Update student profile error:', error);
    },
    onSuccess: () => {
      console.log('✅ Student profile updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: studentQueryKeys.profile(user?.user_id),
      });
    },
  });
};
