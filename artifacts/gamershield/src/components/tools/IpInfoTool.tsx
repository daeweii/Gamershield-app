import { useMemo, useState } from 'react';
import { Globe, Wifi } from 'lucide-react';
import { analyzeIp, type IpKind } from '@/lib/network/ip';
import { fetchMyPublicIp } from '@/lib/network/dns';
import { ToolPanel } from './ToolPanel';
import { Notice, ResultTable } from './shared';

const KIND_TEXT: Record<IpKind, { label: string; explain: string }> = {
  'public': { label: 'Public', explain: 'Reachable across the internet. Websites you visit see an address like this, usually your router’s, not your device’s.' },
  'private': { label: 'Private (RFC 1918)', explain: 'Used inside homes, schools, and offices. It only works on the local network; the router translates it (NAT) to a public address.' },
  'loopback': { label: 'Loopback', explain: 'Means “this same device.” Traffic never leaves the computer.' },
  'link-local': { label: 'Link-local', explain: 'Self-assigned when a device can’t get an address (for example, no DHCP server). Only works on the local link.' },
  'multicast': { label: 'Multicast', explain: 'Sends one packet to a group of devices at once, used by things like local device discovery.' },
  'cgnat': { label: 'Carrier-grade NAT (shared)', explain: 'Your internet provider shares one public address among many customers. Common on mobile networks.' },
  'documentation': { label: 'Documentation example', explain: 'Reserved for examples in books and guides. It never appears on the real internet.' },
  'unspecified': { label: 'Unspecified', explain: 'Means “no address” or “any address.” Programs use it when listening on every network interface.' },
  'broadcast': { label: 'Broadcast', explain: 'Sends to every device on the local network.' },
  'reserved': { label: 'Reserved', explain: 'Set aside for special or future use. Not used for normal internet traffic.' },
  'unique-local': { label: 'Unique local (IPv6 private)', explain: 'The IPv6 version of a private address. Only works inside an organization’s network.' },
  'ipv4-mapped': { label: 'IPv4-mapped IPv6', explain: 'An IPv4 address written in IPv6 form, used by dual-stack systems.' },
};

export function IpInfoTool() {
  const [input, setInput] = useState('');
  const [myIpState, setMyIpState] = useState<'idle' | 'loading' | 'error'>('idle');
  const info = useMemo(() => (input.trim() ? analyzeIp(input) : null), [input]);

  async function showMyIp() {
    setMyIpState('loading');
    try {
      setInput(await fetchMyPublicIp());
      setMyIpState('idle');
    } catch {
      setMyIpState('error');
    }
  }

  const kind = info ? KIND_TEXT[info.kind] : null;

  return (
    <ToolPanel id="ip-info" icon={Globe} title="IP Information">
      <label className="gs-input-label" htmlFor="ip-input">IP address (IPv4 or IPv6)</label>
      <input id="ip-input" className="gs-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 192.168.1.20 or 2606:4700:4700::1111"
        spellCheck={false} autoComplete="off" aria-invalid={!!input.trim() && !info} aria-describedby="ip-privacy" data-testid="input-ip" />
      <div className="gs-sample-row" aria-label="Examples">
        {['192.168.1.20', '8.8.8.8', '127.0.0.1', '100.64.10.5', 'fe80::1', '2606:4700:4700::1111'].map((ip) => (
          <button key={ip} type="button" className="gs-chip" onClick={() => setInput(ip)}>{ip}</button>
        ))}
      </div>

      <div aria-live="polite">
        {input.trim() && !info && <Notice tone="bad" title="Not a valid IP address">Check the format. IPv4 is four numbers from 0–255 separated by dots; IPv6 is up to eight groups of hex digits separated by colons.</Notice>}
        {info && kind && (
          <>
            <Notice tone={info.routable ? 'info' : 'good'} title={`${kind.label} IPv${info.version} address`}>{kind.explain}</Notice>
            <ResultTable caption="Address details" rows={[
              ['Version', `IPv${info.version}`],
              ['Address', info.normalized],
              ['Type', kind.label],
              ...(info.range ? [['Reserved range', info.range] as [string, string]] : []),
              ['Reachable on the internet', info.routable ? 'Yes' : 'No'],
              ...(info.binary ? [['Binary', info.binary] as [string, string]] : []),
              ...(info.expanded ? [['Fully expanded', info.expanded] as [string, string]] : []),
            ]} />
          </>
        )}
      </div>

      <button type="button" className="gs-secondary" style={{ marginTop: 18 }} onClick={showMyIp} disabled={myIpState === 'loading'} data-testid="button-my-ip">
        <Wifi size={16} aria-hidden="true" /> {myIpState === 'loading' ? 'Asking ipify…' : 'Show my public IP'}
      </button>
      <p className="gs-privacy" id="ip-privacy">
        <span>Addresses you type are analyzed on this device. Only the “Show my public IP” button contacts an outside service: it asks api.ipify.org, which replies with your IP and nothing else (no location). Any website you visit can already see this address.</span>
      </p>
      {myIpState === 'error' && <Notice tone="warn" title="Couldn’t reach ipify">The service may be down or blocked by an ad blocker or network filter. Nothing else was sent.</Notice>}
    </ToolPanel>
  );
}
