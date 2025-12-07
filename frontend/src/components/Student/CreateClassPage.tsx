// frontend/src/pages/Student/CreateClassPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useClass } from '../../hooks/useClass';
import {
  setFormData,
  addSchedule,
  removeSchedule,
  updateSchedule,
  resetFormData,
  toggleTutorSelection,
  setSuggestedTutors,
  clearSelectedTutors,
} from '../../store/slices/classesSlice';
import { RootState } from '../../store';
import { subjectsAPI, classAPI } from '../../services/api';
import ClassFormStep1 from '../../components/Student/ClassFormStep1';
import ClassFormStep2 from '../../components/Student/ClassFormStep2';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';

const CreateClassPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState<1 | 2>(1);
  const [classId, setClassId] = useState<string | null>(null); // ✅ Thêm dòng này

  const formData = useSelector((state: RootState) => state.classes.formData);
  const selectedTutors = useSelector((state: RootState) => state.classes.selectedTutors);
  const { createClass, inviteTutor, loading } = useClass();

  const handleStep1Submit = async () => {
    if (!formData.subject_id || !formData.description || !formData.hourly_price) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // ✅ Kiểm tra schedules hợp lệ
    const hasInvalidSchedule = formData.schedules.some(
      (s: any) => !s.day_of_week || !s.start_date || !s.start_time || !s.duration_minutes
    );
    if (hasInvalidSchedule) {
      alert('Vui lòng điền đầy đủ thông tin lịch học');
      return;
    }

    try {
      // ✅ Chuyển đổi schedules sang format đúng
      const schedulesPayload = formData.schedules.map((schedule: any) => {
        const date = new Date(schedule.start_date);
        const [hours, minutes] = schedule.start_time.split(':');
        const startDate = new Date(date);
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + parseInt(schedule.duration_minutes));

        return {
          day_of_week: parseInt(schedule.day_of_week),
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          duration_minutes: parseInt(schedule.duration_minutes),
        };
      });

      const payload = {
        subject_id: formData.subject_id,
        description: formData.description,
        requirement: formData.requirement,
        hourly_price: parseFloat(formData.hourly_price),
        schedules: schedulesPayload,
        // ❌ Không gửi tutorIds
      };

      // ✅ Tạo lớp
      const result = await createClass(payload);
      setClassId(result.class_id);

      alert('✅ Lớp học tạo thành công! Bây giờ hãy chọn gia sư để mời');
      setStep(2);
    } catch (error) {
      console.error('Lỗi khi tạo lớp:', error);
      alert('Lỗi khi tạo lớp học');
    }
  };

  const handleStep2Submit = async () => {
    if (!classId) {
      alert('Lỗi: không có class_id');
      return;
    }

    try {
      // ✅ Mời gia sư từng cái
      for (const tutorId of selectedTutors) {
        try {
          await inviteTutor(classId, tutorId);
        } catch (err) {
          console.error(`Lỗi khi mời gia sư ${tutorId}:`, err);
        }
      }

      alert(`✅ Hoàn thành! Đã mời ${selectedTutors.length} gia sư`);

      // ✅ Reset
      dispatch(resetFormData());
      dispatch(clearSelectedTutors());
      setClassId(null);
      navigate('/student/my-classes');
    } catch (error) {
      console.error('Lỗi khi mời gia sư:', error);
      alert('Lỗi khi mời gia sư');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo Lớp Học Mới</h1>
          <p className="text-gray-600 mt-2">
            Bước {step}/2
            {classId && <span className="ml-4 text-green-600">✅ Lớp đã tạo</span>}
          </p>
        </div>

        {step === 1 ? (
          <ClassFormStep1 onNext={handleStep1Submit} />
        ) : (
          <ClassFormStep2
            onBack={() => setStep(1)}
            onSubmit={handleStep2Submit}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default CreateClassPage;
