import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import NotificationBell from './Notifications/NotificationBell';
interface HeaderProps {
  onTabChange?: (tab: string) => void; // ✅ THÊM: callback
}

const Header: React.FC<HeaderProps> = ({ onTabChange }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  React.useEffect(() => {
    console.log('🎓 Header mounted:', {
      onTabChangeExists: !!onTabChange,
      onTabChangeType: typeof onTabChange,
    });
  }, [onTabChange]);
  return (
    <div className="bg-white border-b-2 border-gray-800 px-6 py-4 flex justify-between items-center flex-shrink-0">
      <h1 className="text-2xl font-bold text-gray-800">🎓 Tutor Support System</h1>
      {isAuthenticated && <NotificationBell onTabChange={onTabChange} />}
    </div>
  );
};

export default Header;
