import { useState } from 'react';
import { studentApplicationAPI } from '@/services/api';
import { TutorProfile, ClassDetail, Schedule } from '@/types';

export interface Application extends TutorProfile {
  application_id: string;
  class_id: string;
  tutor_id: string;
  status: string;
  applied_at: string;
  approved_at?: string;
  schedule_conflict?: boolean;
}

export interface TutorDetailForApproval {
  tutor: TutorProfile & {
    certifications?: string;
    specialties?: string;
  };
  schedules: Array<
    Schedule & {
      subject_name: string;
    }
  >;
  classes_taught: Array<
    ClassDetail & {
      average_rating: number;
      total_reviews: number;
      comments?: string;
    }
  >;
}

export const useApplications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Lấy danh sách gia sư ứng tuyển
  const getApplicationsByClass = async (classId: string): Promise<Application[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentApplicationAPI.getApplicationsByClass(classId);
      console.log('✅ Applications loaded:', data);
      return data;
    } catch (err: any) {
      const message = err.message || 'Lỗi khi lấy danh sách gia sư';
      setError(message);
      console.error('❌ Error loading applications:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lấy chi tiết gia sư
  const getTutorDetail = async (
    tutorId: string,
    classId: string
  ): Promise<TutorDetailForApproval> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 getTutorDetail called with:', { tutorId, classId }); // ✅ Log
      const data = await studentApplicationAPI.getTutorDetail(tutorId, classId);
      console.log('✅ Tutor detail loaded:', data);
      return data;
    } catch (err: any) {
      const message = err.message || 'Lỗi khi lấy chi tiết gia sư';
      setError(message);
      console.error('❌ Error loading tutor detail:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Duyệt/Từ chối gia sư
  const reviewApplication = async (
    applicationId: string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentApplicationAPI.reviewApplication(
        applicationId,
        action,
        rejectionReason
      );
      console.log(`✅ Application ${action}ed:`, data);
      return data;
    } catch (err: any) {
      const message = err.message || `Lỗi khi ${action === 'approve' ? 'duyệt' : 'từ chối'} gia sư`;
      setError(message);
      console.error(`❌ Error ${action}ing application:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getApplicationsByClass,
    getTutorDetail,
    reviewApplication,
  };
};
