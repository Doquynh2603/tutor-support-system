import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTutorProfile, useLocations, useUpdateTutorProfile } from '../../hooks/useTutorProfile';
import {
  selectIsEditingProfile,
  selectIsSubmittingProfile,
  selectNotification,
  setEditingProfile,
  resetProfileForm,
  hideNotification,
} from '../../store/slices/tutorSlice';
import { selectValidationErrors, resetFormState } from '../../store/slices/tutorSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, X, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import TutorProfileDisplay from './TutorProfileDisplay';
import TutorProfileForm from './TutorProfileForm';

const TutorProfileManager = () => {
  const dispatch = useDispatch();
  const isEditing = useSelector(selectIsEditingProfile);
  const isSubmitting = useSelector(selectIsSubmittingProfile);
  const validationErrors = useSelector(selectValidationErrors);
  const notification = useSelector(selectNotification);

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useTutorProfile();

  // Chỉ fetch locations khi edit mode
  const { data: locationsResponse, isLoading: isLoadingLocations } = useLocations(isEditing);

  const updateProfileMutation = useUpdateTutorProfile();

  const locations = locationsResponse || { provinces: [], wards: [] };
  const isLoading = isLoadingProfile || (isEditing && isLoadingLocations);

  // tự động ẩn thông báo sau một khoảng thời gian
  useEffect(() => {
    if (notification.show && notification.duration > 0) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  // khi profile thay đổi và không ở chế độ chỉnh sửa, reset trạng thái form
  useEffect(() => {
    if (profile && !isEditing) {
      dispatch(resetFormState());
    }
  }, [profile, isEditing, dispatch]);

  const handleEdit = () => {
    dispatch(setEditingProfile(true));
  };

  const handleCancelEdit = () => {
    dispatch(resetProfileForm());
    dispatch(resetFormState());
  };

  const handleSave = async (formData) => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      dispatch(setEditingProfile(false));
      dispatch(resetProfileForm());
      dispatch(resetFormState());
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCloseNotification = () => {
    dispatch(hideNotification());
  };

  // ✅ Loading state with shadcn/ui
  if (isLoading && !profile) {
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
  // ✅ Error state with shadcn/ui
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
      {/* ✅ Header with shadcn/ui */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Quản lý thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin để học sinh có thể tìm hiểu về bạn
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {profile?.verified ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Đã xác minh
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Chưa xác minh
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ✅ Notification with shadcn/ui */}
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

      {/* ✅ Main Content */}
      <div className="space-y-6">
        {!isEditing ? (
          <>
            {/* Edit Button */}
            <div className="flex justify-end">
              <Button onClick={handleEdit} disabled={isLoadingProfile} className="gap-2">
                <Edit className="h-4 w-4" />
                Chỉnh sửa thông tin
              </Button>
            </div>

            {/* Profile Display */}
            <TutorProfileDisplay
              profile={profile}
              onEdit={handleEdit}
              isLoading={isLoadingProfile}
            />
          </>
        ) : (
          <TutorProfileForm
            profile={profile}
            locations={locations}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            isLoading={updateProfileMutation.isLoading || isSubmitting}
            validationErrors={validationErrors}
          />
        )}
      </div>
    </div>
  );
};

export default TutorProfileManager;
