const API_URL = 'http://localhost:5000/api';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FavoritesTutor } from '@/types';
import { favoritesAPI } from '@/services/favoritesService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoritesTutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sánh gia sư yêu thích của học viên
  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await favoritesAPI.getFavorites();
      console.log('danh sách gia sư yêu thích của học viên lấy được từ backend: ', response);
      setFavorites(response); // ✅ Đơn giản hóa, vì response đã là array
    } catch (error: any) {
      setError(error.message || 'Lấy danh sách yêu thích thất bại');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  //Thêm gia sư vào danh sách yêu thích
  const addFavorite = async (tutorId: string) => {
    try {
      await favoritesAPI.addFavorite(tutorId);
      console.log('dữ liệu backend trả về khi thêm gia sư vào danh sách yêu thích');
      // ✅ RELOAD LIST THAY VÌ PUSH (vì backend không trả về object mới)
      await fetchFavorites();
      return true;
    } catch (error) {
      setError((error as Error).message || 'Thêm vào danh sách yêu thích thất bại');
      return false;
    }
  };

  // Xóa gia sư khỏi danh sách yêu thích
  const removeFavorite = async (tutorId: string) => {
    try {
      await favoritesAPI.removeFavorite(tutorId);
      console.log('dữ liệu backend trả về khi xóa gia sư khỏi danh sách yêu thích');
      // ✅ RELOAD LIST THAY VÌ FILTER (để đảm bảo sync với backend)
      await fetchFavorites();
      return true;
    } catch (error) {
      setError((error as Error).message || 'Xóa khỏi danh sách yêu thích thất bại');
      return false;
    }
  };
  // Kiểm tra tutor có trong favorites không
  const isFavorite = (tutorId: string) => {
    return favorites.some((fav) => fav.tutor_id === tutorId);
  };

  // Toggle favorite
  const toggleFavorite = async (tutorId: string) => {
    if (isFavorite(tutorId)) {
      return await removeFavorite(tutorId);
    } else {
      return await addFavorite(tutorId);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);
  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
