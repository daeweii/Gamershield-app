import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { calculateSubnet, type SubnetError } from '@/lib/network/subnet';
import { ToolPanel } from './ToolPanel';
import { Notice, ResultTable } from './shared';

const ERRORS: Record<SubnetError, string> = {
  'bad-address': 'The IP address isn’t valid. Use four numbers from 0–255, like 192.168.1.10.',
  'bad-prefix': 'Add a prefix length after a slash (like /24) or a subnet mask (like 255.255.255.0). Prefixes go from 0 to 32.',
  'bad-mask': 'The subnet mask isn’t a valid address. It should look like 255.255.255.0.',
  'non-contiguous-mask': 'That mask has gaps. A valid mask is all 1 bits followed by all 0 bits (like 255.255.240.0), never mixed.',
};

const n = (x: number) => x.toLocaleString();

export function SubnetTool() {
  const [input, setInput] = useState('192.168.1.130/24');
  const parsed = useMemo(() => (input.trim() ? calculateSubnet(input) : null), [input]);

  return (
    <ToolPanel id="subnet" icon={Calculator} title="Subnet Calculator">
      <label className="gs-input-label" htmlFor="subnet-input">IPv4 address with prefix or mask</label>
      <input id="subnet-input" className="gs-input" value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="192.168.1.130/24 or 10.0.0.5 255.255.255.0" spellCheck={false} autoComplete="off"
        aria-invalid={!!parsed && !parsed.ok} data-testid="input-subnet" />
      <div className="gs-sample-row" aria-label="Examples">
        {['192.168.1.130/24', '10.20.30.77/26', '172.16.45.9/20', '10.0.0.5 255.255.255.252', '10.0.0.0/31'].map((ex) => (
          <button key={ex} type="button" className="gs-chip" onClick={() => setInput(ex)}>{ex}</button>
        ))}
      </div>
      <div aria-live="polite">
        {parsed && !parsed.ok && <Notice tone="bad" title="Can’t calculate that">{ERRORS[parsed.error]}</Notice>}
        {parsed?.ok && (() => {
          const r = parsed.result;
          return (
            <>
              <ResultTable caption="Subnet details" rows={[
                ['Network address', `${r.network}/${r.prefix}`],
                ['Subnet mask', r.mask],
                ['Wildcard mask', r.wildcard],
                ['Broadcast address', r.broadcast],
                ['Usable host range', r.usableHosts === 1 ? r.firstHost : `${r.firstHost} – ${r.lastHost}`],
                ['Usable hosts', n(r.usableHosts)],
                ['Total addresses', n(r.totalAddresses)],
                ['Mask in binary', r.maskBinary],
                ['Address in binary', <><span className="gs-highlight">{r.addressBinarySplit.split('|')[0] || '(none)'}</span> {r.addressBinarySplit.split('|')[1]}</>],
              ]} />
              <p className="gs-hint">
                The first {r.prefix} bits (highlighted) identify the network; the other {32 - r.prefix} bits number the hosts inside it.
                {r.note === 'point-to-point' && ' A /31 is a special case (RFC 3021) for links between two routers: both addresses are usable and there’s no broadcast.'}
                {r.note === 'single-host' && ' A /32 is exactly one address, often used for a single host route or firewall rule.'}
                {!r.note && ' The network and broadcast addresses can’t be given to devices, which is why usable hosts is total minus 2.'}
              </p>
            </>
          );
        })()}
      </div>
    </ToolPanel>
  );
}
