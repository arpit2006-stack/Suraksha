import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, XCircle, Globe } from 'lucide-react';
import api from '../api/axios';
import { mockScanUrl } from '../api/mockData';
import { useApp } from '../context/AppContext';

// SVG Gauge Chart
function GaugeChart({ score }) {
  const clamp = Math.min(100, Math.max(0, score));
  const radius = 80;
  const cx = 100, cy = 100;
  const startAngle = -180, endAngle = 0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (from, to, r) => {
    const x1 = cx + r * Math.cos(toRad(from));
    const y1 = cy + r * Math.sin(toRad(from));
    const x2 = cx + r * Math.cos(toRad(to));
    const y2 = cy + r * Math.sin(toRad(to));
    const largeArc = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };
  const needleAngle = -180 + (clamp / 100) * 180;
  const nx = cx + (radius - 10) * Math.cos(toRad(needleAngle));
  const ny = cy + (radius - 10) * Math.sin(toRad(needleAngle));

  const color = clamp <= 30 ? '#34A853' : clamp <= 70 ? '#FBBC04' : '#EA4335';
  const riskLabel = clamp <= 30 ? 'SAFE' : clamp <= 70 ? 'WARNING' : 'DANGEROUS';

  return (
    <div className="gauge-wrapper">
      <svg viewBox="0 0 200 120" className="gauge-svg">
        {/* Background arc */}
        <path d={arcPath(-180, 0, radius)} fill="none" stroke="#E8EAED" strokeWidth="18" strokeLinecap="round" />
        {/* Safe zone */}
        <path d={arcPath(-180, -180 + (30 / 100) * 180, radius)} fill="none" stroke="#34A853" strokeWidth="18" strokeOpacity="0.4" />
        {/* Warning zone */}
        <path d={arcPath(-180 + (30/100)*180, -180 + (70/100)*180, radius)} fill="none" stroke="#FBBC04" strokeWidth="18" strokeOpacity="0.4" />
        {/* Danger zone */}
        <path d={arcPath(-180 + (70/100)*180, 0, radius)} fill="none" stroke="#EA4335" strokeWidth="18" strokeOpacity="0.4" />
        {/* Active arc */}
        <path d={arcPath(-180, needleAngle, radius)} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#202124" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#202124" />
        {/* Score text */}
        <text x={cx} y={cy - 20} textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>{clamp}</text>
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="#5F6368">RISK SCORE</text>
        {/* Labels */}
        <text x="22" y="112" fontSize="9" fill="#34A853">Safe</text>
        <text x="87" y="112" fontSize="9" fill="#FBBC04">Warning</text>
        <text x="158" y="112" fontSize="9" fill="#EA4335">Danger</text>
      </svg>
      <div className="gauge-label" style={{ color }}>{riskLabel}</div>
    </div>
  );
}

const riskConfig = {
  Safe:      { icon: CheckCircle,   badgeClass: 'badge--success', color: '#34A853' },
  Warning:   { icon: AlertTriangle, badgeClass: 'badge--warning', color: '#FBBC04' },
  Dangerous: { icon: XCircle,       badgeClass: 'badge--danger',  color: '#EA4335' },
};

export default function UrlScanner() {
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const { triggerGuardianAlert } = useApp();

  const scan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/security/scan-url', { url });
      setResult(data);
      if (data.threat_score > 70) triggerGuardianAlert(`Khatranaak URL detect hua! Score: ${data.threat_score}/100. "${url}" kholen mat.`);
    } catch {
      const mock = mockScanUrl(87);
      setResult(mock);
      triggerGuardianAlert(`Khatranaak URL detect hua! Score: 87/100`);
    } finally {
      setLoading(false);
    }
  };

  // Backend returns "High"/"Low"; riskConfig uses "Dangerous"/"Warning"/"Safe"
  const normalizeRisk = (level, score) => {
    if (!level) return score > 70 ? 'Dangerous' : score > 30 ? 'Warning' : 'Safe';
    const l = level.toLowerCase();
    if (l === 'high' || l === 'dangerous') return 'Dangerous';
    if (l === 'medium' || l === 'warning') return 'Warning';
    return 'Safe';
  };

  const cfg = result ? riskConfig[normalizeRisk(result.risk_level, result.threat_score)] : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Phishing Radar — URL Scanner</h1>
        <p className="page-subtitle">
          Kisi bhi URL ka real-time AI analysis karein. Gemini AI phishing, spoofing aur financial fraud patterns detect karta hai.
        </p>
      </div>

      {/* Search Bar */}
      <div className="card search-card">
        <div className="search-bar">
          <Globe size={20} className="search-icon" />
          <input
            type="url"
            className="search-input"
            placeholder="URL enter karein — jaise https://hdfc-secure-login.ru/auth"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && scan()}
          />
          <button className="btn btn--primary search-btn" onClick={scan} disabled={loading || !url.trim()}>
            {loading ? <span className="loading-row"><span className="spinner" /> Scanning...</span> : <><Search size={16} /> Scan URL</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="scanner-result-layout"
          >
            {/* Gauge */}
            <div className="card gauge-card">
              <GaugeChart score={result.threat_score} />
              <div className="gauge-meta">
                <div className="gauge-meta__row">
                  <span>Detected Brand</span>
                  <strong>{result.detected_brand}</strong>
                </div>
                <div className="gauge-meta__row">
                  <span>Risk Level</span>
                  <span className={`badge ${cfg.badgeClass}`}>{result.risk_level}</span>
                </div>
                <div className="gauge-meta__row">
                  <span>Threats</span>
                  <div className="threat-tags">
                    {result.threat_types.map((t) => (
                      <span key={t} className="badge badge--danger badge--xs">{t}</span>
                    ))}
                  </div>
                </div>
                {result.domain_info && (
                  <>
                    <div className="gauge-meta__row"><span>Registrar</span><span>{result.domain_info.registrar}</span></div>
                    <div className="gauge-meta__row"><span>Country</span><span>{result.domain_info.country}</span></div>
                    <div className="gauge-meta__row"><span>Registered</span><span>{result.domain_info.created}</span></div>
                  </>
                )}
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="card reasoning-card">
              <div className="card__header">
                <span>🤖</span>
                <span>Gemini AI Analysis</span>
              </div>
              <p className="reasoning-text">{result.reasoning}</p>
              <div className="reasoning-footer">
                <cfg.icon size={16} color={cfg.color} />
                <span style={{ color: cfg.color }}>
                  Verdict: {result.risk_level.toUpperCase()} — Threat Score {result.threat_score}/100
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
