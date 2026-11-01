import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ScanSearch } from 'lucide-react';
import { dissectUrl } from '@/lib/security/urlParts';
import { ToolPanel } from './ToolPanel';
import { Notice, ResultTable } from './shared';

export function UrlInspectorTool() {
  const [input, setInput] = useState('https://discord.com.nitro-gift.ru/claim?user=you');
  const parts = useMemo(() => dissectUrl(input), [input]);

  const notes: string[] = [];
  if (parts) {
    if (parts.credentials) notes.push(`Everything before the “@” (${parts.credentials}) is ignored by the browser. The link really goes to ${parts.hostname}.`);
    if (parts.subdomain && /\.(com|net|org|gg|tv)$/.test(parts.subdomain)) notes.push(`“${parts.subdomain}” is just a subdomain of ${parts.registrableDomain}. Putting a real site’s name on the left is a classic disguise.`);
    if (parts.punycodeLabels.length) notes.push('The address contains xn-- (punycode): letters from another alphabet that may imitate a real name.');
    if (parts.isIpAddress) notes.push('This link uses a raw IP address instead of a name. Real services almost never send links like this.');
    if (parts.scheme === 'http') notes.push('It uses http, not https: anything you send can be read in transit. Never log in on a page like this.');
    if (parts.port) notes.push(`It uses an unusual port (${parts.port}). Normal websites don’t need one.`);
  }

  return (
    <ToolPanel id="url-inspector" icon={ScanSearch} title="URL Safety Inspector">
      <label className="gs-input-label" htmlFor="url-input">Paste a link to take apart</label>
      <input id="url-input" className="gs-input" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} autoComplete="off"
        aria-invalid={!!input.trim() && !parts} data-testid="input-url-inspect" />
      <div className="gs-sample-row" aria-label="Examples">
        {['https://www.epicgames.com/help', 'https://steamcommunity.com@login-steam.example/auth', 'http://192.168.0.44:8080/gift', 'shop.example.co.uk/deals'].map((ex) => (
          <button key={ex} type="button" className="gs-chip" onClick={() => setInput(ex)}>{ex}</button>
        ))}
      </div>
      <div aria-live="polite">
        {input.trim() && !parts && <Notice tone="bad" title="Can’t read that link">It doesn’t look like a web address.</Notice>}
        {parts && (
          <>
            <Notice tone={notes.length ? 'bad' : 'info'} title={`Real destination: ${parts.registrableDomain}`}>
              This is the part of the address that decides which organization you’re really dealing with
              {parts.isIpAddress ? '.' : ' (best guess; a few country endings like .co.uk span two parts).'}
            </Notice>
            {notes.length > 0 && <ul className="gs-hint">{notes.map((n) => <li key={n}>{n}</li>)}</ul>}
            <ResultTable caption="Link parts" rows={[
              ['Scheme', parts.scheme],
              ...(parts.credentials ? [['Before the @', parts.credentials] as [string, string]] : []),
              ['Subdomain', parts.subdomain || '(none)'],
              ['Registered domain', <span className="gs-highlight">{parts.registrableDomain}</span>],
              ...(parts.port ? [['Port', parts.port] as [string, string]] : []),
              ['Path', parts.path],
              ...parts.query.map(([k, v]) => [`Query: ${k}`, v] as [string, string]),
              ...(parts.fragment ? [['Fragment', parts.fragment] as [string, string]] : []),
            ]} />
          </>
        )}
      </div>
      <p className="gs-hint">
        This shows how a link is built. It can’t prove a link is safe: a real domain can still host a scam page.
        For red-flag checks, try the <Link href="/security-awareness/link-checker">Scam Link Checker</Link>. The link is only read as text and never opened.
      </p>
    </ToolPanel>
  );
}
