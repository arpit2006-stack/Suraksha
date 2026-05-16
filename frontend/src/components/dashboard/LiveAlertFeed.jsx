import { Zap } from 'lucide-react';
import { useBilingual } from '../../hooks/useBilingual';

export default function LiveAlertFeed({ alerts }) {
  const { t } = useBilingual();

  return (
    <section className="dash-card dash-card--alerts">
      <header className="dash-card__header">
        <Zap size={18} />
        <h2>⚡ {t('liveAlerts')}</h2>
      </header>
      <ul className="alert-feed">
        {alerts.length === 0 ? (
          <li className="alert-feed__empty">{t('noAlerts')}</li>
        ) : (
          alerts.map((a) => (
            <li
              key={a.id}
              className={`alert-feed__item alert-feed__item--${a.variant === 'warning' ? 'warning' : 'danger'}`}
            >
              <span className="alert-feed__time">{a.time}</span>
              <strong>{a.title}</strong>
              <p>{a.message}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
