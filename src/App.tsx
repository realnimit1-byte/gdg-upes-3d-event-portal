import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminRouteGuard, StudentRouteGuard } from './components/Auth/RouteGuards';
import { HomePage } from './pages/Home/HomePage';
import { EventsPage } from './pages/Events/EventsPage';
import { StudentLoginPage } from './pages/Student/StudentLoginPage';
import { StudentSignupPage } from './pages/Student/StudentSignupPage';
import { StudentDashboardPage } from './pages/Student/StudentDashboardPage';
import { StudentRegisterPage } from './pages/Student/StudentRegisterPage';
import { StudentRegistrationsPage } from './pages/Student/StudentRegistrationsPage';
import { AdminLoginPage } from './pages/Admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { AdminEventsPage } from './pages/Admin/AdminEventsPage';
import { AdminParticipantsPage } from './pages/Admin/AdminParticipantsPage';
import { AdminSettingsPage } from './pages/Admin/AdminSettingsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Showcase & Event Discovery */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/register" element={<Navigate to="/student/register" replace />} />

          {/* Student Portal */}
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/student/signup" element={<StudentSignupPage />} />
          <Route
            path="/student/dashboard"
            element={
              <StudentRouteGuard>
                <StudentDashboardPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="/student/register"
            element={
              <StudentRouteGuard>
                <StudentRegisterPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="/student/register/:eventId"
            element={
              <StudentRouteGuard>
                <StudentRegisterPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="/student/registrations"
            element={
              <StudentRouteGuard>
                <StudentRegistrationsPage />
              </StudentRouteGuard>
            }
          />

          {/* Admin Portal */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRouteGuard>
                <AdminDashboardPage />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/events"
            element={
              <AdminRouteGuard>
                <AdminEventsPage />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/participants"
            element={
              <AdminRouteGuard>
                <AdminParticipantsPage />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRouteGuard>
                <AdminSettingsPage />
              </AdminRouteGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
