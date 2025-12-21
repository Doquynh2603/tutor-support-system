import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { locationAPI } from '../../services/api';
import { useStudentProfile, useUpdateStudentProfile } from '../../hooks/useStudentProfile';
import {
  selectIsEditingProfile,
  selectIsSubmittingProfile,
  selectNotification,
  setEditingProfile,
  resetProfileForm,
  hideNotification,
  selectValidationErrors,
  resetFormState,
} from '../../store/slices/studentSlice';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertCircle, CheckCircle, X, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import StudentProfileDisplay from './StudentProfileDisplay';
import StudentProfileForm from './StudentProfileForm';
import { StudentProfile } from '@/types';

const StudentProfileManager: React.FC = () => {
  const dispatch = useDispatch();
  const isEditing = useSelector(selectIsEditingProfile);
  const isSubmitting = useSelector(selectIsSubmittingProfile);
  const validationErrors = useSelector(selectValidationErrors);
  const notification = useSelector(selectNotification);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null); // ✅ SỬA: Dùng string
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null); // ✅ SỬA: Dùng string

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useStudentProfile();

  // ✅ SỬA: Handle UUID string IDs
  const { data: provinces = [], isLoading: isLoadingProvinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      try {
        console.log('🚀 Fetching provinces...');
        const response = await locationAPI.getProvinces();
        console.log('=== PROVINCES RESPONSE ===', response);

        const data = Array.isArray(response) ? response : response?.data || response;

        if (!Array.isArray(data)) {
          console.warn('❌ Provinces data is not array:', typeof data);
          return [];
        }

        const cleaned = data
          .filter((p) => {
            if (!p || !p.id || !p.name) {
              console.warn('⚠️ Invalid province:', p);
              return false;
            }
            // ✅ SỬA: Trim UUID string và validate
            const id = String(p.id).trim();
            if (!id || id.length === 0) {
              console.warn('⚠️ Province id is empty');
              return false;
            }
            if (typeof p.name !== 'string' || p.name.trim().length === 0) {
              console.warn('⚠️ Province name is invalid:', p.name);
              return false;
            }
            return true;
          })
          .map((p) => ({
            id: String(p.id).trim(), // ✅ SỬA: Giữ UUID as string
            name: String(p.name).trim(),
          }));

        console.log('=== FINAL PROVINCES ===', cleaned);
        console.log('✅ Total cleaned provinces:', cleaned.length);
        return cleaned;
      } catch (error) {
        console.error('❌ Error fetching provinces:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
  });

  // ✅ SỬA: Fetch districts với UUID
  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery({
    queryKey: ['districts', selectedProvinceId],
    queryFn: async () => {
      if (!selectedProvinceId) {
        console.log('⏭️ Skipping districts fetch: no provinceId');
        return [];
      }
      try {
        console.log('🚀 Fetching districts for province:', selectedProvinceId);
        const response = await locationAPI.getDistricts(selectedProvinceId);
        console.log('=== DISTRICTS RESPONSE ===', response);

        const data = Array.isArray(response) ? response : response?.data || response;

        if (!Array.isArray(data)) {
          console.warn('❌ Districts data is not array');
          return [];
        }

        const cleaned = data
          .filter((d) => {
            if (!d || !d.id || !d.name) return false;
            const id = String(d.id).trim();
            if (!id) return false;
            if (typeof d.name !== 'string' || d.name.trim().length === 0) return false;
            return true;
          })
          .map((d) => ({
            id: String(d.id).trim(),
            name: String(d.name).trim(),
            province_id: d.province_id ? String(d.province_id).trim() : null,
          }));

        console.log('=== FINAL DISTRICTS ===', cleaned);
        console.log('✅ Total cleaned districts:', cleaned.length);
        return cleaned;
      } catch (error) {
        console.error('❌ Error fetching districts:', error);
        return [];
      }
    },
    enabled: !!selectedProvinceId,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
  });

  // ✅ SỬA: Fetch wards với UUID
  const { data: wards = [], isLoading: isLoadingWards } = useQuery({
    queryKey: ['wards', selectedDistrictId],
    queryFn: async () => {
      if (!selectedDistrictId) {
        console.log('⏭️ Skipping wards fetch: no districtId');
        return [];
      }
      try {
        console.log('🚀 Fetching wards for district:', selectedDistrictId);
        const response = await locationAPI.getWards(selectedDistrictId);
        console.log('=== WARDS RESPONSE ===', response);

        const data = Array.isArray(response) ? response : response?.data || response;

        if (!Array.isArray(data)) {
          console.warn('❌ Wards data is not array');
          return [];
        }

        const cleaned = data
          .filter((w) => {
            if (!w || !w.id || !w.name) return false;
            const id = String(w.id).trim();
            if (!id) return false;
            if (typeof w.name !== 'string' || w.name.trim().length === 0) return false;
            return true;
          })
          .map((w) => ({
            id: String(w.id).trim(),
            name: String(w.name).trim(),
            district_id: w.district_id ? String(w.district_id).trim() : null,
          }));

        console.log('=== FINAL WARDS ===', cleaned);
        console.log('✅ Total cleaned wards:', cleaned.length);
        return cleaned;
      } catch (error) {
        console.error('❌ Error fetching wards:', error);
        return [];
      }
    },
    enabled: !!selectedDistrictId,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
  });

  const updateProfileMutation = useUpdateStudentProfile();
  const isMutationPending = updateProfileMutation.status === 'pending';

  const isInitialLoading = isLoadingProfile && !profile;

  // Auto-hide notification
  useEffect(() => {
    if (notification.show && notification.duration) {
      const timer = setTimeout(() => dispatch(hideNotification()), notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.show, notification.duration, dispatch]);

  // Reset form khi profile thay đổi và không đang edit
  useEffect(() => {
    if (profile && !isEditing) {
      dispatch(resetFormState());
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
    }
  }, [profile, isEditing, dispatch]);

  // ✅ SỬA: Set province/district từ profile (UUID string)
  useEffect(() => {
    if (isEditing && profile) {
      console.log('Setting province/district from profile:', profile);

      if (profile.province_id) {
        const provinceId = String(profile.province_id).trim();
        if (provinceId.length > 0) {
          setSelectedProvinceId(provinceId);
          console.log('✅ Set province:', provinceId);
        }
      } else {
        setSelectedProvinceId(null);
      }

      if (profile.district_id) {
        const districtId = String(profile.district_id).trim();
        if (districtId.length > 0) {
          setSelectedDistrictId(districtId);
          console.log('✅ Set district:', districtId);
        }
      } else {
        setSelectedDistrictId(null);
      }
    }
  }, [isEditing]);

  const handleEdit = useCallback(() => {
    dispatch(setEditingProfile(true));
  }, [dispatch]);

  const handleCancelEdit = useCallback(() => {
    dispatch(resetProfileForm());
    dispatch(resetFormState());
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
  }, [dispatch]);

  const handleSave = async (formData: Partial<StudentProfile>) => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      dispatch(setEditingProfile(false));
      dispatch(resetProfileForm());
      dispatch(resetFormState());
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCloseNotification = useCallback(() => {
    dispatch(hideNotification());
  }, [dispatch]);

  // ✅ SỬA: Handle UUID string
  const handleProvinceChange = useCallback((provinceId: string | null) => {
    const id = provinceId ? String(provinceId).trim() : null;
    setSelectedProvinceId(id);
    setSelectedDistrictId(null);
    console.log('Province changed to:', id);
  }, []);

  // ✅ SỬA: Handle UUID string
  const handleDistrictChange = useCallback((districtId: string | null) => {
    const id = districtId ? String(districtId).trim() : null;
    setSelectedDistrictId(id);
    console.log('District changed to:', id);
  }, []);

  const profileData = profile as StudentProfile | undefined;

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải thông tin profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (profileError && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h3 className="text-lg font-semibold">Có lỗi xảy ra</h3>
            <p className="text-muted-foreground text-center">
              {profileError instanceof Error ? profileError.message : 'Lỗi không xác định'}
            </p>
            <Button onClick={() => refetchProfile()} disabled={isLoadingProfile} className="w-full">
              {isLoadingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang thử lại...
                </>
              ) : (
                'Thử lại'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Quản lý thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin để gia sư có thể tìm hiểu về bạn</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notification */}
      {notification.show && (
        <Alert
          variant={notification.type === 'error' ? 'destructive' : 'default'}
          className={cn(
            'relative',
            notification.type === 'success' && 'border-green-200 bg-green-50 text-green-800',
            notification.type === 'warning' && 'border-yellow-200 bg-yellow-50 text-yellow-800'
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {['error', 'warning'].includes(notification.type) && (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className="flex-1">{notification.message}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseNotification}
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      <div className="space-y-6">
        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleEdit} disabled={isLoadingProfile} className="gap-2">
                <Edit className="h-4 w-4" />
                Chỉnh sửa thông tin
              </Button>
            </div>
            {profileData && (
              <StudentProfileDisplay
                profile={profileData}
                onEdit={handleEdit}
                isLoading={isLoadingProfile}
              />
            )}
          </div>
        ) : (
          <StudentProfileForm
            profile={profileData}
            provinces={provinces}
            districts={districts}
            wards={wards}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            isSubmitting={isMutationPending || isSubmitting}
            isLoadingProvinces={isLoadingProvinces}
            isLoadingDistricts={isLoadingDistricts}
            isLoadingWards={isLoadingWards}
            selectedProvinceId={selectedProvinceId}
            selectedDistrictId={selectedDistrictId}
            onProvinceChange={handleProvinceChange}
            onDistrictChange={handleDistrictChange}
            validationErrors={validationErrors}
          />
        )}
      </div>
    </div>
  );
};

export default StudentProfileManager;
