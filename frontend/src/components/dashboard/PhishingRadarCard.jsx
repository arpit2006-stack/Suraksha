import { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import { scanUrl } from '../../api/axios';
import { mockScanUrl } from '../../api/mockData';
import { useBilingual } from '../../hooks/useBilingual';
import GhostReconTerminal from './GhostReconTerminal';

const THREAT_THRESHOLD = 70;

export default function PhishingRadarCard({ onHighThreat }) {
  const { t } = useBilingual();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scan = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let data;
      try {
        const res = await scanUrl(trimmed);
        data = res.data;
        if (data.status === 'error') {
          throw new Error(data.reasoning || 'Scan failed');
        }
      } catch (err) {
        console.warn('[scan-url]', err);
        data = { ...mockScanUrl(87), ghost_recon: { title: 'Mock — backend offline', ssl: '—', country: '—', rep: '—' } };
      }
      setResult(data);
      if (data.threat_score > THREAT_THRESHOLD) {
        onHighThreat?.({
          url: trimmed,
          score: data.threat_score,
          brand: data.detected_brand,
          risk: data.risk_level,
          reasoning: data.reasoning,
        });
      }
    } catch (err) {
      setError(err.message || 'Scan failed. Ensure the Python backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dash-card dash-card--radar">
      <header className="dash-card__header">
        <span className="dash-card__emoji">🛡️</span>
        <h2>{t('phishingRadar')}</h2>
      </header>

      <div className="radar-search">
        <Globe size={18} className="radar-search__icon" />
        <input
          type="url"
          className="radar-search__input"
          placeholder={t('scanPlaceholder')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && scan()}
        />
        <button type="button" className="btn btn--primary btn--sm" onClick={scan} disabled={loading || !url.trim()}>
          {loading ? <span className="spinner" /> : <><Search size={14} /> {t('scanBtn')}</>}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="radar-body">
        <GhostReconTerminal recon={result?.ghost_recon} loading={loading} threatScore={result?.threat_score} />
        {result && (
          <div className="radar-score">
            <div className="radar-score__value" data-risk={result.threat_score > 70 ? 'high' : result.threat_score > 30 ? 'mid' : 'low'}>
              {result.threat_score}
            </div>
            <div className="radar-score__meta">
              <span>{result.detected_brand || '—'}</span>
              <span className={`badge ${result.threat_score > 70 ? 'badge--danger' : result.threat_score > 30 ? 'badge--warning' : 'badge--success'}`}>
                {result.risk_level}
              </span>
            </div>
            <p className="radar-score__reason">{result.reasoning}</p>
          </div>
        )}
      </div>
    </section>
  );
}
