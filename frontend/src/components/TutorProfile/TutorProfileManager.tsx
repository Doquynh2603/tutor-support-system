import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  selectIsEditingProfile,
  selectIsSubmittingProfile,
  selectNotification,
  setEditingProfile,
  resetProfileForm,
  hideNotification,
  selectValidationErrors,
  resetFormState,
} from '../../store/slices/tutorSlice';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertCircle, CheckCircle, X, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import TutorProfileDisplay from './TutorProfileDisplay';
import TutorProfileForm from './TutorProfileForm';
import { useTutorProfile, useUpdateTutorProfile } from '../../hooks/useTutorProfile';
import { useProvinces, useDistricts, useWards } from '../../hooks/useProvinces';
import { TutorProfile } from '@/types';

interface Province {
  id: string | number;
  name: string;
}

interface District {
  id: string | number;
  name: string;
  province_id?: string | number;
}

interface Ward {
  id: string | number;
  name: string;
  district_id?: string | number;
  province_id?: string | number;
}

interface Notification {
  show: boolean;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

const TutorProfileManager: React.FC = () => {
  const dispatch = useDispatch();
  const isEditing = useSelector((state: RootState) => selectIsEditingProfile(state));
  const isSubmitting = useSelector((state: RootState) => selectIsSubmittingProfile(state));
  const validationErrors = useSelector((state: RootState) => selectValidationErrors(state));
  const notification = useSelector((state: RootState) => selectNotification(state)) as Notification;

  // Location selection state
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useTutorProfile();
  const profile: TutorProfile | null = profileData || null;

  // Location queries
  const { data: provinces = [], isLoading: isLoadingProvinces } = useProvinces(true);
  const { data: districts = [], isLoading: isLoadingDistricts } = useDistricts(selectedProvinceId, true);
  const { data: wards = [], isLoading: isLoadingWards } = useWards(selectedDistrictId, true);

  const updateProfileMutation = useUpdateTutorProfile();

  // Khi profile thay đổi và không ở chế độ edit, reset form và location state
  useEffect(() => {
    if (profile && !isEditing) {
      dispatch(resetFormState());
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
    }
  }, [profile, isEditing, dispatch]);

  const handleEdit = () => dispatch(setEditingProfile(true));

  const handleCancelEdit = () => {
    dispatch(resetProfileForm());
    dispatch(resetFormState());
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
  };

  const handleSave = async (formData: Partial<TutorProfile>) => {
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

  const handleCloseNotification = () => dispatch(hideNotification());

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(null);
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
  };

  if (isLoadingProfile && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải thông tin profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileError && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
            <p className="text-muted-foreground text-center mb-6">{profileError.message}</p>
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Quản lý thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin để học sinh có thể tìm hiểu về bạn
              </CardDescription>
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
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {notification.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {notification.type === 'warning' && <AlertCircle className="h-4 w-4" />}
            <AlertDescription className="flex-1">{notification.message}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseNotification}
              className="h-auto p-1 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {!isEditing ? (
          <>
            <div className="flex justify-end">
              <Button onClick={handleEdit} disabled={isLoadingProfile} className="gap-2">
                <Edit className="h-4 w-4" /> Chỉnh sửa thông tin
              </Button>
            </div>
            <TutorProfileDisplay
              profile={profile}
              onEdit={handleEdit}
              isLoading={isLoadingProfile}
            />
          </>
        ) : (
          <TutorProfileForm
            profile={profile}
            provinces={provinces as Province[]}
            districts={districts as District[]}
            wards={wards as Ward[]}
            selectedProvinceId={selectedProvinceId}
            selectedDistrictId={selectedDistrictId}
            isLoadingProvinces={isLoadingProvinces}
            isLoadingDistricts={isLoadingDistricts}
            isLoadingWards={isLoadingWards}
            onProvinceChange={handleProvinceChange}
            onDistrictChange={handleDistrictChange}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            isSubmitting={updateProfileMutation.isPending || isSubmitting}
            validationErrors={validationErrors}
          />
        )}
      </div>
    </div>
  );
};

export default TutorProfileManager;
