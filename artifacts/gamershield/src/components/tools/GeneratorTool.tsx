import { useState } from 'react';
import { Check, Copy, KeyRound, RefreshCw } from 'lucide-react';
import { describeBits, generatePassphrase, generatePassword, passphraseBits, passwordBits } from '@/lib/security';
import { ToolPanel } from './ToolPanel';

type Mode = 'password' | 'passphrase';

const MODES: Record<Mode, { label: string; hint: string; make: () => string; bits: number }> = {
  password: {
    label: 'Random password',
    hint: 'Strongest option. Best with a password manager.',
    make: () => generatePassword(),
    bits: passwordBits(),
  },
  passphrase: {
    label: 'Passphrase',
    hint: 'Easier to remember and type on a controller.',
    make: () => generatePassphrase(),
    bits: passphraseBits(),
  },
};

export function GeneratorTool() {
  const [mode, setMode] = useState<Mode>('password');
  // Made in this browser with crypto.getRandomValues(). Never sent or saved.
  const [value, setValue] = useState(() => MODES.password.make());
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  function regenerate(next: Mode = mode) {
    setMode(next);
    setValue(MODES[next].make());
    setCopyState('idle');
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      // Clipboard access can be blocked by the browser. Selecting still works.
      setCopyState('failed');
    }
  }

  const { verdict, explanation } = describeBits(MODES[mode].bits);

  return (
    <ToolPanel id="generator" icon={KeyRound} title="Password Generator">
      <div className="gs-segment" role="group" aria-label="What to make">
        {(Object.keys(MODES) as Mode[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => regenerate(option)}
            data-testid={`button-mode-${option}`}
          >
            {MODES[option].label}
          </button>
        ))}
      </div>
      <p className="gs-hint">{MODES[mode].hint}</p>

      <output className="gs-output" aria-live="polite" data-testid="text-generated">{value}</output>

      <div className="gs-actions">
        <button type="button" className="gs-breach" onClick={copy} data-testid="button-copy">
          {copyState === 'copied' ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
        </button>
        <button type="button" className="gs-secondary" onClick={() => regenerate()} data-testid="button-regenerate">
          <RefreshCw size={16} /> Make another
        </button>
      </div>
      {copyState === 'failed' && (
        <div className="gs-result notice" role="status"><strong>Couldn’t copy automatically</strong>Tap and hold the text above to copy it.</div>
      )}

      <div className="gs-scoreline">
        <span className="gs-score-label">Guessing difficulty</span>
        <span className="gs-score" data-testid="status-entropy">
          <em>about {Math.round(MODES[mode].bits)} bits</em>
          <b className={verdict.toLowerCase()}>{verdict}</b>
        </span>
      </div>
      <p className="gs-hint">{explanation} Every extra bit doubles the guesses an attacker needs.</p>

      <div className="gs-tips">
        <strong>Tip</strong>
        Save it in a free password manager like Bitwarden so you don’t have to memorize it. Use a different one for every account.
      </div>
    </ToolPanel>
  );
}
