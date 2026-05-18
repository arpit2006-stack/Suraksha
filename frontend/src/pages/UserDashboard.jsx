import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Edit3, Shield, CheckCircle, CreditCard, FileText,
  Globe, Search, AlertTriangle, XCircle, Bell, ChevronRight,
  Phone, Mail, MapPin, Calendar, Lock, Upload, X, Check,
  Briefcase, RefreshCw, Ban, FileX, LogOut, Eye, EyeOff
} from 'lucide-react';
import api, { fetchProfile, updateProfile } from '../api/axios';
import { mockScanUrl } from '../api/mockData';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './UserDashboard.css';

/* ─── Gauge Chart ─── */
function GaugeChart({ score }) {
  const clamp = Math.min(100, Math.max(0, score));
  const radius = 80, cx = 100, cy = 100;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcPath = (from, to, r) => {
    const x1 = cx + r * Math.cos(toRad(from)), y1 = cy + r * Math.sin(toRad(from));
    const x2 = cx + r * Math.cos(toRad(to)), y2 = cy + r * Math.sin(toRad(to));
    return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
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
        <path d={arcPath(-180 + (30 / 100) * 180, -180 + (70 / 100) * 180, radius)} fill="none" stroke="#FBBC04" strokeWidth="18" strokeOpacity="0.4" />
        <path d={arcPath(-180 + (70 / 100) * 180, 0, radius)} fill="none" stroke="#EA4335" strokeWidth="18" strokeOpacity="0.4" />
        <path d={arcPath(-180, needleAngle, radius)} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#202124" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#202124" />
        <text x={cx} y={cy - 20} textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>{clamp}</text>
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="#5F6368">RISK SCORE</text>
        <text x="22" y="112" fontSize="9" fill="#34A853">Safe</text>
        <text x="87" y="112" fontSize="9" fill="#FBBC04">Warning</text>
        <text x="158" y="112" fontSize="9" fill="#EA4335">Danger</text>
      </svg>
      <div className="gauge-label" style={{ color }}>{riskLabel}</div>
    </div>
  );
}

/* ─── Tab Config (Customer Features Only) ─── */
const TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'edit', label: 'Edit Profile', icon: Edit3 },
  { id: 'services', label: 'Bank Services', icon: Briefcase },
  { id: 'scanner', label: 'Safe Link Checker', icon: Globe },
];

const riskConfig = {
  Safe: { icon: CheckCircle, badgeClass: 'badge--success', color: '#34A853' },
  Warning: { icon: AlertTriangle, badgeClass: 'badge--warning', color: '#FBBC04' },
  Dangerous: { icon: XCircle, badgeClass: 'badge--danger', color: '#EA4335' },
};

const normalizeRisk = (level, score) => {
  if (!level) return score > 70 ? 'Dangerous' : score > 30 ? 'Warning' : 'Safe';
  const l = level.toLowerCase();
  if (l === 'high' || l === 'dangerous') return 'Dangerous';
  if (l === 'medium' || l === 'warning') return 'Warning';
  return 'Safe';
};

/* ─── Services Data (Added Block Card & Stop Cheque) ─── */
const SERVICES = [
  { id: 'loan', icon: CreditCard, title: 'Personal Loan', desc: 'Instant personal loan upto ₹10 Lakhs. Quick approval, minimal paperwork.', badge: 'Popular', badgeClass: 'badge--success', color: '#34A853' },
  { id: 'kyc', icon: Shield, title: 'KYC Verification', desc: 'Complete your KYC with Aadhaar & PAN verification for full account access.', badge: 'Required', badgeClass: 'badge--warning', color: '#FFB600' },
  { id: 'fd', icon: Lock, title: 'Fixed Deposit', desc: 'Earn up to 7.5% interest p.a. Open FD starting from ₹1,000.', badge: 'New', badgeClass: 'badge--info', color: '#019EEC' },
  { id: 'insurance', icon: FileText, title: 'Insurance', desc: 'Life, health and vehicle insurance — all under one roof.', badge: null, badgeClass: '', color: '#EA4335' },
  { id: 'block-card', icon: Ban, title: 'Block/Replace Card', desc: 'Instantly block a lost or stolen Debit/Credit card and request a replacement.', badge: 'Emergency', badgeClass: 'badge--danger', color: '#EA4335' },
  { id: 'stop-process', icon: FileX, title: 'Stop Cheque / Loan', desc: 'Halt a cleared cheque payment or pause an ongoing loan application process.', badge: null, badgeClass: '', color: '#5F6368' },
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('edit'); 
  const { triggerGuardianAlert } = useApp();
  const { logout } = useAuth();

  const [showAadhaar, setShowAadhaar] = useState(false);
  const [showPan, setShowPan] = useState(false);

  /* Edit profile state */
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', dob: '', address: '',
    aadhaar: '', pan: '', accountNo: '', ifscCode: '', branchName: '',
  });
  const [editForm, setEditForm] = useState({ ...profile });
  const [editSaved, setEditSaved] = useState(false);

  /* Services state */
  const [appliedServices, setAppliedServices] = useState({});
  const [serviceModal, setServiceModal] = useState(null);

  /* URL Scanner state */
  const [url, setUrl] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  /* Fetch Profile */
  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data } = await fetchProfile();
        if (data && data.user) {
          const u = data.user;
          const userProfile = {
            name: u.fullName || '',
            email: u.email || '',
            phone: u.phone || '',
            dob: u.dob || '',
            address: u.address || '',
            aadhaar: u.aadhaarNumber || '',
            pan: u.panCardNo || '',
            accountNo: u.accountNo || '',
            ifscCode: u.ifscCode || '',
            branchName: u.branchName || ''
          };
          setProfile(userProfile);
          setEditForm(userProfile);
          setActiveTab('profile'); // Switch to profile tab once fetched
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    getProfile();
  }, []);

  /* ── Handlers ── */
  const handleEditSave = async () => {
    try {
        await updateProfile({
            fullName: editForm.name,
            email: editForm.email,
            phone: editForm.phone,
            dob: editForm.dob,
            address: editForm.address,
            accountNo: editForm.accountNo,
            branchName: editForm.branchName
        });
        setProfile({ ...editForm });
        setEditSaved(true);
        setTimeout(() => setEditSaved(false), 3000);
    } catch (err) {
        console.error("Failed to update profile", err);
        alert("Failed to update profile");
    }
  };

  const handleApply = (serviceId) => {
    setAppliedServices((prev) => ({ ...prev, [serviceId]: 'pending' }));
    setServiceModal(null);
  };

  const scan = async () => {
    if (!url.trim()) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const { data } = await api.post('/security/scan-url', { url });
      setScanResult(data);
      if (data.threat_score > 70)
        triggerGuardianAlert(`Warning! Unsafe URL detected. Score: ${data.threat_score}/100`);
    } catch {
      const mock = mockScanUrl(87);
      setScanResult(mock);
      triggerGuardianAlert('Dangerous URL detected! Score: 87/100');
    } finally {
      setScanLoading(false);
    }
  };

  const cfg = scanResult ? riskConfig[normalizeRisk(scanResult.risk_level, scanResult.threat_score)] : null;

  /* ── Render Sections ── */
  const renderProfile = () => {
    const isEmpty = !profile.name && !profile.email && !profile.phone;
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {isEmpty && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="ud-empty-banner">
            <Edit3 size={16} />
            <span>Your profile is incomplete. Please go to <button className="ud-banner-link" onClick={() => setActiveTab('edit')}>Edit Profile</button> to update your details.</span>
          </motion.div>
        )}
        <div className="ud-profile-layout">
          <div className="card ud-avatar-card">
            <div className="ud-avatar-circle">
              {profile.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase() : '?'}
            </div>
            <h2 className="ud-avatar-name">{profile.name || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: 14 }}>Name not set</span>}</h2>
            <p className="ud-avatar-sub">Savings Account</p>
            <span className="badge badge--success ud-kyc-badge">
              <Check size={11} /> KYC Verified
            </span>
            <div className="ud-quick-stats">
              <div className="ud-stat">
                <span className="ud-stat__val">—</span>
                <span className="ud-stat__key">Balance</span>
              </div>
              <div className="ud-stat-divider" />
              <div className="ud-stat">
                <span className="ud-stat__val">—</span>
                <span className="ud-stat__key">Tier</span>
              </div>
              <div className="ud-stat-divider" />
              <div className="ud-stat">
                <span className="ud-stat__val">{Object.keys(appliedServices).length || '—'}</span>
                <span className="ud-stat__key">Services</span>
              </div>
            </div>
          </div>

          <div className="ud-details-col">
            <div className="card ud-details-card">
              <div className="card__header">
                <User size={14} /> Personal Information
              </div>
              <div className="ud-info-grid">
                {[
                  { icon: User, label: 'Full Name', val: profile.name },
                  { icon: Mail, label: 'Email', val: profile.email },
                  { icon: Phone, label: 'Phone', val: profile.phone },
                  { icon: Calendar, label: 'Date of Birth', val: profile.dob },
                  { icon: MapPin, label: 'Address', val: profile.address },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="ud-info-row">
                    <div className="ud-info-icon"><Icon size={14} /></div>
                    <div>
                      <div className="ud-info-label">{label}</div>
                      <div className="ud-info-val">{val || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not provided</span>}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card ud-details-card" style={{ marginTop: 16 }}>
              <div className="card__header">
                <Lock size={14} /> Account & KYC Details
              </div>
              <div className="ud-info-grid">
                {[
                  { label: 'Account Number', val: profile.accountNo },
                  { label: 'Branch Name', val: profile.branchName },
                  { 
                    label: 'Aadhaar Number', 
                    val: profile.aadhaar ? (showAadhaar ? profile.aadhaar : '•••• •••• ' + profile.aadhaar.slice(-4)) : '',
                    isKyc: true,
                    show: showAadhaar,
                    setShow: setShowAadhaar
                  },
                  { 
                    label: 'PAN Card Number', 
                    val: profile.pan ? (showPan ? profile.pan : '••••••' + profile.pan.slice(-4)) : '',
                    isKyc: true,
                    show: showPan,
                    setShow: setShowPan
                  },
                ].map(({ label, val, isKyc, show, setShow }) => (
                  <div key={label} className="ud-info-row">
                    <div className="ud-info-icon"><Shield size={14} /></div>
                    <div style={{ flexGrow: 1 }}>
                      <div className="ud-info-label">{label}</div>
                      <div className="ud-info-val" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{val || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'Inter,sans-serif' }}>Not provided</span>}</span>
                        {isKyc && val && (
                          <button className="ud-kyc-toggle" onClick={() => setShow(!show)} title={show ? "Hide details" : "Reveal details"}>
                            {show ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEdit = () => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card" style={{ maxWidth: 780, margin: '0 auto' }}>
        <div className="card__header"><Edit3 size={14} /> Complete Your Profile</div>
        <AnimatePresence>
          {editSaved && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ud-save-toast">
              <Check size={14} /> Profile successfully updated!
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="ud-section-label">Personal Information</p>
        <div className="ud-edit-grid">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email address' },
            { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. +91 98765 43210' },
            { key: 'dob', label: 'Date of Birth', type: 'date', placeholder: '' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className="ud-field">
              <label className="ud-field__label">{label}</label>
              <input type={type} className="ud-field__input" value={editForm[key]} placeholder={placeholder} onChange={(e) => setEditForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="ud-field ud-field--full">
            <label className="ud-field__label">Address</label>
            <textarea className="ud-field__input ud-field__textarea" value={editForm.address} placeholder="e.g. 123, MG Road, City, State – PIN" onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))} rows={3} />
          </div>
        </div>

        <p className="ud-section-label" style={{ marginTop: 24 }}>Account Details</p>
        <div className="ud-edit-grid">
          {[
            { key: 'accountNo', label: 'Account Number', type: 'text', placeholder: 'e.g. 0123456789', mono: true },
            { key: 'branchName', label: 'Branch Name', type: 'text', placeholder: 'e.g. MG Road Branch', mono: false },
          ].map(({ key, label, type, placeholder, mono }) => (
            <div key={key} className="ud-field">
              <label className="ud-field__label">{label}</label>
              <input type={type} className="ud-field__input" value={editForm[key]} placeholder={placeholder} style={mono ? { fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.5px' } : {}} onChange={(e) => setEditForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
        </div>

        <div className="btn-row" style={{ marginTop: 24 }}>
          <button className="btn btn--outline" onClick={() => setEditForm({ ...profile })}><X size={14} /> Reset</button>
          <motion.button className="btn btn--primary" whileTap={{ scale: 0.97 }} onClick={() => { handleEditSave(); setActiveTab('profile'); }}><Check size={14} /> Save & View Profile</motion.button>
        </div>
      </div>
    </motion.div>
  );

  const renderServices = () => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="ud-services-grid">
        {SERVICES.map((svc) => {
          const Icon = svc.icon;
          const status = appliedServices[svc.id];
          return (
            <motion.div key={svc.id} className="card ud-service-card" whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(1,158,236,0.12)' }}>
              <div className="ud-service-icon-wrap" style={{ background: `${svc.color}18` }}>
                <Icon size={26} style={{ color: svc.color }} />
              </div>
              <div className="ud-service-body">
                <div className="ud-service-title-row">
                  <h3 className="ud-service-title">{svc.title}</h3>
                  {svc.badge && <span className={`badge ${svc.badgeClass}`}>{svc.badge}</span>}
                </div>
                <p className="ud-service-desc">{svc.desc}</p>
              </div>
              {status === 'pending' ? (
                <span className="badge badge--warning ud-service-applied"><RefreshCw size={11} /> Request Pending</span>
              ) : (
                <button className="btn btn--outline btn--sm ud-service-btn" onClick={() => setServiceModal(svc)}>
                  {svc.id === 'block-card' || svc.id === 'stop-process' ? 'Submit Request' : 'Apply Now'} <ChevronRight size={13} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderScanner = () => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card search-card">
        <div className="card__header"><Globe size={14} /> Safe Link Checker (Check if an SMS/Email link is real)</div>
        <div className="search-bar">
          <Globe size={16} className="search-icon" />
          <input type="url" className="search-input" placeholder="Paste link here (e.g. https://...)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()} />
          <button className="btn btn--primary search-btn" onClick={scan} disabled={scanLoading || !url.trim()}>
            {scanLoading ? <span className="loading-row"><span className="spinner" /> Scanning...</span> : <><Search size={14} /> Check Link</>}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {scanResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="scanner-result-layout">
            <div className="card gauge-card">
              <GaugeChart score={scanResult.threat_score} />
              <div className="gauge-meta">
                <div className="gauge-meta__row"><span>Detected Brand</span><strong>{scanResult.detected_brand}</strong></div>
                <div className="gauge-meta__row"><span>Risk Level</span><span className={`badge ${cfg.badgeClass}`}>{scanResult.risk_level}</span></div>
                <div className="gauge-meta__row">
                  <span>Threats</span>
                  <div className="threat-tags">
                    {scanResult.threat_types.map((t) => <span key={t} className="badge badge--danger badge--xs">{t}</span>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="card reasoning-card">
              <div className="card__header"><span>🛡️</span><span>SuRaksha Security Analysis</span></div>
              <p className="reasoning-text">{scanResult.reasoning}</p>
              <div className="reasoning-footer">
                <cfg.icon size={16} color={cfg.color} />
                <span style={{ color: cfg.color }}>Verdict: {scanResult.risk_level?.toUpperCase()} — Threat Score {scanResult.threat_score}/100</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfile();
      case 'edit': return renderEdit();
      case 'services': return renderServices();
      case 'scanner': return renderScanner();
      default: return null;
    }
  };

  return (
    <div className="ud-page-bg">
      <header className="ud-header">
        <div className="ud-header-left">
          <Shield size={24} style={{ color: 'var(--canara-yellow)' }} />
          <div>
            <h1 className="ud-header-title">SuRaksha</h1>
            <p className="ud-header-subtitle">Secure NetBanking Portal</p>
          </div>
        </div>
        <div className="ud-header-right">
          {profile.name && (
            <div className="ud-header-user">
              <p className="ud-header-greeting">
                Logged in as <span className="ud-header-name">{profile.name}</span>
              </p>
            </div>
          )}
          <button className="ud-header-logout" onClick={logout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="page-container">
        <div className="page-header" style={{ textAlign: 'center', paddingTop: '20px' }}>
          <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Customer Dashboard</h1>
          <p className="page-subtitle" style={{ fontSize: '1.15rem', margin: '10px auto 0', textAlign: 'center', maxWidth: '800px' }}>
            Manage your profile, apply for services, and check suspicious links.
          </p>
        </div>
        <div className="ud-tab-bar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} id={`ud-tab-${id}`} className={`ud-tab ${activeTab === id ? 'ud-tab--active' : ''}`} onClick={() => setActiveTab(id)}>
              <Icon size={15} />
              {label}
              {activeTab === id && <motion.div className="ud-tab-indicator" layoutId="ud-tab-indicator" />}
            </button>
          ))}
        </div>
        <div className="ud-content">{renderContent()}</div>
        
        {/* Service Apply Modal */}
        <AnimatePresence>
          {serviceModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setServiceModal(null)}>
              <motion.div className="compliance-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                <div className="compliance-modal__header">
                  <div>
                    <h2 className="compliance-modal__title">{serviceModal.title} – Action</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{serviceModal.desc}</p>
                  </div>
                  <button className="icon-btn" onClick={() => setServiceModal(null)}><X size={20} /></button>
                </div>
                <div className="compliance-modal__body">
                  <p className="compliance-modal__label">📋 Required Action / Document</p>
                  <ul className="action-points">
                    {serviceModal.id === 'block-card' || serviceModal.id === 'stop-process' ? (
                      <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="action-point">
                        <span className="action-point__num">1</span> Please confirm your identity using OTP on the next screen to process this emergency request.
                      </motion.li>
                    ) : (
                      ['Aadhaar Card', 'PAN Card', 'Bank Statement (3 months)', 'Passport Size Photo'].map((doc, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="action-point">
                          <span className="action-point__num">{i + 1}</span>{doc}
                        </motion.li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="compliance-modal__footer">
                  <button className="btn btn--outline" onClick={() => setServiceModal(null)}>Cancel</button>
                  <motion.button className="btn btn--approve" whileTap={{ scale: 0.97 }} onClick={() => handleApply(serviceModal.id)}>
                    <CheckCircle size={16} /> Confirm Request
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
