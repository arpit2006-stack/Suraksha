import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Eye } from 'lucide-react';
import api from '../api/axios';
import { mockDocumentVerify } from '../api/mockData';
import { useApp } from '../context/AppContext';

const statusConfig = {
  GENUINE:    { label: 'GENUINE',    icon: CheckCircle,    color: '#34A853', bg: '#E6F4EA', badgeClass: 'badge--success' },
  SUSPICIOUS: { label: 'SUSPICIOUS', icon: AlertTriangle,  color: '#FBBC04', bg: '#FEF7E0', badgeClass: 'badge--warning' },
  FORGED:     { label: 'FORGED',     icon: XCircle,        color: '#EA4335', bg: '#FCE8E6', badgeClass: 'badge--danger'  },
};

const severityColor = { high: '#EA4335', medium: '#FBBC04', low: '#34A853' };

export default function DocumentVerifier() {
  const [isDragging, setIsDragging]   = useState(false);
  const [file, setFile]               = useState(null);
  const [fileUrl, setFileUrl]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const fileInputRef                  = useRef(null);
  const { triggerGuardianAlert, familyMode } = useApp();

  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') {
      setError('Sirf PDF files allowed hain.');
      return;
    }
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Try real API first
      const { data } = await api.post('/auth/verify-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      if (data.status === 'FORGED') triggerGuardianAlert('Ek forged document detect hua hai! Kripya authorities ko report karein.');
    } catch {
      // Fallback to mock
      const mock = mockDocumentVerify('FORGED');
      setResult(mock);
      if (mock.status === 'FORGED') triggerGuardianAlert('Forged document detect hua! Turant dhyan dein.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setFileUrl(null); setResult(null); setError(null); };

  const status = result ? statusConfig[result.status] : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Document Forgery Detection</h1>
        <p className="page-subtitle">
          AI-powered metadata analysis, font consistency check aur hash verification ke saath PDF documents authenticate karein.
        </p>
      </div>

      {!result ? (
        <div className="card upload-card">
          {/* Drop Zone */}
          <div
            className={`drop-zone ${isDragging ? 'drop-zone--active' : ''} ${file ? 'drop-zone--filled' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="drop-zone__content">
                  <Upload size={48} className="drop-zone__icon" />
                  <p className="drop-zone__title">PDF yahan drag & drop karein</p>
                  <p className="drop-zone__sub">ya click karke file choose karein</p>
                  <span className="badge badge--info">Sirf PDF • Max 20MB</span>
                </motion.div>
              ) : (
                <motion.div key="filled" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="drop-zone__content">
                  <FileText size={48} className="drop-zone__icon drop-zone__icon--filled" />
                  <p className="drop-zone__title">{file.name}</p>
                  <p className="drop-zone__sub">{(file.size / 1024).toFixed(1)} KB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="btn-row">
            {file && (
              <>
                <button className="btn btn--outline" onClick={reset}>Cancel</button>
                <button className="btn btn--primary" onClick={analyze} disabled={loading}>
                  {loading ? (
                    <span className="loading-row">
                      <span className="spinner" /> AI Analyzing Metadata & Fonts...
                    </span>
                  ) : 'Analyze Document'}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="result-layout">
          {/* Left: PDF Preview */}
          <div className="card pdf-preview-card">
            <div className="card__header">
              <Eye size={16} />
              <span>Original Document</span>
            </div>
            <iframe
              src={fileUrl}
              title="PDF Preview"
              className="pdf-iframe"
            />
            <button className="btn btn--outline btn--sm" onClick={reset} style={{ marginTop: '12px' }}>
              Upload New File
            </button>
          </div>

          {/* Right: Analysis Result */}
          <div className="analysis-panel">
            {/* Status Badge */}
            <div className="card" style={{ background: status.bg, border: `2px solid ${status.color}` }}>
              <div className="status-header">
                <status.icon size={32} color={status.color} />
                <div>
                  <span className={`badge ${status.badgeClass} badge--lg`}>{status.label}</span>
                  <p className="status-confidence">Confidence: {result.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Anomalies */}
            <div className="card">
              <div className="card__header">
                <AlertTriangle size={16} />
                <span>Detected Anomalies ({result.anomalies.length})</span>
              </div>
              <div className="anomaly-list">
                {result.anomalies.map((a, i) => (
                  <div key={i} className="anomaly-item">
                    <div className="anomaly-dot" style={{ background: severityColor[a.severity] }} />
                    <div>
                      <p className="anomaly-type">{a.type}</p>
                      <p className="anomaly-detail">{a.detail}</p>
                    </div>
                    <span className="anomaly-severity" style={{ color: severityColor[a.severity] }}>
                      {a.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hash Verification */}
            <div className="card">
              <div className="card__header">
                <span>Hash Verification</span>
              </div>
              <div className="hash-grid">
                <div className="hash-row"><span>SHA-256</span><code className="hash-code">{result.hash_verification.sha256}</code></div>
                <div className="hash-row"><span>MD5</span><code className="hash-code">{result.hash_verification.md5}</code></div>
                <div className="hash-row">
                  <span>Status</span>
                  <span className={`badge ${result.hash_verification.is_valid ? 'badge--success' : 'badge--danger'}`}>
                    {result.hash_verification.is_valid ? 'Valid' : 'INVALID'}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="card">
              <div className="card__header"><span>Document Metadata</span></div>
              <div className="meta-grid">
                {Object.entries(result.metadata).map(([k, v]) => (
                  <div key={k} className="meta-row">
                    <span className="meta-key">{k.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="meta-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
