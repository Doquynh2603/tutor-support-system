// frontend/src/components/Student/ClassFormStep2.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSuggestedTutors, toggleTutorSelection } from '../../store/slices/classesSlice';
import { RootState } from '../../store';
import { classAPI } from '../../services/api';
import TutorCard from './TutorCard';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ClassFormStep2: React.FC<Props> = ({ onBack, onSubmit, isLoading }) => {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.classes.formData);
  const suggestedTutors = useSelector((state: RootState) => state.classes.suggestedTutors);
  const selectedTutors = useSelector((state: RootState) => state.classes.selectedTutors);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutors = async () => {
      if (!formData.subject_id) return;

      setLoadingTutors(true);
      setError(null);
      try {
        const data = await classAPI.getSuggestedTutors(formData.subject_id);
        dispatch(setSuggestedTutors(data));
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Lỗi khi lấy danh sách gia sư');
      } finally {
        setLoadingTutors(false);
      }
    };

    fetchTutors();
  }, [formData.subject_id, dispatch]);

  const handleTutorToggle = (tutorId: string) => {
    dispatch(toggleTutorSelection(tutorId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chọn Gia Sư (Tùy chọn)</CardTitle>
        <CardDescription>
          Chọn một hoặc nhiều gia sư để mời. Nếu không chọn, lớp sẽ ở trạng thái "Tìm kiếm"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Giá: {parseFloat(formData.hourly_price).toLocaleString('vi-VN')} VNĐ/giờ | Lịch:{' '}
            {formData.schedules.length} buổi/tuần
          </AlertDescription>
        </Alert>

        {/* Tutors */}
        {loadingTutors ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Đang tải danh sách gia sư...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : suggestedTutors.length === 0 ? (
          <Alert>
            <AlertDescription>Không có gia sư phù hợp cho môn học này</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedTutors.map((tutor) => (
              <TutorCard
                key={tutor.tutor_id}
                tutor={tutor}
                isSelected={selectedTutors.includes(tutor.user_id)}
                onToggle={() => handleTutorToggle(tutor.user_id)}
              />
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-6">
          <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex-1">
            ← Quay lại
          </Button>
          <Button onClick={onSubmit} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              `✅ Hoàn thành (${selectedTutors.length} gia sư)`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassFormStep2;
