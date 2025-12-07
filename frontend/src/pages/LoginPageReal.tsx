/**
 * Login Page Component - Real Authentication
 * Form đăng nhập với validation và kết nối SQL Server
 */

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AppDispatch, RootState } from '../store'; // Thêm import type của Redux store nếu có

interface FormData {
  email: string;
  password: string;
}

const LoginPageReal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector<RootState, boolean>(selectAuthLoading);
  const error = useSelector<RootState, string | null>(selectAuthError);
  const isAuthenticated = useSelector<RootState, boolean>(selectIsAuthenticated);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [isDevMode, setIsDevMode] = useState<boolean>(false);

  // Redirect nếu đã đăng nhập - luôn về trang chủ
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear error khi component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) return;

    try {
      await dispatch(loginUser(formData)).unwrap();
      // Navigation handled by useEffect when isAuthenticated changes
    } catch (err) {
      console.error('Login failed:', err);
    }
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
