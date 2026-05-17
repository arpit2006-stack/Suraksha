import { useState, useCallback } from 'react';
import PhishingRadarCard from '../components/dashboard/PhishingRadarCard';
import LiveAlertFeed from '../components/dashboard/LiveAlertFeed';
import TopRiskPanel from '../components/dashboard/TopRiskPanel';
import RegulatoryLiveFeed from '../components/dashboard/RegulatoryLiveFeed';
import DocumentCheckPanel from '../components/dashboard/DocumentCheckPanel';
import RecentDocumentsPanel from '../components/dashboard/RecentDocumentsPanel';
import DashboardStatsRow from '../components/dashboard/DashboardStatsRow';
import { isFlaggedVerdict } from '../utils/documentVerdict';

let alertSeq = 0;
let riskSeq = 0;

export default function UnderwriterDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [risks, setRisks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docTamperingCount, setDocTamperingCount] = useState(0);

  const handleHighThreat = useCallback((payload) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setAlerts((prev) => [
      {
        id: ++alertSeq,
        time,
        title: `Phishing threat — score ${payload.score}`,
        message: payload.reasoning?.slice(0, 120) || payload.url,
        variant: 'danger',
      },
      ...prev.slice(0, 19),
    ]);
    setRisks((prev) => {
      const exists = prev.some((r) => r.url === payload.url);
      const entry = {
        id: ++riskSeq,
        url: payload.url,
        score: payload.score,
        brand: payload.brand || 'Unknown',
        risk: payload.risk || 'Dangerous',
      };
      if (exists) {
        return prev.map((r) => (r.url === payload.url ? { ...r, ...entry } : r));
      }
      return [entry, ...prev].slice(0, 10);
    });
  }, []);

  const handleDocumentScanned = useCallback((entry) => {
    setDocuments((prev) => [entry, ...prev].slice(0, 12));

    if (entry.verdict === 'tampered') {
      setDocTamperingCount((c) => c + 1);
    }

    if (!isFlaggedVerdict(entry.verdict)) return;

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const isTampered = entry.verdict === 'tampered';

    setAlerts((prev) => [
      {
        id: ++alertSeq,
        time,
        title: isTampered
          ? `${entry.filename} — tampering detected`
          : `${entry.filename} — figure alteration suspected`,
        message:
          entry.detail ||
          (isTampered
            ? 'Hash mismatch or metadata anomalies detected.'
            : 'Financial statement — figure alteration suspected'),
        variant: isTampered ? 'danger' : 'warning',
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  return (
    <div className="underwriter-dashboard">
      <DashboardStatsRow docTamperingCount={docTamperingCount} alertCount={alerts.length} />

      <div className="underwriter-grid">
        <div className="underwriter-grid__primary">
          <PhishingRadarCard onHighThreat={handleHighThreat} />
          <RecentDocumentsPanel documents={documents} onDocumentScanned={handleDocumentScanned} />
          <RegulatoryLiveFeed />
        </div>
        <aside className="underwriter-grid__side">
          <LiveAlertFeed alerts={alerts} />
          <TopRiskPanel risks={risks} />
          <DocumentCheckPanel />
        </aside>
      </div>
    </div>
  );
}
