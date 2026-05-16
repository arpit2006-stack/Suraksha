import { Target } from 'lucide-react';
import { useBilingual } from '../../hooks/useBilingual';

export default function TopRiskPanel({ risks }) {
  const { t } = useBilingual();

  return (
    <section className="dash-card dash-card--risks">
      <header className="dash-card__header">
        <Target size={18} />
        <h2>🎯 {t('topRisk')}</h2>
      </header>
      <ul className="risk-list">
        {risks.length === 0 ? (
          <li className="risk-list__empty">{t('noRisks')}</li>
        ) : (
          risks.map((r) => (
            <li key={r.id} className="risk-list__item">
              <div className="risk-list__score">{r.score}</div>
              <div className="risk-list__body">
                <code className="risk-list__url">{r.url}</code>
                <span>{r.brand} · {r.risk}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
