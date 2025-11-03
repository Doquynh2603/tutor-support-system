/**
 * File: App.jsx
 * Mục đích: Root component của application
 * Vai trò:
 *   - Setup các providers (Redux, React Query, Router)
 *   - Định nghĩa routing structure
 * Lưu ý:
 *   - Thứ tự providers: Redux → React Query → Router
 *   - React Query config: refetchOnWindowFocus = false, retry = 1
 *   - Cần cài đặt dependencies trước: react-router-dom, @tanstack/react-query, react-redux
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import HomePage from './pages/HomePage';
import LoginPageReal from './pages/LoginPageReal';
// Import tutor profile components cho development
import TutorProfileManager from './components/TutorProfile/TutorProfileManager';
// Import tutor classes component
import { TutorClassesList } from './components/TutorClasses';
import TutorApplicationsPage from './pages/TutorApplicationsPage';

// Cấu hình React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không refetch khi focus window
      retry: 1, // Chỉ retry 1 lần khi fail
    },
  },
});

// Import các components cần thiết
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './components/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPageReal />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <TutorProfileManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/classes"
                  element={
                    <ProtectedRoute>
                      <TutorClassesList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute>
                      <TutorApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile-manager"
                  element={
                    <ProtectedRoute>
                      <TutorProfileManager />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
