import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectUser,
} from '../store/slices/authSlice-real';
import { log } from 'console';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const user = useSelector(selectUser);
  const location = useLocation();
  console.log('ProtectedRoute render:', user);
  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang kiểm tra đăng nhập...</span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role!)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">403 - Forbidden</h1>
          <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-gray-500">
            Vai trò của bạn: <span className="font-mono bg-gray-100 px-2 py-1">{user.role}</span>
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
