/**
 * Login Page Component - Real Authentication
 * Form đăng nhập với validation và kết nối SQL Server
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  clearError,
} from '../store/slices/authSlice-real';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert } from '../components/ui/alert';

const LoginPageReal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isDevMode, setIsDevMode] = useState(false);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error khi component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      // Error handled by Redux
      console.error('Login failed:', error);
    }
  };

  const handleDevLogin = () => {
    // Xóa mock login, bây giờ bắt buộc phải login bằng real credentials
    console.warn('⚠️ Mock login bị vô hiệu hóa - vui lòng sử dụng real credentials');
    // dispatch(setMockUser());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập hệ thống gia sư
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vui lòng nhập thông tin đăng nhập
          </p>
        </div>

        <Card className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email của bạn"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          {/* Development mode toggle */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={isDevMode}
                  onChange={(e) => setIsDevMode(e.target.checked)}
                  className="mr-2"
                />
                Development Mode
              </label>
            </div>

            {isDevMode && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={handleDevLogin}
              >
                Mock Login (Tutor)
              </Button>
            )}
          </div>

          {/* Sample accounts info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800 font-medium">Tài khoản mẫu từ Database:</p>
            <div className="text-xs text-blue-600 mt-1">
              <p>Email: tutor1@example.com</p>
              <p>Password: $2a$10$hash3 (Lê Văn Cường)</p>
              <p>Email: student1@example.com</p>
              <p>Password: $2a$10$hash1 (Nguyễn Văn An)</p>
              <p className="text-gray-500 mt-1">(Dữ liệu từ SQL Server Database)</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPageReal;
