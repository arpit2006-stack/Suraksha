import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnderwriterDashboard from './pages/UnderwriterDashboard';
import UserDashboard from './pages/UserDashboard';

import GuardianAlert from './components/GuardianAlert';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/customer"
              element={
                <ProtectedRoute requireInternal={false}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireInternal>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<UnderwriterDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <GuardianAlert />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
