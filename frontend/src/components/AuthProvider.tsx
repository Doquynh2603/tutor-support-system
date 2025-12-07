import React, { useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyUserToken, selectIsAuthenticated, selectUser } from '../store/slices/authSlice-real';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state: RootState) => selectUser(state));
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      console.log('🔄 Verifying token from localStorage...');
      dispatch(verifyUserToken(token)); // token đã chắc chắn là string
    }
  }, [dispatch, user]);
  // Nếu đã đăng nhập và ở /login thì redirect về HomePage
  useEffect(() => {
    if (isAuthenticated && user && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  return <>{children}</>;
};

export default AuthProvider;
