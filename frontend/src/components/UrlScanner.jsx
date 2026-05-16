import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, XCircle, Globe, ShieldCheck, Terminal, Cpu } from 'lucide-react';
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
  const nx = cx + (radius - 15) * Math.cos(toRad(needleAngle));
  const ny = cy + (radius - 15) * Math.sin(toRad(needleAngle));

  const color = clamp <= 30 ? '#34A853' : clamp <= 70 ? '#FBBC04' : '#EA4335';
  const riskLabel = clamp <= 30 ? 'SAFE' : clamp <= 70 ? 'WARNING' : 'DANGEROUS';

  return (
    <div className="gauge-wrapper" style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 125" className="gauge-svg" style={{ width: '100%', maxWidth: '240px' }}>
        <path d={arcPath(-180, 0, radius)} fill="none" stroke="#E8EAED" strokeWidth="16" strokeLinecap="round" />
        <path d={arcPath(-180, -180 + (30 / 100) * 180, radius)} fill="none" stroke="#34A853" strokeWidth="16" strokeOpacity="0.2" />
        <path d={arcPath(-126, -54, radius)} fill="none" stroke="#FBBC04" strokeWidth="16" strokeOpacity="0.2" />
        <path d={arcPath(-54, 0, radius)} fill="none" stroke="#EA4335" strokeWidth="16" strokeOpacity="0.2" />
        
        <path d={arcPath(-180, needleAngle, radius)} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" style={{ transition: 'all 0.5s ease-out' }} />
        
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#202124" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill="#202124" />
        
        <text x={cx} y={cy - 25} textAnchor="middle" fontSize="24" fontWeight="800" fill={color}>{clamp}</text>
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fill="#5F6368" letterSpacing="1">RISK SCORE</text>
      </svg>
      <div className="gauge-label" style={{ color, fontWeight: 'bold', marginTop: '-10px', fontSize: '1.1rem' }}>{riskLabel}</div>
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
      if (data.threat_score > 70) {
        triggerGuardianAlert(`Khatra! Phishing detected: ${url}. Score: ${data.threat_score}/100.`);
      }
    } catch (err) {
      console.error("Scan Error:", err);
      triggerGuardianAlert(`Radar connectivity issue. Please retry.`);
    } finally {
      setLoading(false);
    }
  };

  const normalizeRisk = (level, score) => {
    const l = level?.toLowerCase() || '';
    if (l.includes('high') || l.includes('dangerous') || score > 70) return 'Dangerous';
    if (l.includes('low') || l.includes('medium') || l.includes('warning') || score > 30) return 'Warning';
    return 'Safe';
  };

  // Safe check for config
  const currentRisk = result ? normalizeRisk(result.risk_level, result.threat_score) : 'Safe';
  const cfg = riskConfig[currentRisk] || riskConfig.Safe;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Phishing Radar — URL Scanner</h1>
        <p className="page-subtitle">
          Gemini 2.5 performs "Ghost Reconnaissance" background checks to identify malicious domains.
        </p>
      </div>

      <div className="card search-card">
        <div className="search-bar">
          <Globe size={20} className="search-icon" />
          <input
            type="url"
            className="search-input"
            placeholder="URL enter karein (e.g., https://bank.sbi or netpnb.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && scan()}
          />
          <button className="btn btn--primary search-btn" onClick={scan} disabled={loading || !url.trim()}>
            {loading ? <><span className="spinner" /> Ghost Scanning...</> : <><Search size={16} /> Scan URL</>}
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
            {/* Left Section */}
            <div className="card gauge-card">
              <GaugeChart score={result.threat_score || 0} />
              
              {result.ghost_recon && (
                <div className="ghost-signals-box mt-4 p-3 bg-black rounded border border-green-900 font-mono">
                  <div className="text-[10px] text-green-400 mb-1 flex items-center gap-1">
                    <Terminal size={10} /> RECON_DATA_FEED: ACTIVE
                  </div>
                  <div className="text-[11px] text-green-500 leading-tight">
                    <div>&gt; [TITLE]: {result.ghost_recon.title}</div>
                    <div>&gt; [SSL]: {result.ghost_recon.ssl}</div>
                    <div>&gt; [GEO]: {result.ghost_recon.country}</div>
                    <div className="text-blue-400">&gt; IDENT_MATCH: COMPLETED</div>
                  </div>
                </div>
              )}

              <div className="gauge-meta mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target Brand</span>
                  <span className="font-bold">{result.detected_brand || "Generic"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Verdict</span>
                  <span className={`badge ${cfg.badgeClass}`}>{result.risk_level}</span>
                </div>
                
                <div className="border-t pt-3">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Threats Found</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.threat_types?.length > 0 ? (
                      result.threat_types.map((t, idx) => (
                        <span key={idx} className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded font-bold border border-red-100">
                          {t.toUpperCase()}
                        </span>
                      ))
                    ) : <span className="text-xs text-gray-400 italic">None detected</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t text-[11px]">
                   <div><p className="text-gray-400">Registrar</p><p className="font-medium">{result.registrar || "N/A"}</p></div>
                   <div><p className="text-gray-400">Country</p><p className="font-medium">{result.country || "India"}</p></div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="card reasoning-card">
              <div className="card__header flex items-center gap-2 mb-4">
                <Cpu size={18} className="text-blue-500" />
                <span className="font-bold text-gray-700">Gemini 2.5 Forensics Report</span>
              </div>
              <div className="reasoning-body bg-gray-50 p-4 rounded-lg border border-gray-100 italic text-sm text-gray-600 leading-relaxed">
                  "{result.reasoning || "No detailed forensic reasoning available."}"
              </div>
              <div className="reasoning-footer mt-auto pt-6 border-t flex items-center gap-2">
                <cfg.icon size={20} color={cfg.color} />
                <span style={{ color: cfg.color }} className="font-black text-sm uppercase tracking-tighter">
                  {currentRisk} Verdict — Score {result.threat_score}/100
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}