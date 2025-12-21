import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NotificationsSection from '../components/Notifications/NotificationSession';
import SearchPage from '../pages/Tutor/SearchPage';
import ManageApplicationsPage from '../pages/Tutor/ManageApplicationsPage';
import TutorProfileManager from '../components/TutorProfile/TutorProfileManager';
import TutorClassesList from '../components/TutorClasses/TutorClassesList';
import StudentProfileManager from '../components/StudentProfile/StudentProfileManager';
import CreateClassPage from '../components/Student/CreateClassPage';
import ManageClassesPage from '../pages/Student/ManageClassesPage';
import FavoritesPage from '../pages/Student/FavoritesPage';

type TabType =
  | 'dashboard'
  | 'search'
  | 'applications'
  | 'profile'
  | 'classes'
  | 'notifications'
  | 'create-class'
  | 'my-classes'
  | 'favorites';

export default function HomePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'dashboard');

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setSearchParams({ tab });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'applications':
        return <ManageApplicationsPage />;
      case 'profile':
        return user?.role === 'tutor' ? <TutorProfileManager /> : <StudentProfileManager />;
      case 'classes':
        return user?.role === 'tutor' ? <TutorClassesList /> : <ManageClassesPage />;
      case 'create-class':
        return <CreateClassPage />;
      case 'my-classes':
        return <ManageClassesPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'notifications':
        return <NotificationsSection />;
      case 'dashboard':
      default:
        return (
          <div>
            <h2 className="text-4xl font-bold mb-8 text-gray-800">Chào mừng đến TSS</h2>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600 mb-4">
                Hệ thống hỗ trợ gia sư - Kết nối gia sư và học viên
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">📚 Quản lý lớp học</h3>
                  <p className="text-sm text-blue-700">Tạo và quản lý các lớp học của bạn</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">👥 Kết nối</h3>
                  <p className="text-sm text-green-700">Tìm kiếm và kết nối với gia sư/học viên</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">🔔 Thông báo</h3>
                  <p className="text-sm text-purple-700">Nhận cập nhật về lớp học và ứng tuyển</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header cố định - Phần 2 */}
      <Header />

      {/* Main Content với Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Phần trái */}
        <Sidebar onTabChange={handleTabChange} activeTab={activeTab} />

        {/* Content Area - Phần 1 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-8 bg-gray-50">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
