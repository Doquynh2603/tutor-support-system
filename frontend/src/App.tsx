import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import HomePage from './pages/HomePage';
import LoginPageReal from './pages/LoginPageReal';
import SearchPage from './pages/Tutor/SearchPage';
import ClassDetailPage from './pages/Tutor/ClassDetailPage';
import StudentClassDetailPage from './pages/Student/ClassDetailPage';
import TutorProfileManager from './components/TutorProfile/TutorProfileManager';
import TutorClassesList from './components/TutorClasses/TutorClassesList';
import ManageApplicationsPage from './pages/Tutor/ManageApplicationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './components/AuthProvider';
import StudentProfileManager from './components/StudentProfile/StudentProfileManager';
import CreateClassPage from './components/Student/CreateClassPage';
import ManageClassesPage from './pages/Student/ManageClassesPage';
import ViewTutorsPage from './pages/Student/ViewTutorsPage';

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
            <Route
              path="/student-profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfileManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute allowedRoles={['tutor']}>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search/classes/:classId"
              element={
                <ProtectedRoute allowedRoles={['tutor']}>
                  <ClassDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['tutor']}>
                  <ManageApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['tutor']}>
                  <TutorProfileManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute allowedRoles={['tutor']}>
                  <TutorClassesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/create-class"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CreateClassPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-classes"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ManageClassesPage />
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
            <Route
              path="/student/view-tutors"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ViewTutorsPage />
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
