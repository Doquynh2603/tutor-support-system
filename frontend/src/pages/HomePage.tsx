/**
 * File: pages/HomePage.tsx
 * Mục đích: Trang chủ của application
 * Vai trò:
 *   - Hiển thị navigation
 *   - Tích hợp search lớp học
 *   - Dashboard gia sư
 */

import DevNavigation from '../components/DevNavigation';

export default function HomePage(): JSX.Element {
  return (
    <>
      <DevNavigation />
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">🎓 Tutor Support System</h1>
      </div>
    </>
  );
}
