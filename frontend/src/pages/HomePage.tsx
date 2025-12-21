/**
 * File: pages/HomePage.tsx
 * Mục đích: Trang chủ của application
 * Vai trò:
 *   - Hiển thị navigation
 *   - Tích hợp search lớp học
 *   - Dashboard gia sư
 *   - Hiển thị thông báo
 */

/**
 * File: pages/HomePage.tsx
 * Mục đích: Trang chủ của application
 * Vai trò:
 *   - Hiển thị navigation
 *   - Tích hợp search lớp học
 *   - Dashboard gia sư
 *   - Hiển thị thông báo
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import NotificationsSection from '../components/Notifications/NotificationSession';
import SearchPage from './Tutor/SearchPage';
import ManageApplicationsPage from './Tutor/ManageApplicationsPage';
import TutorProfileManager from '../components/TutorProfile/TutorProfileManager';
import TutorClassesList from '../components/TutorClasses/TutorClassesList';
import StudentProfileManager from '../components/StudentProfile/StudentProfileManager';
import CreateClassPage from '../components/Student/CreateClassPage';
import ManageClassesPage from './Student/ManageClassesPage';
import FavoritesPage from './Student/FavoritesPage';
import ClassDetailPage from './Tutor/ClassDetailPage';

type TabType =
  | 'dashboard'
  | 'search'
  | 'applications'
  | 'profile'
  | 'classes'
  | 'notifications'
  | 'create-class'
  | 'my-classes'
  | 'favorites'
  | 'class-detail';

export default function HomePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'dashboard');

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  React.useEffect(() => {
    console.log('📊 activeTab changed:', activeTab);
  }, [activeTab]);
  const handleTabChange = (tab: string) => {
    console.log('📌 handleTabChange called:', tab);
    const newTab = tab as TabType;
    setActiveTab(newTab);
    // ✅ FIX: Luôn cập nhật URL để trigger re-render,
    // ngay cả khi activeTab đã bằng giá trị mới
    setSearchParams({ tab: newTab });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage onTabChange={handleTabChange} />;
      case 'applications':
        return <ManageApplicationsPage onTabChange={handleTabChange} />;
      case 'profile':
        return user?.role === 'tutor' ? <TutorProfileManager /> : <StudentProfileManager />;
      case 'classes':
        // ✅ THÊM: Truyền onTabChange callback
        return user?.role === 'tutor' ? (
          <TutorClassesList />
        ) : (
          <ManageClassesPage onTabChange={handleTabChange} />
        );
      case 'create-class':
        return <CreateClassPage />;
      case 'my-classes':
        return <ManageClassesPage onTabChange={handleTabChange} />;
      case 'favorites':
        return <FavoritesPage />;
      case 'notifications':
        return <NotificationsSection />;
      case 'class-detail':
        return <ClassDetailPage onTabChange={handleTabChange} />;
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
      {/* Header cố định */}
      <Header onTabChange={handleTabChange} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar onTabChange={handleTabChange} activeTab={activeTab} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-8 bg-gray-50">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
