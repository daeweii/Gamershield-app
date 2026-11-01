import { useMemo, useState } from 'react';
import { List } from 'lucide-react';
import { COMMON_PORTS, NETWORK_TERMS } from '@/content/networkTerms';
import { ToolPanel } from './ToolPanel';

export function NetworkTermsTool() {
  const [filter, setFilter] = useState('');
  const q = filter.trim().toLowerCase();
  const terms = useMemo(() => NETWORK_TERMS.filter((t) => !q || `${t.term} ${t.short} ${t.detail}`.toLowerCase().includes(q)), [q]);
  const ports = useMemo(() => COMMON_PORTS.filter((p) => !q || `${p.port} ${p.service} ${p.protocol} ${p.note}`.toLowerCase().includes(q)), [q]);

  return (
    <ToolPanel id="network-terms" icon={List} title="Network Terminology">
      <label className="gs-input-label" htmlFor="terms-filter">Filter terms and ports</label>
      <input id="terms-filter" type="search" className="gs-input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="e.g. DNS, 443, firewall" data-testid="input-terms-filter" />
      <p className="gs-hint" aria-live="polite">{terms.length} terms, {ports.length} ports</p>

      <div style={{ marginTop: 12 }}>
        {terms.map((t) => (
          <article key={t.term} className="gs-term">
            <h3>{t.term} <span className="sx-muted" style={{ fontWeight: 500 }}>· {t.short}</span></h3>
            <p>{t.detail}</p>
          </article>
        ))}
      </div>

      {ports.length > 0 && (
        <>
          <h3 style={{ margin: '24px 0 0', fontSize: 16 }}>Common ports</h3>
          <div className="gs-table-wrap">
            <table className="gs-table">
              <thead><tr><th scope="col">Port</th><th scope="col">Protocol</th><th scope="col">Service</th><th scope="col">Security note</th></tr></thead>
              <tbody>
                {ports.map((p) => (
                  <tr key={`${p.port}-${p.service}`}><td className="mono">{p.port}</td><td>{p.protocol}</td><td>{p.service}</td><td>{p.note}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ToolPanel>
  );
}
