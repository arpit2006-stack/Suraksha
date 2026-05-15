import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, XCircle, Globe, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { useApp } from '../context/AppContext';

// SVG Gauge Chart Component
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
        <path d={arcPath(-180, 0, radius)} fill="none" stroke="#E8EAED" strokeWidth="18" strokeLinecap="round" />
        <path d={arcPath(-180, -180 + (30 / 100) * 180, radius)} fill="none" stroke="#34A853" strokeWidth="18" strokeOpacity="0.4" />
        <path d={arcPath(-180 + (30/100)*180, -180 + (70/100)*180, radius)} fill="none" stroke="#FBBC04" strokeWidth="18" strokeOpacity="0.4" />
        <path d={arcPath(-180 + (70/100)*180, 0, radius)} fill="none" stroke="#EA4335" strokeWidth="18" strokeOpacity="0.4" />
        <path d={arcPath(-180, needleAngle, radius)} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#202124" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#202124" />
        <text x={cx} y={cy - 20} textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>{clamp}</text>
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="#5F6368">RISK SCORE</text>
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
      // Backend Call
      const { data } = await api.post('/security/scan-url', { url });
      setResult(data);
      
      if (data.threat_score > 70) {
        triggerGuardianAlert(`Danger! Phishing detected at ${url}. Threat Score: ${data.threat_score}/100.`);
      }
    } catch (err) {
      console.error("Scan Error:", err);
      // Fallback message
      triggerGuardianAlert(`Error connecting to AI Radar. Please check backend.`);
    } finally {
      setLoading(false);
    }
  };

  // Maps backend strings to frontend config keys
  const normalizeRisk = (level, score) => {
    if (!level) return score > 70 ? 'Dangerous' : score > 30 ? 'Warning' : 'Safe';
    const l = level.toLowerCase();
    if (l.includes('high') || l.includes('dangerous')) return 'Dangerous';
    if (l.includes('low') || l.includes('medium') || l.includes('warning')) return 'Warning';
    return 'Safe';
  };

  const currentRisk = result ? normalizeRisk(result.risk_level, result.threat_score) : 'Safe';
  const cfg = riskConfig[currentRisk];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Phishing Radar — URL Scanner</h1>
        <p className="page-subtitle">
          Real-time AI analysis of URLs. Gemini 2.5 detects patterns of financial fraud and brand spoofing.
        </p>
      </div>

      {/* Search Input Area */}
      <div className="card search-card">
        <div className="search-bar">
          <Globe size={20} className="search-icon" />
          <input
            type="url"
            className="search-input"
            placeholder="URL enter karein (e.g., https://bank.sbi or hdfc-net.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && scan()}
          />
          <button className="btn btn--primary search-btn" onClick={scan} disabled={loading || !url.trim()}>
            {loading ? <span className="loading-row"><span className="spinner" /> Analyzing...</span> : <><Search size={16} /> Scan URL</>}
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
            {/* Left Column: Gauge and Data */}
            <div className="card gauge-card">
              <GaugeChart score={result.threat_score || 0} />
              
              <div className="gauge-meta">
                <div className="gauge-meta__row">
                  <span>Detected Brand</span>
                  <strong>{result.detected_brand || "Generic / None"}</strong>
                </div>
                <div className="gauge-meta__row">
                  <span>Risk Level</span>
                  <span className={`badge ${cfg.badgeClass}`}>{result.risk_level}</span>
                </div>
                
                {/* SAFE CHECK for .map() crash */}
                <div className="gauge-meta__row">
                  <span>Threats</span>
                  <div className="threat-tags">
                    {result.threat_types?.length > 0 ? (
                      result.threat_types.map((t, idx) => (
                        <span key={idx} className="badge badge--danger badge--xs">{t}</span>
                      ))
                    ) : (
                      <span className="text-muted text-xs">No specific threats</span>
                    )}
                  </div>
                </div>

                {/* Domain Information Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                   <div className="gauge-meta__row">
                     <span>Registrar</span>
                     <span>{result.registrar || "N/A"}</span>
                   </div>
                   <div className="gauge-meta__row">
                     <span>Country</span>
                     <span>{result.country || "N/A"}</span>
                   </div>
                   <div className="gauge-meta__row">
                     <span>Registered Date</span>
                     <span>{result.registered || "N/A"}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Reasoning */}
            <div className="card reasoning-card">
              <div className="card__header">
                <ShieldCheck size={18} className="text-blue-500" />
                <span>Gemini 2.5 Security Report</span>
              </div>
              <div className="reasoning-body">
                <p className="reasoning-text">
                  {result.reasoning || "AI analysis is unavailable. Pattern suggests standard behavior."}
                </p>
              </div>
              <div className="reasoning-footer">
                <cfg.icon size={16} color={cfg.color} />
                <span style={{ color: cfg.color }} className="font-bold">
                  Verdict: {result.risk_level?.toUpperCase()} — Threat Score {result.threat_score}/100
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}