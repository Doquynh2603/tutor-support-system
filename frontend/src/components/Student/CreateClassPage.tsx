import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useClass } from '../../hooks/useClass';
import { resetFormData, clearSelectedTutors } from '../../store/slices/classesSlice';
import { RootState } from '../../store';
import { CreateClassPayload } from '../../types';
import ClassFormStep1 from '../../components/Student/ClassFormStep1';
import ClassFormStep2 from '../../components/Student/ClassFormStep2';

const CreateClassPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [classId, setClassId] = useState<string | null>(null);

  const formData = useSelector((state: RootState) => state.classes.formData) as any;
  const selectedTutors = useSelector((state: RootState) => state.classes.selectedTutors);
  const { createClass, inviteTutor, loading } = useClass();

  // ✅ SỬA: Helper function để validate & clean payload
  const preparePayloadForBackend = () => {
    console.log('\n=== 🧹 PREPARING PAYLOAD FOR BACKEND ===');
    console.log('Raw formData from Redux:', JSON.stringify(formData, null, 2));

    // ✅ Validate required fields
    if (!formData.subject_id) {
      throw new Error('Vui lòng chọn môn học');
    }
    if (!formData.classLevel) {
      throw new Error('Vui lòng chọn cấp lớp');
    }
    if (!formData.start_date) {
      throw new Error('Vui lòng chọn ngày bắt đầu');
    }
    if (!formData.end_date) {
      throw new Error('Vui lòng chọn ngày kết thúc');
    }
    if (!formData.schedules || formData.schedules.length === 0) {
      throw new Error('Vui lòng thêm ít nhất một lịch học');
    }

    // ✅ Transform & validate schedules
    const schedulesPayload = formData.schedules.map((schedule: any, index: number) => {
      console.log(`\n📋 Processing schedule[${index}]:`, schedule);

      // ✅ Validate required schedule fields
      if (!schedule.day_of_week) {
        throw new Error(`Schedule[${index}]: Vui lòng chọn ngày trong tuần`);
      }
      if (!schedule.start_time) {
        throw new Error(`Schedule[${index}]: Vui lòng chọn giờ bắt đầu`);
      }
      if (!schedule.end_time || schedule.end_time.includes('NaN')) {
        throw new Error(
          `Schedule[${index}]: Giờ kết thúc bị lỗi. Vui lòng kiểm tra lại giờ bắt đầu & thời lượng`
        );
      }
      if (!schedule.duration_minutes || Number(schedule.duration_minutes) <= 0) {
        throw new Error(`Schedule[${index}]: Thời lượng phải lớn hơn 0`);
      }

      // ✅ Parse & validate time format
      const startTimeMatch = String(schedule.start_time).match(/^(\d{2}):(\d{2})$/);
      const endTimeMatch = String(schedule.end_time).match(/^(\d{2}):(\d{2})$/);

      if (!startTimeMatch) {
        throw new Error(
          `Schedule[${index}]: Định dạng giờ bắt đầu không hợp lệ (${schedule.start_time})`
        );
      }
      if (!endTimeMatch) {
        throw new Error(
          `Schedule[${index}]: Định dạng giờ kết thúc không hợp lệ (${schedule.end_time})`
        );
      }

      const [startHour, startMin] = startTimeMatch.slice(1).map(Number);
      const [endHour, endMin] = endTimeMatch.slice(1).map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        throw new Error(`Schedule[${index}]: Giờ kết thúc phải sau giờ bắt đầu`);
      }

      // ✅ Create clean schedule object
      const cleanSchedule = {
        day_of_week: Number(schedule.day_of_week),
        start_time: schedule.start_time.trim(),
        end_time: schedule.end_time.trim(),
        duration_minutes: Number(schedule.duration_minutes),
      };

      console.log(`✅ Schedule[${index}] validated:`, cleanSchedule);
      return cleanSchedule;
    });

    // ✅ Create final payload
    const payload: CreateClassPayload = {
      subject_id: formData.subject_id.trim(),
      description: (formData.description || '').trim(),
      requirement: (formData.requirement || '').trim(),
      hourly_price: Number(formData.hourly_price),
      classLevel: Number(formData.classLevel),
      start_date: formData.start_date.trim(),
      end_date: formData.end_date.trim(),
      schedules: schedulesPayload,
    };

    console.log('\n✅ Final validated payload:', JSON.stringify(payload, null, 2));
    return payload;
  };

  const handleStep1Submit = async () => {
    try {
      console.log('\n=== 🚀 STEP 1: CREATE CLASS ===');

      // ✅ SỬA: Validate & prepare payload
      const payload = preparePayloadForBackend();

      console.log('📤 Sending to backend:', JSON.stringify(payload, null, 2));

      const result = await createClass(payload);
      console.log('✅ Backend response:', result);

      setClassId(result.class_id || result.id);
      alert('✅ Lớp học tạo thành công! Bây giờ hãy chọn gia sư để mời');
      setStep(2);
    } catch (error: any) {
      console.error('❌ Lỗi khi tạo lớp:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Lỗi khi tạo lớp học';
      alert('❌ ' + errorMsg);
    }
  };

  const handleStep2Submit = async () => {
    if (!classId) {
      alert('Lỗi: không có class_id');
      return;
    }

    try {
      console.log('\n=== 🚀 STEP 2: INVITE TUTORS ===');
      console.log(`Inviting ${selectedTutors.length} tutor(s) to class ${classId}`);

      // ✅ Mời gia sư từng cái
      let successCount = 0;
      for (const tutorId of selectedTutors) {
        try {
          await inviteTutor(classId, tutorId);
          successCount++;
          console.log(`✅ Invited tutor: ${tutorId}`);
        } catch (err) {
          console.error(`⚠️ Lỗi khi mời gia sư ${tutorId}:`, err);
        }
      }

      alert(`✅ Hoàn thành! Đã mời ${successCount}/${selectedTutors.length} gia sư`);

      // ✅ Reset
      dispatch(resetFormData());
      dispatch(clearSelectedTutors());
      setClassId(null);

      // ✅ Chuyển hướng về trang quản lý lớp học (tab recruiting)
      navigate('/?tab=my-classes');
    } catch (error: any) {
      console.error('❌ Lỗi khi mời gia sư:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Lỗi khi mời gia sư';
      alert('❌ ' + errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo Lớp Học Mới</h1>
          <p className="text-gray-600 mt-2">
            Bước {step}/2
            {classId && (
              <span className="ml-4 text-green-600">
                ✅ Lớp đã tạo (ID: {classId.substring(0, 8)}...)
              </span>
            )}
          </p>
        </div>

        {step === 1 ? (
          <ClassFormStep1 onNext={handleStep1Submit} />
        ) : (
          <ClassFormStep2
            onBack={() => setStep(1)}
            onSubmit={handleStep2Submit}
            isLoading={loading}
            classId={classId} // ✅ Truyền classId xuống
          />
        )}
      </div>
    </div>
  );
};

export default CreateClassPage;
