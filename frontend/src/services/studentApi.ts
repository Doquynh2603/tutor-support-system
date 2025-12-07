import { apiService } from './api';
import { StudentProfile } from '@/types';

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
