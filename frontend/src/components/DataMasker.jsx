import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Shield, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { mockMaskData } from '../api/mockData';

const PLACEHOLDER = `Yahan apna sensitive data paste karein. Udaharan:

Mera account number 9876543210 hai.
Card: 4111 1111 1111 1111
IFSC: HDFC0001234
Phone: 9876543210
Email: rahul.sharma@gmail.com
Aadhaar: 234567890123
PAN: ABCDE1234F`;

export default function DataMasker() {
  const [input, setInput]     = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState(null);

  const mask = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/security/mask-data', { raw_data: input });
      setResult(data);
    } catch {
      // Fallback mock
      setResult(mockMaskData(input));
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.masked_data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setInput(''); setResult(null); };

  // Highlight [MASKED_*] tokens in the result text
  const renderMasked = (text) => {
    const parts = text.split(/(\[MASKED_[A-Z_]+\])/g);
    return parts.map((part, i) =>
      /^\[MASKED_/.test(part)
        ? <mark key={i} className="mask-highlight">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Privacy & Data Masking Hub</h1>
        <p className="page-subtitle">
          Sensitive banking information, Aadhaar, PAN, phone numbers aur emails ko automatically detect karke mask karein.
        </p>
      </div>

      {/* Entity Info */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card entity-bar">
          <span className="entity-bar__label">Detected Entities:</span>
          {result.entities_found.map((e, i) => (
            <span key={i} className="badge badge--info">{e.type} ×{e.count}</span>
          ))}
        </motion.div>
      )}

      <div className="masker-layout">
        {/* Left Panel — Input */}
        <div className="card masker-panel">
          <div className="card__header">
            <EyeOff size={16} />
            <span>Raw Sensitive Data</span>
          </div>
          <textarea
            className="masker-textarea"
            placeholder={PLACEHOLDER}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Center — Action */}
        <div className="masker-center">
          <motion.button
            className="btn btn--primary btn--secure"
            onClick={mask}
            disabled={loading || !input.trim()}
            whileTap={{ scale: 0.96 }}
          >
            {loading ? (
              <span className="loading-row"><span className="spinner" /> Masking...</span>
            ) : (
              <><Shield size={18} /> Secure & Mask</>
            )}
          </motion.button>
          {result && (
            <button className="btn btn--outline btn--sm" onClick={reset} style={{ marginTop: 8 }}>
              Clear
            </button>
          )}
        </div>

        {/* Right Panel — Masked Output */}
        <div className="card masker-panel">
          <div className="card__header">
            <Shield size={16} />
            <span>Masked Output</span>
          </div>
          <div className="masker-output">
            {result ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="masker-output__text">
                {renderMasked(result.masked_data)}
              </motion.p>
            ) : (
              <p className="masker-output__placeholder">Masked data yahan appear hoga...</p>
            )}
          </div>
          {result && (
            <button className="btn btn--success btn--sm copy-btn" onClick={copyText}>
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Masked Text</>}
            </button>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
