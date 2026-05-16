/** Map backend forensic status → dashboard badge verdict */
export function mapDocumentVerdict(apiStatus, anomalies = [], hashValid = true) {
  const status = (apiStatus || '').toUpperCase();
  const hasHigh = anomalies.some((a) => (a.severity || '').toLowerCase() === 'high');
  const hasAny = anomalies.length > 0;

  if (status === 'FORGED' || hasHigh || hashValid === false) return 'tampered';
  if (status === 'SUSPICIOUS' || hasAny) return 'suspected';
  return 'clean';
}

export const VERDICT_BADGE = {
  clean: { label: 'Clean', className: 'badge--success' },
  suspected: { label: 'Suspected', className: 'badge--warning' },
  tampered: { label: 'Tampered', className: 'badge--danger' },
};

export function buildDocumentEntry(filename, apiData) {
  const anomalies = apiData.anomalies || [];
  const hashValid = apiData.hash_verification?.is_valid !== false;
  const verdict = mapDocumentVerdict(apiData.status, anomalies, hashValid);
  const primary = anomalies[0];

  return {
    id: `doc-${Date.now()}`,
    filename,
    scannedAt: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
    verdict,
    confidence: apiData.confidence ?? null,
    detail: primary?.detail || apiData.reasoning || 'Forensic scan completed',
    anomalyType: primary?.type || null,
  };
}

export function isFlaggedVerdict(verdict) {
  return verdict === 'tampered' || verdict === 'suspected';
}
