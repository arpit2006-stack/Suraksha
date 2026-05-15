import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RefreshCw, X, CheckCheck, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { mockRegulatoryScan } from '../api/mockData';

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
  const [loading, setLoading]         = useState(false);
  const [circulars, setCirculars]     = useState(null);
  const [modal, setModal]             = useState(null);    // circular object
  const [aiSummary, setAiSummary]     = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [auditLog, setAuditLog]       = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/security/trigger-regulatory-scan', null, {
        params: { mode: 'hybrid' },
      });
      setCirculars(data.circulars);
    } catch {
      const mock = mockRegulatoryScan();
      setCirculars(mock.circulars);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (circular) => {
    setModal(circular);
    setAiSummary(null);
    setSummaryLoading(true);
    // Simulate AI summary loading
    await new Promise((r) => setTimeout(r, 1200));
    const mock = mockRegulatoryScan();
    setAiSummary(mock.action_points);
    setSummaryLoading(false);
  };

  const closeModal = () => { setModal(null); setAiSummary(null); };

  const approvePolicy = () => {
    const entry = {
      id: modal.id,
      title: modal.title,
      action: 'APPROVED & POLICY APPLIED',
      timestamp: new Date().toLocaleString('en-IN'),
      user: 'Rahul Sharma (Admin)',
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

      <div className="compliance-toolbar">
        <button className="btn btn--primary" onClick={fetchData} disabled={loading}>
          {loading
            ? <span className="loading-row"><span className="spinner" /> Scanning Regulatory Feed...</span>
            : <><RefreshCw size={15} /> Load Regulatory Feed</>}
        </button>
        {auditLog.length > 0 && (
          <span className="badge badge--success">{auditLog.length} Policies Applied</span>
        )}
      </div>

      {/* Circulars Table */}
      {circulars && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card table-card">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>Circular ID</th>
                <th>Title</th>
                <th>Date</th>
                <th>Category</th>
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
                  <td className="circular-date">{c.date}</td>
                  <td><span className="badge badge--info">{c.category}</span></td>
                  <td>
                    <span className={`badge ${priorityConfig[c.priority]?.class}`}>
                      {priorityConfig[c.priority]?.label}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusConfig[c.status]?.class}`}>{c.status}</span>
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
        </motion.div>
      )}

      {/* Audit Trail */}
      {auditLog.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card audit-card">
          <div className="card__header"><CheckCheck size={16} /><span>Audit Trail</span></div>
          {auditLog.map((log, i) => (
            <div key={i} className="audit-row">
              <div className="audit-row__meta">
                <code>{log.id}</code> — {log.action}
              </div>
              <div className="audit-row__sub">
                {log.user} • {log.timestamp}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="compliance-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="compliance-modal__header">
                <div>
                  <code className="circular-id">{modal.id}</code>
                  <h2 className="compliance-modal__title">{modal.title}</h2>
                </div>
                <button className="icon-btn" onClick={closeModal}><X size={20} /></button>
              </div>

              <div className="compliance-modal__body">
                <p className="compliance-modal__label">🤖 AI-Generated Action Points</p>
                {summaryLoading ? (
                  <div className="loading-row"><span className="spinner" /> Gemini AI summary generate ho raha hai...</div>
                ) : (
                  <ul className="action-points">
                    {aiSummary?.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="action-point"
                      >
                        <span className="action-point__num">{i + 1}</span>
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="compliance-modal__footer">
                <button className="btn btn--outline" onClick={closeModal}>Cancel</button>
                <motion.button
                  className="btn btn--approve"
                  onClick={approvePolicy}
                  disabled={summaryLoading}
                  whileTap={{ scale: 0.97 }}
                >
                  <CheckCheck size={18} /> Approve & Apply Policy
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
