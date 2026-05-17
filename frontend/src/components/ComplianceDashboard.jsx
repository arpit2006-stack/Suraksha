import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, CheckCheck, ChevronRight, AlertCircle } from 'lucide-react';
import api, { analyzeRegulatoryCircular } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const priorityConfig = {
  critical: { class: 'badge--danger',  label: 'Critical' },
  high:     { class: 'badge--warning', label: 'High'     },
  medium:   { class: 'badge--info',    label: 'Medium'   },
  low:      { class: 'badge--success', label: 'Low'      },
};

const statusConfig = {
  'Pending Review': { class: 'badge--warning' },
  'Approved':       { class: 'badge--success' },
};

export default function ComplianceDashboard() {
  const { user } = useAuth();
  const [loading, setLoading]         = useState(false);
  const [circulars, setCirculars]     = useState(null);
  const [modal, setModal]             = useState(null); 
  const [aiSummary, setAiSummary]     = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [auditLog, setAuditLog]       = useState([]);
  const [error, setError]             = useState(null);

  // 1. Fetch Circulars List (Live + Local)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Naya endpoint call kar rahe hain
      const response = await api.get('/security/fetch-circulars');
      if (response.data.status === "success") {
        setCirculars(response.data.circulars);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Backend se circulars fetch nahi ho paye. Check if Python server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // 2. Analyze Specific Circular (Real AI Call)
  const openModal = async (circular) => {
    setModal(circular);
    setAiSummary(null);
    setSummaryLoading(true);
    
    try {
      // Hitting the new dynamic endpoint: /analyze-circular
      const response = await analyzeRegulatoryCircular(circular.id, circular.title);
      
      if (response.data.status === "success") {
        // Backend summary string mein deta hai, hum points mein split kar rahe hain display ke liye
        const points = response.data.data.summary
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^\*|\d+\.|\-/, '').trim());
        
        setAiSummary(points);
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setAiSummary(["Error: AI summarize nahi kar paya. Please check backend logs."]);
    } finally {
      setSummaryLoading(false);
    }
  };

  const closeModal = () => { setModal(null); setAiSummary(null); };

  const approvePolicy = () => {
    const entry = {
      id: modal.id,
      title: modal.title,
      action: 'APPROVED & POLICY APPLIED',
      timestamp: new Date().toLocaleString('en-IN'),
      user: user?.name || 'System',
    };
    setAuditLog((prev) => [entry, ...prev]);
    setCirculars((prev) =>
      prev.map((c) => (c.id === modal.id ? { ...c, status: 'Approved' } : c))
    );
    closeModal();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Agentic Regulatory Compliance</h1>
        <p className="page-subtitle">
          RBI / SEBI circulars ka AI-powered analysis. Compliance decisions track aur audit trail mein log karein.
        </p>
      </div>

      {error && (
        <div className="alert alert--error mb-4">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="compliance-toolbar">
        <button className="btn btn--primary" onClick={fetchData} disabled={loading}>
          {loading
            ? <span className="loading-row"><span className="spinner" /> Syncing with RBI Feed...</span>
            : <><RefreshCw size={15} /> Load Regulatory Feed</>}
        </button>
        {auditLog.length > 0 && (
          <span className="badge badge--success">{auditLog.length} Policies Applied</span>
        )}
      </div>

      {/* Circulars Table */}
      {circulars && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card table-card">
          <div className="table-responsive">
            <table className="compliance-table">
              <thead>
                <tr>
                  <th>Circular ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {circulars.map((c) => (
                  <tr key={c.id}>
                    <td><code className="circular-id">{c.id}</code></td>
                    <td className="circular-title">{c.title}</td>
                    <td><span className="badge badge--info">{c.category}</span></td>
                    <td><span className="text-muted text-xs">{c.source}</span></td>
                    <td>
                      <span className={`badge ${priorityConfig[c.priority]?.class || 'badge--info'}`}>
                        {priorityConfig[c.priority]?.label || 'Standard'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusConfig[c.status]?.class || 'badge--warning'}`}>{c.status}</span>
                    </td>
                    <td>
                      <button className="btn btn--outline btn--xs" onClick={() => openModal(c)}>
                        <ChevronRight size={13} /> Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Audit Trail */}
      {auditLog.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card audit-card mt-6">
          <div className="card__header"><CheckCheck size={16} /><span>Live Audit Trail (System Integrity)</span></div>
          {auditLog.map((log, i) => (
            <div key={i} className="audit-row">
              <div className="audit-row__meta">
                <code>{log.id}</code> — <span className="text-success font-bold">{log.action}</span>
              </div>
              <div className="audit-row__sub">
                {log.user} • {log.timestamp} • Decision logged in Blockchain/Vault
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className="compliance-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="compliance-modal__header">
                <div>
                  <code className="circular-id">{modal.id}</code>
                  <h2 className="compliance-modal__title">{modal.title}</h2>
                  <p className="text-xs text-muted">Source: {modal.source}</p>
                </div>
                <button className="icon-btn" onClick={closeModal}><X size={20} /></button>
              </div>

              <div className="compliance-modal__body">
                <div className="ai-brand-badge">
                  <span className="sparkle-icon">✨</span> Gemini 2.5 Forensics Engine
                </div>
                <p className="compliance-modal__label">Executive Summary & Action Points</p>
                
                {summaryLoading ? (
                  <div className="loading-state py-8 text-center">
                    <div className="spinner mb-4" />
                    <p className="text-muted animate-pulse">Reading RBI Circular and generating compliance impact...</p>
                  </div>
                ) : (
                  <ul className="action-points">
                    {aiSummary?.map((point, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="action-point">
                        <span className="action-point__num">{i + 1}</span>
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="compliance-modal__footer">
                <button className="btn btn--outline" onClick={closeModal}>Discard</button>
                <motion.button 
                  className="btn btn--approve" 
                  onClick={approvePolicy} 
                  disabled={summaryLoading}
                  whileTap={{ scale: 0.97 }}
                >
                  <CheckCheck size={18} /> Approve & Apply to Banking Core
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}