import { useAuth } from '../../context/AuthContext';
import { useBilingual } from '../../hooks/useBilingual';

export default function Topbar() {
  const { user, initials, designation } = useAuth();
  const { lang, toggleLang, t } = useBilingual();

  return (
    <header className="dash-topbar">
      <div className="dash-topbar__titles">
        <h1>{t('dashboardTitle')}</h1>
        <p>{t('dashboardSubtitle')}</p>
      </div>
      <div className="dash-topbar__actions">
        <span className="dash-status-pill">
          <span className="dash-status-dot" />
          {t('monitoring')}
        </span>
        <button type="button" className="btn btn--outline btn--sm lang-toggle" onClick={toggleLang}>
          {t('langToggle')}
        </button>
        <div className="dash-topbar-user">
          <div className="dash-topbar-user__text">
            <span className="dash-topbar-user__name">{user?.name}</span>
            <span className="dash-topbar-user__role">{designation(lang)}</span>
          </div>
          <div className="dash-avatar dash-avatar--top" title={user?.name}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
