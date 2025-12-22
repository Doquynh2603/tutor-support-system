import { useCallback, useState } from 'react';
import { classAPI } from '../services/studentApi';
import { CreateClassPayload } from '@/types';

export const useClass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ SỬA: Helper để clean payload
  const cleanPayload = (payload: CreateClassPayload) => {
    console.log('\n=== 🧹 CLEANING PAYLOAD ===');
    console.log('Input payload:', JSON.stringify(payload, null, 2));

    // ✅ Validate & clean schedules
    const cleanedSchedules = payload.schedules.map((s, i) => {
      if (!s.day_of_week || !s.start_time || !s.end_time || !s.duration_minutes) {
        throw new Error(`Schedule[${i}]: Thiếu trường bắt buộc`);
      }

      // ✅ Check NaN:NaN
      if (String(s.end_time).includes('NaN')) {
        console.error(`❌ Schedule[${i}] has NaN end_time:`, s);
        throw new Error(`Schedule[${i}]: Giờ kết thúc bị lỗi (${s.end_time})`);
      }

      // ✅ Validate time format HH:MM
      const startMatch = String(s.start_time).match(/^(\d{2}):(\d{2})$/);
      const endMatch = String(s.end_time).match(/^(\d{2}):(\d{2})$/);

      if (!startMatch || !endMatch) {
        throw new Error(`Schedule[${i}]: Định dạng giờ không hợp lệ`);
      }

      const [sH, sM] = startMatch.slice(1).map(Number);
      const [eH, eM] = endMatch.slice(1).map(Number);

      if (sH * 60 + sM >= eH * 60 + eM) {
        throw new Error(`Schedule[${i}]: Giờ kết thúc phải sau giờ bắt đầu`);
      }

      return {
        day_of_week: Number(s.day_of_week),
        start_time: s.start_time.trim(),
        end_time: s.end_time.trim(),
        duration_minutes: Number(s.duration_minutes),
      };
    });

    const cleaned = {
      subject_id: String(payload.subject_id).trim(),
      description: String(payload.description || '').trim(),
      requirement: String(payload.requirement || '').trim(),
      hourly_price: Number(payload.hourly_price),
      classLevel: Number(payload.classLevel),
      start_date: String(payload.start_date).trim(),
      end_date: String(payload.end_date).trim(),
      schedules: cleanedSchedules,
    };

    console.log('✅ Cleaned payload:', JSON.stringify(cleaned, null, 2));
    return cleaned;
  };

  // ✅ Tạo lớp
  const createClass = useCallback(async (payload: CreateClassPayload) => {
    setLoading(true);
    setError(null);
    try {
      console.log('\n=== 📤 CREATE CLASS ===');
      console.log('Input payload:', JSON.stringify(payload, null, 2));

      // ✅ Clean & validate payload
      const cleanedPayload = cleanPayload(payload);

      const result = await classAPI.createClass(cleanedPayload);
      console.log('✅ Class created successfully:', result);
      setLoading(false);
      return result;
    } catch (err: any) {
      console.error('❌ Error in createClass:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Lỗi khi tạo lớp';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  }, []);

  // Lấy danh sách lớp
  const getMyClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await classAPI.getMyClasses();
      setLoading(false);
      console.log('dữ liệu lấy được từ backend: ', result);
      return result;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi lấy danh sách lớp';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  }, []);

  // Lấy chi tiết lớp
  const getClassDetails = useCallback(async (classId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await classAPI.getClassDetails(classId);
      setLoading(false);
      return result;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi lấy chi tiết lớp';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  }, []);

  // Lấy danh sách gia sư gợi ý
  const getSuggestedTutors = useCallback(async (classId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await classAPI.getSuggestedTutors(classId);
      setLoading(false);
      return result;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err.message || 'Lỗi khi lấy danh sách gia sư';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  }, []);

  // ✅ Mời gia sư
  const inviteTutor = useCallback(async (classId: string, tutorId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`📤 Inviting tutor ${tutorId} to class ${classId}`);
      await classAPI.inviteTutor(classId, tutorId);
      setLoading(false);
      console.log(`✅ Tutor invited successfully`);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi mời gia sư';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  }, []);

  // Duyệt ứng tuyển
  const reviewApplication = useCallback(
    async (applicationId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
      setLoading(true);
      setError(null);
      try {
        await classAPI.reviewApplication(applicationId, action, rejectionReason);
        setLoading(false);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi duyệt ứng tuyển';
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  // Sửa thông tin lớp học
  const updateClass = async (
    classId: string,
    classData: {
      description: string | null;
      requirement: string | null;
      hourly_price: number;
      classLevel: number;
    }
  ) => {
    try {
      const response = await classAPI.updateClass(classId, classData);
      console.log('dữ liệu backend trả về sau khi sửa thông tin', response);
      return response;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin lớp học:', error);
      throw error;
    }
  };

  // Hủy lớp học
  const cancelClass = async (classId: string, cancellationReason: string) => {
    try {
      if (!cancellationReason || cancellationReason.trim() === '') {
        throw new Error('Lý do hủy lớp là bắt buộc');
      }
      const response = await classAPI.cancelClass(classId, cancellationReason.trim());
      console.log('dữ liệu backend trả về sau khi hủy lớp', response);
      return response;
    } catch (error) {
      console.error('Lỗi khi hủy lớp học:', error);
      throw error;
    }
  };

  return {
    loading,
    error,
    createClass,
    getMyClasses,
    getClassDetails,
    getSuggestedTutors,
    inviteTutor,
    reviewApplication,
    updateClass,
    cancelClass,
  };
};
