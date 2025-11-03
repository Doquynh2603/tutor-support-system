import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { tutorProfileAPI, locationAPI } from '../services/api';

// Selectors
const selectUser = (state) => state.auth?.user;
const selectIsTutor = (state) => state.auth?.user?.role === 'tutor';

// Mock actions cho development - thay thế Redux actions
const showSuccess = (message) => ({ type: 'ui/showSuccess', payload: message });
const showError = (message) => ({ type: 'ui/showError', payload: message });
const setLastUpdated = () => ({ type: 'tutor/setLastUpdated', payload: Date.now() });

export const tutorQueryKeys = {
  all: ['tutor'],
  profile: (userId) => [...tutorQueryKeys.all, 'profile', userId],
  locations: () => [...tutorQueryKeys.all, 'locations'],
  provinces: () => [...tutorQueryKeys.all, 'provinces'],
  wards: (provinceId) => [...tutorQueryKeys.all, 'wards', provinceId],
  statistics: (userId) => [...tutorQueryKeys.all, 'statistics', userId],
};
// hook lấy thông tin profile gia sư
export const useTutorProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  console.log('🔍 useTutorProfile DEBUG:');
  console.log('   - user:', user);
  console.log('   - user?.id:', user?.id);
  console.log('   - isTutor:', isTutor);
  console.log('   - enabled condition:', !!user?.id && isTutor);

  return useQuery({
    queryKey: tutorQueryKeys.profile(user?.id),
    queryFn: async () => {
      try {
        console.log('📡 Fetching tutor profile...');
        const response = await tutorProfileAPI.getProfile();
        // Backend trả về { success: true, data: {...} }
        console.log('✅ Tutor profile fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching tutor profile:', error);
        throw error;
      }
    },
    enabled: !!user?.id && isTutor,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Failed to fetch tutor profile:', error);
      dispatch(showError(error.response?.data?.message || 'Không thể tải thông tin profile'));
    },
    onSuccess: (_data) => {
      // Update last fetched timestamp in Redux
      dispatch(setLastUpdated());
    },
  });
};

// hook cập nhật thông tin profile gia sư
export const useUpdateTutorProfile = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);

  return useMutation({
    mutationFn: async (newProfileData) => {
      try {
        const response = await tutorProfileAPI.updateProfile(newProfileData);
        // Backend trả về { success: true, data: {...} }
        return response.data;
      } catch (error) {
        console.error('Error updating tutor profile:', error);
        throw error;
      }
    },
    //hủy các truy vấn đang chờ liên quan đến profile gia sư trước khi thực hiện cập nhật
    onMutate: async (newProfileData) => {
      await queryClient.cancelQueries({ queryKey: tutorQueryKeys.profile(user?.id) });
      // lưu trữu dữ liệu profile hiện tại để khôi phục nếu cập nhật thất bại
      const previousProfileData = queryClient.getQueryData(tutorQueryKeys.profile(user?.id));
      // cập nhật dữ liệu profile trong bộ nhớ đệm để giao diện người dùng phản hồi nhanh hơn
      queryClient.setQueryData(tutorQueryKeys.profile(user?.id), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          ...newProfileData,
        };
      });
      return { previousProfileData };
    },
    onError: (error, newProfileData, context) => {
      if (context?.previousProfileData) {
        queryClient.setQueryData(tutorQueryKeys.profile(user?.id), context.previousProfileData);
      }
      dispatch(showError(error.response?.data?.message || 'Cập nhật thông tin profile thất bại'));
    },
    onSuccess: (data, _variables) => {
      //hiển thị thông báo cập nhật thành công
      dispatch(showSuccess(data.message || 'Cập nhật thông tin profile thành công'));
      //cập nhật thời gian cập nhật cuối trong redux
      dispatch(setLastUpdated());
    },
    onSettled: () => {
      // làm mới dữ liệu profile gia sư sau khi cập nhật thành công hoặc thất bại
      queryClient.invalidateQueries({ queryKey: tutorQueryKeys.profile(user?.id) });
    },
  });
};

//hook lấy địa điểm (chỉ gọi khi edit mode)
export const useLocations = (enabled = false) => {
  const dispatch = useDispatch();

  console.log(`📍 useLocations enabled: ${enabled}`);

  return useQuery({
    queryKey: tutorQueryKeys.locations(),
    queryFn: async () => {
      try {
        console.log('📡 Fetching locations...');

        // Fetch provinces - response.data là { success: true, data: [...] }
        const provincesResponse = await locationAPI.getProvinces();
        console.log('✅ Provinces response:', provincesResponse);
        // provincesResponse đã là response.data, nên lấy .data từ đó
        const provinces = provincesResponse.data || provincesResponse;

        // Fetch wards - response.data là { success: true, data: [...] }
        const wardsResponse = await locationAPI.getAllWards();
        console.log('✅ Wards response:', wardsResponse);
        // wardsResponse đã là response.data, nên lấy .data từ đó
        const wards = wardsResponse.data || wardsResponse;

        const locations = { provinces, wards };
        console.log('📍 Final locations data:', locations);
        return locations;
      } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }
    },
    enabled: enabled, // Chỉ fetch khi enabled = true
    staleTime: 30 * 60 * 1000, // 30 minutes (locations don't change often)
    retry: 3,
    onError: (error) => {
      console.error('Failed to fetch locations:', error);
      dispatch(showError('Không thể tải thông tin địa điểm'));
    },
  });
};

//hook để upload ảnh profile

export const useUploadProfileImage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);

  return useMutation({
    mutationFn: (_file) => {
      // Mock upload function cho development
      return Promise.resolve({ success: true, url: 'mock-image-url.jpg' });
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: tutorQueryKeys.profile(user?.id) });
      dispatch(showSuccess('Tải ảnh lên thành công'));
    },
    onError: (error) => {
      console.error('Failed to upload profile image:', error);
      dispatch(showError(error.response?.data?.message || 'Tải ảnh lên thất bại'));
    },
  });
};

//hook xóa ảnh profile

export const useDeleteProfileImage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);

  return useMutation({
    mutationFn: () => {
      // Mock delete function cho development
      return Promise.resolve({ success: true });
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: tutorQueryKeys.profile(user?.id) });
      dispatch(showSuccess('Xóa ảnh thành công'));
    },
    onError: (error) => {
      console.error('Failed to delete profile image:', error);
      dispatch(showError(error.response?.data?.message || 'Xóa ảnh thất bại'));
    },
  });
};

// hook lấy thống kê gia sư

// hook prefetch profile gia sư

export const usePrefetchProfile = () => {
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const isTutor = useSelector(selectIsTutor);

  return () => {
    if (user?.id && isTutor) {
      queryClient.prefetchQuery({
        queryKey: tutorQueryKeys.profile(user?.id),
        queryFn: async () => {
          try {
            const response = await tutorProfileAPI.getProfile();
            // Backend trả về { success: true, data: {...} }
            return response.data;
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

//hook kiểm tra tính hợp lệ của form

export const useProfileValidation = () => {
  const validateProfile = (formData) => {
    const errors = {};

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
    const textFields = [
      { field: 'locationDetail', max: 500, name: 'Chi tiết địa chỉ' },
      { field: 'introduction', max: 1000, name: 'Giới thiệu' },
      { field: 'teachingStyle', max: 500, name: 'Phong cách dạy' },
      { field: 'specialties', max: 500, name: 'Chuyên môn' },
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

// ✅ NEW: Hook lấy danh sách tỉnh
export const useProvinces = (enabled = false) => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      try {
        console.log('📡 Fetching provinces...');
        const response = await locationAPI.getProvinces();
        console.log('✅ Provinces fetched:', response);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching provinces:', error);
        throw error;
      }
    },
    enabled: !!enabled, // ⚠️ ENSURE STRICT BOOLEAN
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    onError: (error) => {
      console.error('Failed to fetch provinces:', error);
    },
  });
};

// ✅ NEW: Hook lấy danh sách huyện theo tỉnh (cascading)
export const useWardsByProvince = (provinceId, enabled = false) => {
  return useQuery({
    queryKey: ['wards', provinceId],
    queryFn: async () => {
      try {
        console.log(`📡 Fetching wards for province: ${provinceId}`);
        const response = await locationAPI.getWardsByProvince(provinceId);
        console.log('✅ Wards fetched:', response);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching wards:', error);
        throw error;
      }
    },
    enabled: !!enabled && !!provinceId, // ⚠️ ENSURE STRICT BOOLEAN
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    onError: (error) => {
      console.error('Failed to fetch wards:', error);
    },
  });
};
