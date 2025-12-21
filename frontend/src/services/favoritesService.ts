import { apiService } from './api';
import { FavoritesTutor } from '../types';
export const favoritesAPI = {
  getFavorites: async (): Promise<FavoritesTutor[]> => {
    const response = await apiService.get('student/favorites');
    console.log('Fetched favorites response:', response);
    console.log('Type of response:', typeof response, Array.isArray(response));

    // ✅ FIX: apiService trả về data trực tiếp, không phải response object
    const favorites = Array.isArray(response) ? response : response?.data || [];
    console.log('Extracted favorites:', favorites);

    return favorites;
  },

  addFavorite: async (tutorId: string): Promise<FavoritesTutor> => {
    const response = await apiService.post('student/favorites', { tutor_id: tutorId });
    return response.data || [];
  },

  removeFavorite: async (tutorId: string): Promise<void> => {
    await apiService.delete('student/favorites', { tutor_id: tutorId });
  },
};
