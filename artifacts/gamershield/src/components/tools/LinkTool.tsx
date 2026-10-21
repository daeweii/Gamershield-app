import { useState } from 'react';
import { Link2, LockKeyhole, Search } from 'lucide-react';
import { checkLink } from '@/lib/security';
import { ToolPanel } from './ToolPanel';

export function LinkTool() {
  const [link, setLink] = useState('');
  const [warnings, setWarnings] = useState<string[] | null>(null);

  return (
    <ToolPanel id="link-check" icon={Link2} title="Scam Link Checker">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (link.trim()) setWarnings(checkLink(link));
        }}
      >
        <label className="gs-input-label" htmlFor="link-input">Paste a link someone sent you</label>
        <div className="gs-password-wrap">
          <input
            id="link-input"
            type="text"
            inputMode="url"
            value={link}
            onChange={(event) => { setLink(event.target.value); setWarnings(null); }}
            placeholder="e.g. steamcommunlty.com/gift"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            data-testid="input-link"
          />
        </div>
        <button type="submit" className="gs-breach" disabled={!link.trim()} data-testid="button-check-link">
          <Search size={16} /> Check link
        </button>
      </form>

      <p className="gs-privacy">
        <LockKeyhole size={13} />
        <span>The link is only read as text. GamerShield never opens it.</span>
      </p>

      {/* Results are plain text in JSX, so React escapes anything pasted. The link is never made clickable. */}
      <div role="status" aria-live="polite" data-testid="status-link-result">
        {warnings && warnings.length === 0 && (
          <div className="gs-result">
            <strong>Looks like an official site</strong>
            Still, the safest move is to type the address yourself instead of clicking.
          </div>
        )}
        {warnings && warnings.length > 0 && (
          <div className="gs-result alert">
            <strong>Danger: {warnings.length} red flag{warnings.length === 1 ? '' : 's'} found</strong>
            <ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
            Don’t click it. Don’t log in. If a friend sent it, their account may be hacked.
          </div>
        )}
      </div>
    </ToolPanel>
  );
}
