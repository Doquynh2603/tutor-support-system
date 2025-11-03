/**
 * File: components/DevNavigation.jsx
 * Mục đích: Navigation component cho development
 * Vai trò:
 *   - Dễ dàng điều hướng giữa các trang trong development
 *   - Test các chức năng mà không cần login
 */

import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DevNavigation = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <nav className="bg-blue-600 text-white p-4 mb-6">
      <div className="container mx-auto">
        <h1 className="text-xl font-bold mb-4">Tutor Support System - Development</h1>

        {/* User Info */}
        <div className="mb-4 p-3 bg-blue-700 rounded">
          <p className="text-sm">
            <strong>User:</strong> {user?.name} (ID: {user?.id})
            <span
              className={`ml-2 px-2 py-1 rounded text-xs ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </p>
          <p className="text-sm">
            <strong>Role:</strong> {user?.role}
          </p>
          <p className="text-sm">
            <strong>Email:</strong> {user?.email}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4">
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded transition-colors"
          >
            🏠 Home
          </Link>

          <Link
            to="/profile"
            className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded transition-colors"
          >
            👤 Tutor Profile Manager
          </Link>

          <Link
            to="/login"
            className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded transition-colors"
          >
            🔐 Login Page
          </Link>

          <Link
            to="/classes"
            className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded transition-colors"
          >
            📚 Quản Lý Lớp Học
          </Link>

          {/* Link to Applications management - only visible to tutors */}
          {user?.role === 'tutor' && (
            <Link
              to="/applications"
              className="bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded transition-colors"
            >
              🧾 Quản lý Ứng Tuyển
            </Link>
          )}

          {/* API Status */}
          <div className="bg-gray-600 px-4 py-2 rounded">
            <span className="text-xs">API: localhost:5000</span>
          </div>
        </div>

        <div className="mt-4 text-sm text-blue-200">
          💡 <strong>Development Mode:</strong> Authentication được mock, API calls sử dụng user ID
          = 1
        </div>
      </div>
    </nav>
  );
};

export default DevNavigation;
