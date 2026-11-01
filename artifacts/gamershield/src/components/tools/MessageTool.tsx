import { useState } from 'react';
import { LockKeyhole, MessageSquareWarning, Search } from 'lucide-react';
import { checkMessage } from '@/lib/security';
import { SAMPLE_MESSAGES } from '@/content/guides';
import { ToolPanel } from './ToolPanel';

export function MessageTool() {
  const [message, setMessage] = useState('');
  const [hits, setHits] = useState<string[] | null>(null);

  return (
    <ToolPanel id="message-check" icon={MessageSquareWarning} title="Scam Message Checker">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (message.trim()) setHits(checkMessage(message));
        }}
      >
        <label className="gs-input-label" htmlFor="message-input">Paste the DM or message you got</label>
        <textarea
          id="message-input"
          className="gs-textarea"
          value={message}
          onChange={(event) => { setMessage(event.target.value); setHits(null); }}
          placeholder="e.g. hey sorry i accidentally reported you, send me your login code so staff can fix it"
          autoComplete="off"
          spellCheck={false}
          data-testid="input-message"
        />
        <div className="gs-sample-row" role="group" aria-label="Practice with a fictional sample message">
          <span className="gs-hint" style={{ margin: 0, alignSelf: 'center' }}>Try a sample:</span>
          {SAMPLE_MESSAGES.map((sample) => (
            <button key={sample.label} type="button" className="gs-chip" onClick={() => { setMessage(sample.text); setHits(checkMessage(sample.text)); }}>
              {sample.label}
            </button>
          ))}
        </div>
        <button type="submit" className="gs-breach" disabled={!message.trim()} data-testid="button-check-message">
          <Search size={16} /> Check message
        </button>
      </form>

      <p className="gs-privacy">
        <LockKeyhole size={13} />
        <span>The message stays on your device. Nothing is saved.</span>
      </p>

      <div role="status" aria-live="polite" data-testid="status-message-result">
        {hits && hits.length === 0 && (
          <div className="gs-result">
            <strong>No common scam phrases found</strong>
            Still, never click links or share codes if something feels off.
          </div>
        )}
        {hits && hits.length > 0 && (
          <div className="gs-result alert">
            <strong>Watch out: matches {hits.length} scam pattern{hits.length === 1 ? '' : 's'}</strong>
            <ul>{hits.map((reason) => <li key={reason}>{reason}</li>)}</ul>
          </div>
        )}
      </div>
    </ToolPanel>
  );
}
