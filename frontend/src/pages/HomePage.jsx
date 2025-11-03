/**
 * File: pages/HomePage.jsx
 * Mục đích: Trang chủ của application
 * Vai trò:
 *   - Hiển thị navigation
 *   - Tích hợp search lớp học
 *   - Dashboard gia sư
 */

import DevNavigation from '../components/DevNavigation';
import SimpleSearchSection from '../components/Search/SimpleSearchSection';

export default function HomePage() {
  return (
    <>
      <DevNavigation />
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">🎓 Tutor Support System</h1>
        <SimpleSearchSection />
      </div>
    </>
  );
}
