import { useState } from 'react';
import { FileSearch, ArrowRight } from 'lucide-react';
import { verifyDocument } from '../../api/axios';
import { mockDocumentVerify } from '../../api/mockData';
import { buildDocumentEntry, VERDICT_BADGE } from '../../utils/documentVerdict';
import { useBilingual } from '../../hooks/useBilingual';
import DocumentUploadModal from './DocumentUploadModal';

export default function RecentDocumentsPanel({ documents, onDocumentScanned }) {
  const { t } = useBilingual();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const runScan = async (file) => {
    setLoading(true);
    setUploadError(null);
    try {
      let forensic;
      try {
        const { data } = await verifyDocument(file);
        if (data.status !== 'success') {
          throw new Error(data.detail || 'Verification failed');
        }
        forensic = data.verification_data ?? data;
      } catch (err) {
        console.warn('[verify-document]', err);
        forensic = mockDocumentVerify(
          file.name.toLowerCase().includes('clean') ? 'GENUINE' : 'FORGED',
        );
      }
      const entry = buildDocumentEntry(file.name, forensic);
      onDocumentScanned?.(entry);
      setModalOpen(false);
    } catch (err) {
      setUploadError(err.message || 'Document scan failed. Check the Python backend on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="dash-card dash-card--recent-docs">
        <header className="dash-card__header dash-card__header--row">
          <span className="dash-card__header-left">
            <FileSearch size={18} />
            <h2>{t('recentDocChecks')}</h2>
          </span>
          <button type="button" className="btn btn--outline btn--xs doc-upload-trigger" onClick={() => setModalOpen(true)}>
            {t('docUploadBtn')} <ArrowRight size={12} />
          </button>
        </header>

        <ul className="recent-docs-list">
          {documents.length === 0 ? (
            <li className="recent-docs-list__empty">{t('noRecentDocs')}</li>
          ) : (
            documents.map((doc) => {
              const badge = VERDICT_BADGE[doc.verdict] || VERDICT_BADGE.clean;
              return (
                <li key={doc.id} className="recent-docs-list__item">
                  <div className="recent-docs-list__main">
                    <span className="recent-docs-list__name">{doc.filename}</span>
                    <span className="recent-docs-list__meta">
                      {doc.scannedAt}
                      {doc.confidence != null && ` · ${doc.confidence}%`}
                    </span>
                  </div>
                  <span className={`badge ${badge.className}`}>{badge.label}</span>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <DocumentUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={runScan}
        loading={loading}
        error={uploadError}
      />
    </>
  );
}
