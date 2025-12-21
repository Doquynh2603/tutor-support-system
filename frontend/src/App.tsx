// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import HomePage from './pages/HomePage';
import LoginPageReal from './pages/LoginPageReal';
import ClassDetailPage from './pages/Tutor/ClassDetailPage';
import StudentClassDetailPage from './pages/Student/ClassDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './components/AuthProvider';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPageReal />} />
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['tutor', 'student']}>
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
    </Provider>
  );
};

export default App;
