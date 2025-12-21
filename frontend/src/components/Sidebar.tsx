import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice-real';
import { clearClasses } from '../store/slices/classesSlice';
import { RootState, AppDispatch } from '@/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onTabChange, activeTab }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearClasses());
    navigate('/login', { replace: true });
  };

  const tutorMenu = [
    { id: 'search', label: 'Tìm kiếm lớp', icon: '🔍' },
    { id: 'applications', label: 'Quản lý ứng tuyển', icon: '📋' },
    { id: 'profile', label: 'Hồ sơ', icon: '👤' },
    { id: 'classes', label: 'Quản Lý Lớp Học', icon: '📚' },
  ];

  const studentMenu = [
    { id: 'my-classes', label: 'Quản lý lớp học', icon: '📚' },
    { id: 'create-class', label: 'Tạo lớp mới', icon: '➕' },
    { id: 'profile', label: 'Hồ sơ', icon: '👤' },
    { id: 'favorites', label: 'Gia sư yêu thích', icon: '❤️' },
  ];

  const menuItems = user?.role === 'tutor' ? tutorMenu : studentMenu;

  // ✅ THÊM: Hàm cuộn menu
  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('menu-scroll-container');
    if (container) {
      const scrollAmount = 200;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
        setScrollPosition(container.scrollLeft);
      } else {
        container.scrollLeft += scrollAmount;
        setScrollPosition(container.scrollLeft);
      }
    }
  };

  const handleMenuItemClick = (itemId: string) => {
    console.log('🖱️ Click sidebar:', itemId);
    onTabChange(itemId);
  };

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-white border-r-2 border-gray-800 transition-all duration-300 flex flex-col flex-shrink-0`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center text-2xl"
        title={isOpen ? 'Đóng' : 'Mở'}
      >
        {isOpen ? '▶' : '◀'}
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        {isOpen && <h1 className="text-lg font-bold text-gray-800">TSS</h1>}
      </div>

      {/* ✅ SỬA: Navigation Menu - Với cuộn */}
      <nav className="flex-1 overflow-hidden flex flex-col">
        {isOpen ? (
          // ✅ Chế độ mở - Menu dọc
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={() => handleMenuItemClick('dashboard')}
              className={`w-full text-left px-4 py-3 rounded text-base transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏠 Trang chủ
            </button>

            <hr className="border-gray-300 border-dotted my-2" />

            {isAuthenticated &&
              menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded text-base transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}

            <hr className="border-gray-300 border-dotted my-2" />

            {isAuthenticated && (
              <button
                onClick={() => handleMenuItemClick('notifications')}
                className={`w-full text-left px-4 py-3 rounded text-base transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                📬 Thông báo
              </button>
            )}
          </div>
        ) : (
          // ✅ Chế độ đóng - Menu ngang với scroll
          <div className="flex flex-col items-center justify-between flex-1 p-2">
            {/* Scroll Container */}
            <div className="flex flex-col gap-2 w-full">
              {/* Nút cuộn lên */}
              <button
                onClick={() => handleScroll('left')}
                className="w-full p-2 hover:bg-gray-100 rounded transition text-gray-600"
                title="Cuộn lên"
              >
                <ChevronLeft className="w-5 h-5 mx-auto" />
              </button>

              {/* Menu Items Container - Scrollable */}
              <div
                id="menu-scroll-container"
                className="flex flex-col gap-2 overflow-y-auto max-h-64 w-full px-2 scrollbar-hide"
              >
                <button
                  onClick={() => handleMenuItemClick('dashboard')}
                  className={`p-3 rounded-lg transition-colors flex justify-center text-lg ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Trang chủ"
                >
                  🏠
                </button>

                {isAuthenticated &&
                  menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className={`p-3 rounded-lg transition-colors flex justify-center text-lg ${
                        activeTab === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={item.label}
                    >
                      {item.icon}
                    </button>
                  ))}

                {isAuthenticated && (
                  <button
                    onClick={() => handleMenuItemClick('notifications')}
                    className={`p-3 rounded-lg transition-colors flex justify-center text-lg ${
                      activeTab === 'notifications'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Thông báo"
                  >
                    📬
                  </button>
                )}
              </div>

              {/* Nút cuộn xuống */}
              <button
                onClick={() => handleScroll('right')}
                className="w-full p-2 hover:bg-gray-100 rounded transition text-gray-600"
                title="Cuộn xuống"
              >
                <ChevronRight className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ✅ GIỮ NGUYÊN: User Info - Dưới cùng */}
      {isOpen && user && isAuthenticated && (
        <div className="p-4 border-t-2 border-gray-800 relative">
          {/* Button trigger menu */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </button>

          {/* ✅ SỬA: Dropdown menu - KHÔNG PHẢI button, là div */}
          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  onTabChange('profile');
                  setShowUserMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors"
              >
                👤 Tài khoản
              </button>
              <button
                onClick={() => {
                  onTabChange('notifications');
                  setShowUserMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                🔔 Thông báo
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200 rounded-b-lg transition-colors"
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
