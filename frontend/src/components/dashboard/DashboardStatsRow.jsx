import { ShieldAlert, FileWarning, Activity } from 'lucide-react';
import { useBilingual } from '../../hooks/useBilingual';

export default function DashboardStatsRow({ docTamperingCount, alertCount }) {
  const { t } = useBilingual();

  const stats = [
    {
      key: 'tampering',
      icon: FileWarning,
      label: t('statDocTampering'),
      value: docTamperingCount,
      accent: 'stat-card--danger',
    },
    {
      key: 'alerts',
      icon: ShieldAlert,
      label: t('statLiveAlerts'),
      value: alertCount,
      accent: 'stat-card--warning',
    },
    {
      key: 'monitor',
      icon: Activity,
      label: t('statMonitoring'),
      value: t('statActive'),
      accent: 'stat-card--success',
      isText: true,
    },
  ];

  return (
    <div className="dash-stats-row">
      {stats.map(({ key, icon: Icon, label, value, accent, isText }) => (
        <div key={key} className={`stat-card ${accent}`}>
          <Icon size={20} className="stat-card__icon" />
          <div className="stat-card__body">
            <span className="stat-card__value">{value}</span>
            <span className="stat-card__label">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
