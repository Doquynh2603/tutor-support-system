import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice-real';
import { clearClasses } from '../store/slices/classesSlice';
import { RootState, AppDispatch } from '../store';

const DevNavigation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearClasses());
    navigate('/login', { replace: true });
  };

  const tutorMenu = (
    <>
      <Link
        to="/search"
        className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded transition-colors"
      >
        🔍 Tìm kiếm lớp
      </Link>
      <Link
        to="/applications"
        className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded transition-colors"
      >
        📋 Quản lý ứng tuyển
      </Link>
      <Link
        to="/profile"
        className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded transition-colors"
      >
        👤 Hồ sơ
      </Link>
      <Link
        to="/classes"
        className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded transition-colors"
      >
        📚 Quản Lý Lớp Học
      </Link>
    </>
  );

  const studentMenu = (
    <>
      <Link
        to="/student/my-classes"
        className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded transition-colors"
      >
        📚 Quản lý lớp học
      </Link>
      <Link
        to="/student/create-class"
        className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded transition-colors"
      >
        ➕ Tạo lớp mới
      </Link>
      <Link
        to="/student-profile"
        className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded transition-colors"
      >
        👤 Hồ sơ
      </Link>
    </>
  );

  return (
    <nav className="bg-blue-600 text-white p-4 mb-6">
      <div className="container mx-auto">
        <h1 className="text-xl font-bold mb-4">Tutor Support System</h1>

        {user && (
          <div className="mb-4 p-3 bg-blue-700 rounded">
            <p className="text-sm">
              <strong>Người dùng:</strong> {user.name} (ID: {user.user_id})
              <span
                className={`ml-2 px-2 py-1 rounded text-xs ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}
              >
                {isAuthenticated ? '✅ Đã đăng nhập' : '❌ Chưa đăng nhập'}
              </span>
            </p>
            <p className="text-sm">
              <strong>Vai trò:</strong>{' '}
              {user.role === 'tutor'
                ? '👨‍🏫 Gia sư'
                : user.role === 'student'
                  ? '👨‍🎓 Học viên'
                  : '❓ Không xác định'}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded transition-colors"
          >
            🏠 Trang chủ
          </Link>

          {isAuthenticated && user?.role === 'tutor' && tutorMenu}
          {isAuthenticated && user?.role === 'student' && studentMenu}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded transition-colors"
            >
              🚪 Đăng xuất
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded transition-colors"
            >
              🔐 Đăng nhập
            </Link>
          )}
        </div>

        {isAuthenticated && (
          <div className="mt-4 text-sm text-blue-200">
            ✅ <strong>Đã xác thực:</strong> Token được lưu trong localStorage
          </div>
        )}
      </div>
    </nav>
  );
};

export default DevNavigation;
