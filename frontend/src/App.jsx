import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import UnderwriterDashboard from './pages/UnderwriterDashboard';
import CustomerDashboardStub from './pages/CustomerDashboardStub';
import BypassPage from './pages/BypassPage';
import GuardianAlert from './components/GuardianAlert';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/bypass/:code" element={<BypassPage />} />
            <Route path="/bypass" element={<BypassPage />} />
            <Route path="/customer" element={<CustomerDashboardStub />} />

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
