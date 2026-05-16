import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBilingual } from '../../hooks/useBilingual';

export default function Sidebar({ onLogout }) {
  const { user, initials, designation } = useAuth();
  const { lang, t } = useBilingual();

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar__brand">
        <Shield size={26} />
        <div>
          <span className="dash-sidebar__title">SuRaksha</span>
          <span className="dash-sidebar__sub">Canara Bank</span>
        </div>
      </div>

      <nav className="dash-sidebar__nav">
        <NavLink to="/dashboard" end className={({ isActive }) => `dash-nav-link${isActive ? ' dash-nav-link--active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>{lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</span>
        </NavLink>
      </nav>

      <div className="dash-sidebar__footer">
        <div className="dash-user-card">
          <div className="dash-avatar" title={user?.name}>{initials}</div>
          <div className="dash-user-card__meta">
            <span className="dash-user-card__name">{user?.name}</span>
            <span className="dash-user-card__role">{designation(lang)}</span>
          </div>
        </div>
        <button type="button" className="dash-logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
