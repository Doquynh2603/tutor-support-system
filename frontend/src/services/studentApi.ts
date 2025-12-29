import { apiService } from './api';
import { CreateClassPayload, StudentProfile } from '@/types';

export interface UpdateStudentProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  locationDetail?: string;
  dateOfBirth?: string;
  address_id?: number | string;
  gradeLevel?: number | string;
  school?: string;
  province_id?: number | string;
  [key: string]: any;
}

export const studentAPI = {
  getStudentProfile: async (): Promise<StudentProfile> => {
    return apiService.get('/student/profile');
  },

  updateStudentProfile: async (profileData: UpdateStudentProfileData): Promise<StudentProfile> => {
    return apiService.put('/student/profile', profileData);
  },
};

export const classAPI = {
  createClass: (data: CreateClassPayload) => apiService.post('/student/class', data),
  getMyClasses: (status?: string) => {
    const params = status ? { status } : {};
    return apiService.get('/student/class', params);
  },
  getClassDetails: (classId: string) => apiService.get(`/student/class/${classId}`),
  getSuggestedTutors: (classId: string) =>
    apiService.get(`/student/class/${classId}/suggested-tutors`),
  getApplicationsByClass: (classId: string) =>
    apiService.get(`/student/class/${classId}/applications`),

  // ✅ THÊM: Lấy chi tiết gia sư
  getTutorDetail: (tutorId: string, classId: string) =>
    apiService.post(`/student/tutor/${tutorId}/detail`, { class_id: classId }),

  inviteTutor: (classId: string, tutorUserId: string) =>
    apiService.post(`/student/class/${classId}/invite`, { tutor_id: tutorUserId }),
  approveApplication: (classId: string, applicationId: string) =>
    apiService.post(`/student/class/${classId}/approve`, { application_id: applicationId }),
  reviewApplication: (
    applicationId: string,
    action: 'approve' | 'reject',
    rejecttionReason?: string
  ) =>
    apiService.post(`/student/application/${applicationId}/review`, {
      application_id: applicationId,
      action,
      rejection_reason: rejecttionReason,
    }),
  updateClass: (
    classId: string,
    data: {
      description: string | null;
      requirement: string | null;
      hourly_price: number;
    }
  ) => apiService.put(`/student/class/${classId}`, data),
  cancelClass: (classId: string, cancellationReason: string) =>
    apiService.patch(`/student/class/${classId}`, {
      cancellation_reason: cancellationReason,
    }),
};
