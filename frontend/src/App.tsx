// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store, { RootState } from './store';
import HomePage from './pages/HomePage';
import LoginPageReal from './pages/LoginPageReal';
import ClassDetailPage from './pages/Tutor/ClassDetailPage';
import StudentClassDetailPage from './pages/Student/ClassDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './components/AuthProvider';
import { useEffect } from 'react';
import socketService from './services/socketService';
// ✅ THÊM: Inner component để sử dụng Redux hook
const AppContent: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  // ✅ THÊM: Connect socket khi user authenticate
  useEffect(() => {
    if (!isAuthenticated || !user?.user_id) {
      console.log('⏳ [App] Waiting for authentication...');
      return;
    }

    console.log(`🔌 [App] User authenticated, connecting socket...`);

    try {
      const token = localStorage.getItem('token') || '';
      const socket = socketService.connect(token, user.user_id);

      // ✅ Emit authenticate event ngay khi connect
      if (socket && socket.connected) {
        socket.emit('authenticate', user.user_id);
        console.log(`📍 [App] Sent authenticate for user ${user.user_id}`);
      } else {
        socket?.once('connect', () => {
          socket.emit('authenticate', user.user_id);
          console.log(`📍 [App] Sent authenticate for user ${user.user_id}`);
        });
      }
    } catch (error) {
      console.error('❌ [App] Error connecting socket:', error);
    }

    // ✅ Don't disconnect on unmount - keep connection alive
    return () => {
      // socketService.disconnect() // ❌ KHÔNG gọi disconnect
    };
  }, [isAuthenticated, user?.user_id]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPageReal />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          {/* Detail Pages - Giữ lại vì cần đi sâu vào chi tiết */}
          <Route
            path="/search/classes"
            element={
              <ProtectedRoute allowedRoles={['tutor']}>
                <ClassDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/class-detail"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentClassDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};
export default App;
