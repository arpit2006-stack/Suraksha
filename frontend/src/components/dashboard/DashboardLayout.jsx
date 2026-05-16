import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dash-shell">
      <Sidebar onLogout={handleLogout} />
      <div className="dash-main">
        <Topbar />
        <div className="dash-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
