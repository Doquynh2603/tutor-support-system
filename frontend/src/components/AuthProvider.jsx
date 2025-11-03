/**
 * AuthProvider Component
 * Kiểm tra authentication status khi app khởi động
 */

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { verifyUserToken } from '../store/slices/authSlice-real';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      // Kiểm tra xem có token trong localStorage không
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token với server
        dispatch(verifyUserToken());
      }
    } catch (error) {
      console.error('Error in AuthProvider:', error);
    }
  }, [dispatch]);

  return children;
};

export default AuthProvider;
