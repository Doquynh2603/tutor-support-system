import React, { useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyUserToken, selectIsAuthenticated, selectUser } from '../store/slices/authSlice-real';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { useNotificationListener } from '@/hooks/useNotificationListener';
import socketService from '@/services/socketService';
import {
  fetchAllNotifications,
  fetchUnreadCount,
  fetchUnreadNotifications,
} from '@/store/slices/notificationSlice';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state: RootState) => selectUser(state));
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state));

  useNotificationListener();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      console.log('🔄 Verifying token from localStorage...');
      dispatch(verifyUserToken(token)); // token đã chắc chắn là string
    }
  }, [dispatch, user]);

  // ✅ Initialize Socket.IO when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔌 Initializing Socket.IO...');
      const token = localStorage.getItem('token');
      const userId = user.user_id;
      const userRole = user.role;

      socketService.connect(token || '', userId, userRole);

      const timer = setTimeout(() => {
        console.log('📡 Fetching initial notifications...');
        dispatch(fetchAllNotifications());
        dispatch(fetchUnreadCount());
      }, 500); // ✅ Wait 500ms để socket fully connected

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, dispatch]);

  // ✅ Cleanup socket on logout
  useEffect(() => {
    return () => {
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated]);
  // Nếu đã đăng nhập và ở /login thì redirect về HomePage
  useEffect(() => {
    if (isAuthenticated && user && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  return <>{children}</>;
};

export default AuthProvider;
