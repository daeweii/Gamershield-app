import { useState } from 'react';
import { Search, Server, ShieldCheck } from 'lucide-react';
import { RECORD_TYPE_NAMES, lookupDns, normalizeDomain, type DnsResult, type RecordType } from '@/lib/network/dns';
import { ToolPanel } from './ToolPanel';
import { ModeSwitch, Notice } from './shared';

export const RECORD_EXPLANATIONS: Record<RecordType, string> = {
  A: 'Maps a name to an IPv4 address. This is what your browser needs to connect.',
  AAAA: 'Maps a name to an IPv6 address.',
  CNAME: 'An alias: “this name is really that other name.” The lookup continues at the target.',
  MX: 'Mail servers for the domain. The number is the priority (lower is tried first).',
  TXT: 'Free-form text. Used for email security (SPF, DMARC) and proving domain ownership.',
  NS: 'The name servers that are the official source of the domain’s records.',
  SOA: 'Start of Authority: the primary name server, admin contact, and timing settings for the zone.',
  CAA: 'Which certificate authorities may issue HTTPS certificates for the domain. Blocks rogue certificates.',
};

const DOMAIN_ERRORS = {
  'empty': 'Type a domain name, like example.com.',
  'invalid': 'That doesn’t look like a valid domain name. Use a full name like example.com (no spaces).',
  'ip-address': 'That’s an IP address. DNS Lookup turns names into addresses. Try the IP Information tool for addresses.',
};

type State = { kind: 'idle' } | { kind: 'loading' } | { kind: 'done'; domain: string; type: RecordType; result: DnsResult } | { kind: 'error'; message: string };

export function DnsTool() {
  const [domain, setDomain] = useState('');
  const [type, setType] = useState<RecordType>('A');
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function lookup(nextType = type) {
    const check = normalizeDomain(domain);
    if (!check.ok) { setState({ kind: 'error', message: DOMAIN_ERRORS[check.error] }); return; }
    setState({ kind: 'loading' });
    try {
      setState({ kind: 'done', domain: check.domain, type: nextType, result: await lookupDns(check.domain, nextType) });
    } catch {
      setState({ kind: 'error', message: 'Couldn’t reach the DNS service. You may be offline, or a network filter may block DNS-over-HTTPS.' });
    }
  }

  return (
    <ToolPanel id="dns" icon={Server} title="DNS Lookup" tag="USES CLOUDFLARE">
      <form onSubmit={(e) => { e.preventDefault(); lookup(); }}>
        <label className="gs-input-label" htmlFor="dns-domain">Domain name</label>
        <div className="gs-row">
          <input id="dns-domain" className="gs-input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. example.com"
            spellCheck={false} autoComplete="off" autoCapitalize="off" aria-describedby="dns-privacy" data-testid="input-domain" />
          <button type="submit" className="gs-breach" disabled={!domain.trim() || state.kind === 'loading'} data-testid="button-lookup">
            <Search size={16} aria-hidden="true" /> {state.kind === 'loading' ? 'Looking up…' : 'Look up'}
          </button>
        </div>
      </form>
      <ModeSwitch name="rtype" label="Record type" value={type} onChange={(t) => { setType(t); if (state.kind === 'done') lookup(t); }}
        options={RECORD_TYPE_NAMES.map((t) => ({ value: t, label: t }))} />
      <p className="gs-hint"><strong>{type}:</strong> {RECORD_EXPLANATIONS[type]}</p>
      <p className="gs-privacy" id="dns-privacy">
        <span>Pressing Look up sends the domain name to Cloudflare’s public DNS service (cloudflare-dns.com) over HTTPS. Cloudflare sees the domain and your IP address, as any DNS server would. Nothing else is sent.</span>
      </p>

      <div aria-live="polite">
        {state.kind === 'error' && <Notice tone="bad" title="Can’t look that up">{state.message}</Notice>}
        {state.kind === 'done' && (() => {
          const { result } = state;
          if (result.status === 'NXDOMAIN') return <Notice tone="bad" title="Domain doesn’t exist (NXDOMAIN)">No DNS records exist for {state.domain}. Check the spelling. Scam links often use domains that were taken down.</Notice>;
          if (result.status !== 'NOERROR') return <Notice tone="warn" title={`DNS error: ${result.status}`}>The DNS server couldn’t answer. Try again later.</Notice>;
          if (!result.answers.length) return <Notice tone="info" title={`No ${state.type} records`}>{state.domain} exists but has no {state.type} records. Try another record type.</Notice>;
          return (
            <>
              <p className="gs-input-label">
                {result.answers.length} answer{result.answers.length === 1 ? '' : 's'} for {state.domain}
                {result.dnssecValidated && <span className="sx-badge sx-badge-good" style={{ marginLeft: 8 }}><ShieldCheck size={13} aria-hidden="true" />DNSSEC validated</span>}
              </p>
              <div className="gs-table-wrap">
                <table className="gs-table" data-testid="table-dns">
                  <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">TTL</th><th scope="col">Value</th></tr></thead>
                  <tbody>
                    {result.answers.map((a, i) => (
                      <tr key={`${a.type}-${a.data}-${i}`}><td className="mono">{a.name}</td><td>{a.type}</td><td>{a.ttl}s</td><td className="mono">{a.data}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="gs-hint">TTL (time to live) is how many seconds resolvers may cache the answer before asking again.</p>
            </>
          );
        })()}
      </div>
    </ToolPanel>
  );
}
