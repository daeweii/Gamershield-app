import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { assessPassword, countBreaches } from '@/lib/security';
import { ToolPanel } from './ToolPanel';

type BreachState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; count: number }
  | { kind: 'clear' }
  | { kind: 'unavailable' }
  | { kind: 'error' };

/** Password Check, moved from the old home page. Same behavior; logic now lives in lib/security. */
export function PasswordCheckTool() {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [breach, setBreach] = useState<BreachState>({ kind: 'idle' });

  // This score is a local estimate only. It does not predict every attack.
  const assessment = useMemo(() => assessPassword(password), [password]);
  const scoreClass = assessment.level.toLowerCase();

  async function checkBreachDatabase() {
    if (!password || breach.kind === 'loading') return;
    if (!globalThis.crypto?.subtle || typeof TextEncoder === 'undefined') {
      setBreach({ kind: 'unavailable' });
      return;
    }
    setBreach({ kind: 'loading' });
    try {
      const count = await countBreaches(password);
      setBreach(count > 0 ? { kind: 'found', count } : { kind: 'clear' });
    } catch {
      setBreach({ kind: 'error' });
    }
  }

  function updatePassword(value: string) {
    setPassword(value);
    setBreach({ kind: 'idle' });
  }

  const resultTone = breach.kind === 'found' ? ' alert' : breach.kind === 'unavailable' || breach.kind === 'error' ? ' notice' : '';

  return (
    <ToolPanel id="password-check" icon={ShieldCheck} title="Password Check">
      <label className="gs-input-label" htmlFor="password-input">Try a password or a made-up example</label>
      <form className="gs-password-wrap" autoComplete="off" onSubmit={(event) => event.preventDefault()}>
        <input
          id="password-input"
          type={visible ? 'text' : 'password'}
          value={password}
          onChange={(event) => updatePassword(event.target.value)}
          placeholder="Type a password to check"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="privacy-note"
          data-testid="input-password"
        />
        <button
          type="button"
          className="gs-show"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          data-testid="button-toggle-password"
        >
          {visible ? <><EyeOff size={15} /> Hide</> : <><Eye size={15} /> Show</>}
        </button>
      </form>
      <div className="gs-scoreline">
        <span className="gs-score-label">Strength estimate</span>
        <span className="gs-score" aria-live="polite" data-testid="status-password-strength">
          <em>{password ? `${assessment.score}/6` : '—/6'}</em>
          <b className={password ? scoreClass : ''}>{password ? assessment.level : 'WAITING'}</b>
        </span>
      </div>
      <div className="gs-meter" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={6} aria-valuenow={password ? assessment.score : 0} aria-valuetext={password ? `${assessment.level}, ${assessment.score} out of 6` : 'Waiting for a password'} data-testid="meter-password-strength">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className={password && index < assessment.score ? `filled ${scoreClass}` : ''} />
        ))}
      </div>
      <div className="gs-meter-caption"><span>WEAK</span><span>OKAY</span><span>STRONG</span></div>
      <div className="gs-tips" data-testid="text-password-tips">
        <strong>{password ? (assessment.containsRiskyTerm ? 'One thing to change' : 'Try this next') : 'A quick note'}</strong>
        <ul>{assessment.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
      </div>
      <button
        type="button"
        className="gs-breach"
        onClick={checkBreachDatabase}
        disabled={!password || breach.kind === 'loading'}
        data-testid="button-check-breach"
      >
        {breach.kind === 'loading' ? <span aria-hidden="true">Checking…</span> : <><AlertTriangle size={16} /> Check breach database</>}
      </button>
      <p className="gs-privacy" id="privacy-note">
        <LockKeyhole size={13} />
        <span>Everything you type stays on your device. We never see or save it. The optional breach check sends only the first five hash characters to Have I Been Pwned, not to Sentrix.</span>
      </p>
      <div className={`gs-result${resultTone}`} role="status" aria-live="polite" data-testid="status-breach-result">
        {breach.kind === 'idle' && <><strong>Optional breach check</strong>It is your choice. Nothing is checked unless you press the button.</>}
        {breach.kind === 'loading' && <><strong>Checking HIBP…</strong>Your password stays in this browser while the hash prefix is checked.</>}
        {breach.kind === 'found' && <><strong>Found in known breaches</strong>This password appeared {breach.count.toLocaleString()} times in known breach data. Change it anywhere you use it. Do not reuse it.</>}
        {breach.kind === 'clear' && <><strong>No match found</strong>HIBP did not find this password in its available breach data. That does not guarantee it is safe or private.</>}
        {breach.kind === 'unavailable' && <><strong>Secure check not available</strong>This browser cannot run the required SHA-1 operation. No request was made.</>}
        {breach.kind === 'error' && <><strong>Could not complete the check</strong>The breach service may be unavailable or blocked. Your password was not sent, but the five-character hash prefix was requested.</>}
      </div>
      <p className="gs-privacy">
        <Check size={13} />
        <span><b>How it stays private:</b> HIBP uses k-anonymity. Your browser sends the first 5 characters of a SHA-1 hash. HIBP returns possible matches, and your browser checks the rest. The password and full hash are never sent.</span>
      </p>
    </ToolPanel>
  );
}
