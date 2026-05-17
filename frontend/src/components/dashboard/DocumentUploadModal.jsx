import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText } from 'lucide-react';
import { useBilingual } from '../../hooks/useBilingual';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

export default function DocumentUploadModal({ open, onClose, onUpload, loading, error: externalError }) {
  const { t } = useBilingual();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const validate = (f) => {
    if (!f) return 'No file selected';
    const ok =
      f.type === 'application/pdf' ||
      f.type.startsWith('image/');
    if (!ok) return t('docInvalidType');
    if (f.size > 15 * 1024 * 1024) return t('docTooLarge');
    return null;
  };

  const pick = (f) => {
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0]);
  }, []);

  const submit = () => {
    if (!file || loading) return;
    onUpload(file);
  };

  const handleClose = () => {
    if (loading) return;
    setFile(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="doc-upload-modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doc-upload-modal__header">
              <h2>{t('docUploadTitle')}</h2>
              <button type="button" className="icon-btn" onClick={handleClose} disabled={loading}>
                <X size={20} />
              </button>
            </div>

            <div
              className={`doc-dropzone${dragging ? ' doc-dropzone--active' : ''}${file ? ' doc-dropzone--filled' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                hidden
                onChange={(e) => pick(e.target.files?.[0])}
              />
              {file ? (
                <>
                  <FileText size={40} className="doc-dropzone__icon doc-dropzone__icon--filled" />
                  <p className="doc-dropzone__title">{file.name}</p>
                  <p className="doc-dropzone__sub">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <Upload size={40} className="doc-dropzone__icon" />
                  <p className="doc-dropzone__title">{t('docDropTitle')}</p>
                  <p className="doc-dropzone__sub">{t('docDropSub')}</p>
                </>
              )}
            </div>

            {(error || externalError) && <p className="error-text">{error || externalError}</p>}
            {loading && (
              <p className="doc-upload-loading">
                <span className="spinner" /> {t('docScanning')}
              </p>
            )}

            <div className="doc-upload-modal__footer">
              <button type="button" className="btn btn--outline" onClick={handleClose} disabled={loading}>
                {t('docCancel')}
              </button>
              <button type="button" className="btn btn--primary" onClick={submit} disabled={!file || loading}>
                {loading ? t('docScanning') : t('docScanBtn')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
