import { useState } from 'react';
import { Shield } from 'lucide-react';
import api from '../../api/axios';
import { mockMaskData } from '../../api/mockData';
import { useBilingual } from '../../hooks/useBilingual';

export default function DocumentCheckPanel() {
  const { t } = useBilingual();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const mask = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/security/mask-data', { raw_data: input });
      setResult(data);
    } catch {
      setResult(mockMaskData(input));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dash-card dash-card--doccheck">
      <header className="dash-card__header">
        <span className="dash-card__emoji">📄</span>
        <h2>{t('documentCheck')}</h2>
      </header>

      <label className="doccheck-label">{t('rawInput')}</label>
      <textarea
        className="doccheck-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        spellCheck={false}
      />

      <button type="button" className="btn btn--primary btn--sm btn--block" onClick={mask} disabled={loading || !input.trim()}>
        {loading ? <span className="spinner" /> : <><Shield size={14} /> {t('maskBtn')}</>}
      </button>

      {result && (
        <div className="doccheck-result">
          <label className="doccheck-label">{t('maskedOutput')}</label>
          <pre className="doccheck-output">{result.masked_data}</pre>
          {result.audit_id && (
            <p className="doccheck-audit">
              <strong>{t('auditId')}:</strong> <code>{result.audit_id}</code>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
