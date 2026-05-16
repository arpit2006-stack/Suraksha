import { Terminal } from 'lucide-react';
import { useBilingual } from '../../hooks/useBilingual';

export default function GhostReconTerminal({ recon }) {
  const { t } = useBilingual();

  if (!recon) {
    return (
      <div className="ghost-terminal ghost-terminal--idle">
        <div className="ghost-terminal__head">
          <Terminal size={12} />
          <span>{t('ghostFeed')}</span>
        </div>
        <p className="ghost-terminal__placeholder">{t('waitingScan')}</p>
      </div>
    );
  }

  return (
    <div className="ghost-terminal">
      <div className="ghost-terminal__head">
        <Terminal size={12} />
        <span>RECON_DATA_FEED: ACTIVE</span>
      </div>
      <pre className="ghost-terminal__body">
{`> [TITLE]: ${recon.title ?? '—'}
> [SSL]: ${recon.ssl ?? '—'}
> [GEO]: ${recon.country ?? '—'}
> [REP]: ${recon.rep ?? '—'}
> IDENT_MATCH: COMPLETED`}
      </pre>
    </div>
  );
}
