import { apiService } from './api';
import { TutorProfile, UpdateTutorProfilePayload } from '../types';

export interface TutorSubject {
  id: string;
  name: string;
}

export const tutorProfileAPI = {
  getProfile: async (): Promise<TutorProfile> => {
    return apiService.get('/tutor/profile');
  },

  updateProfile: async (data: UpdateTutorProfilePayload): Promise<TutorProfile> => {
    return apiService.put('/tutor/profile', data);
  },

  getSubjects: async (): Promise<TutorSubject[]> => {
    return apiService.get('/tutor/subjects');
  },

  updateSubjects: async (subjects: TutorSubject[]): Promise<TutorSubject[]> => {
    return apiService.put('/tutor/subjects', { subjects });
  },
};
