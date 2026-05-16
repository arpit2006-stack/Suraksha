import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, ChevronRight } from 'lucide-react';
import api, { analyzeRegulatoryCircular } from '../../api/axios';
import { useBilingual } from '../../hooks/useBilingual';

const statusClass = {
  Pending: 'badge--warning',
  Approved: 'badge--success',
  'Pending Review': 'badge--warning',
};

export default function RegulatoryLiveFeed() {
  const { t } = useBilingual();
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/security/fetch-circulars');
      if (data.status === 'success') setCirculars(data.circulars || []);
    } catch {
      setCirculars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const openAnalyze = async (item) => {
    setModal(item);
    setSummary(null);
    setSummaryLoading(true);
    try {
      const res = await analyzeRegulatoryCircular(item.id, item.title);
      if (res.data.status === 'success') {
        const points = res.data.data.summary
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => line.replace(/^\*|\d+\.|\-/, '').trim());
        setSummary(points);
      }
    } catch {
      setSummary(['Analysis unavailable. Check backend logs.']);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <>
      <section className="dash-card dash-card--regulatory">
        <header className="dash-card__header dash-card__header--row">
          <span>
            <span className="dash-card__emoji">📜</span>
            <h2>{t('regulatoryFeed')}</h2>
          </span>
          <button type="button" className="btn btn--outline btn--xs" onClick={fetchFeed} disabled={loading}>
            <RefreshCw size={12} className={loading ? 'spin-icon' : ''} />
          </button>
        </header>

        <ul className="reg-feed">
          {loading && <li className="reg-feed__loading">Loading…</li>}
          {!loading && circulars.length === 0 && (
            <li className="reg-feed__empty">No circulars available</li>
          )}
          {circulars.map((c) => (
            <li key={c.id}>
              <button type="button" className="reg-feed__item" onClick={() => openAnalyze(c)}>
                <div className="reg-feed__main">
                  <span className="reg-feed__title">{c.title}</span>
                  <span className="reg-feed__source">{c.source || 'Vault'}</span>
                </div>
                <span className={`badge ${statusClass[c.status] || 'badge--info'}`}>{c.status}</span>
                <ChevronRight size={14} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <AnimatePresence>
        {modal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="compliance-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="compliance-modal__header">
                <div>
                  <code className="circular-id">{modal.id}</code>
                  <h2 className="compliance-modal__title">{modal.title}</h2>
                  <p className="text-xs text-muted">Source: {modal.source}</p>
                </div>
                <button type="button" className="icon-btn" onClick={() => setModal(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="compliance-modal__body">
                <p className="compliance-modal__label">Gemini 2.5 — Action points</p>
                {summaryLoading ? (
                  <div className="loading-row"><span className="spinner" /> Analyzing…</div>
                ) : (
                  <ul className="action-points">
                    {summary?.map((point, i) => (
                      <li key={i} className="action-point">
                        <span className="action-point__num">{i + 1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="compliance-modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setModal(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
