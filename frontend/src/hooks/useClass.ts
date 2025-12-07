// frontend/src/hooks/useClass.ts
import { useCallback, useState } from 'react';
import { classService } from '../services/classService';
import { log } from 'console';

export const useClass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tạo lớp
  const createClass = useCallback(async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await classService.createClass(payload);
      setLoading(false);
      return result;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi tạo lớp';
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
      const result = await classService.getMyClasses();
      setLoading(false);
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
      const result = await classService.getClassDetails(classId);
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
  const getSuggestedTutors = useCallback(async (subjectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await classService.getSuggestedTutors(subjectId);
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

  // Mời gia sư
  const inviteTutor = useCallback(async (classId: string, tutorId: string) => {
    setLoading(true);
    setError(null);
    try {
      await classService.inviteTutor(classId, tutorId);
      setLoading(false);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi mời gia sư';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  }, []);

  // Duyệt ứng tuyển
  const approveApplication = useCallback(async (classId: string, applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await classService.approveApplication(classId, applicationId);
      setLoading(false);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Lỗi khi duyệt ứng tuyển';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  }, []);
  // sửa thông tin lớp học
  const updateClass = async (
    classId: string,
    classData: {
      description: string | null;
      requirement: string | null;
      hourly_price: number;
    }
  ) => {
    try {
      const response = await classService.updateClass(classId, classData);
      console.log('dữ liệu backend trả về sau khi sửa thông tin', response);
      return response;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin lớp học:', error);
      throw error;
    }
  };
  //hủy lớp học
  const cancelClass = async (classId: string, cancellationReason: string) => {
    try {
      // ✅ Validation frontend
      if (!cancellationReason || cancellationReason.trim() === '') {
        throw new Error('Lý do hủy lớp là bắt buộc');
      }
      const response = await classService.cancelClass(classId, cancellationReason.trim());
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
    approveApplication,
    updateClass,
    cancelClass,
  };
};
