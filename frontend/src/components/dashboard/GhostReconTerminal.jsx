import { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { useBilingual } from '../../hooks/useBilingual';

const SCAN_LINES = [
  '> INIT_GHOST_RECON_PROTOCOL...',
  '> RESOLVING_DNS...',
  '> FETCHING_SSL_CHAIN...',
  '> PARSING_PAGE_TITLE...',
  '> CORRELATING_THREAT_INTEL...',
];

function buildReconText(recon, threatScore) {
  const scoreLine = threatScore != null ? `> [THREAT_SCORE]: ${threatScore}` : null;
  return [
    `> [TITLE]: ${recon.title ?? '—'}`,
    `> [SSL]: ${recon.ssl ?? '—'}`,
    `> [GEO]: ${recon.country ?? '—'}`,
    `> [REP]: ${recon.rep ?? '—'}`,
    ...(scoreLine ? [scoreLine] : []),
    '> IDENT_MATCH: COMPLETED',
  ].join('\n');
}

export default function GhostReconTerminal({ recon, loading, threatScore }) {
  const { t } = useBilingual();
  const [typed, setTyped] = useState('');
  const fullText = recon ? buildReconText(recon, threatScore) : '';

  useEffect(() => {
    if (!loading) {
      setTyped('');
      return undefined;
    }

    setTyped('');
    let lineIdx = 0;
    const interval = setInterval(() => {
      lineIdx += 1;
      setTyped(SCAN_LINES.slice(0, lineIdx).join('\n'));
      if (lineIdx >= SCAN_LINES.length) clearInterval(interval);
    }, 420);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!recon || loading) return undefined;

    setTyped('');
    let i = 0;
    const interval = setInterval(() => {
      i += 2;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(interval);
    }, 18);

    return () => clearInterval(interval);
  }, [recon, loading, fullText]);

  const idle = !recon && !loading;
  const headLabel = loading ? t('ghostScanning') : recon ? 'RECON_DATA_FEED: ACTIVE' : t('ghostFeed');
  const showCursor = loading || (recon && typed.length < fullText.length);

  return (
    <div className={`ghost-terminal${idle ? ' ghost-terminal--idle' : ''}${loading ? ' ghost-terminal--loading' : ''}`}>
      <div className="ghost-terminal__head">
        <Terminal size={12} />
        <span>{headLabel}</span>
      </div>
      {idle ? (
        <p className="ghost-terminal__placeholder">{t('waitingScan')}</p>
      ) : (
        <pre className="ghost-terminal__body">
          {typed}
          {showCursor && <span className="ghost-terminal__cursor">▌</span>}
        </pre>
      )}
    </div>
  );
}
