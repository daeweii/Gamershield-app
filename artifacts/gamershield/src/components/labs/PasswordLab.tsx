import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PASSWORD_LAB_QUIZ, PASSWORD_SAMPLES } from '@/content/labs';
import { analyzePassword } from '@/lib/labs/analysis';
import { completeLab } from '@/hooks/use-labs';
import { QuizBlock } from './QuizBlock';

const TYPE_LABELS = { lower: 'a–z (26)', upper: 'A–Z (26)', digits: '0–9 (10)', symbols: 'symbols (33)' } as const;

export function PasswordLab() {
  const [pw, setPw] = useState('dragon2026');
  const a = useMemo(() => analyzePassword(pw), [pw]);
  // A rough guide to scale: bits vs. a fast offline cracking rig. Patterns make real attacks far faster.
  const bitsLabel = a.bruteForceBits < 40 ? 'weak' : a.bruteForceBits < 60 ? 'moderate' : a.bruteForceBits < 80 ? 'strong' : 'very strong';

  return (
    <div className="sx-stack">
      <section className="sx-card" aria-labelledby="pw-lab-heading">
        <p className="sx-badge sx-badge-red">Experiment · use made-up examples, never a real password</p>
        <h2 id="pw-lab-heading" style={{ fontSize: 18, margin: '12px 0 8px' }}>Try a sample password</h2>
        <input className="gs-input" value={pw} onChange={(e) => setPw(e.target.value)} spellCheck={false} autoComplete="off" aria-label="Sample password" data-testid="input-lab-password" />
        <div className="gs-sample-row">
          {PASSWORD_SAMPLES.map((s) => <button key={s} type="button" className="gs-chip" onClick={() => setPw(s)}>{s}</button>)}
        </div>
        <dl className="gs-kv" data-testid="pw-analysis">
          <div><dt>Length</dt><dd>{a.length} characters</dd></div>
          <div><dt>Character types</dt><dd>{(Object.keys(TYPE_LABELS) as (keyof typeof TYPE_LABELS)[]).filter((t) => a.types[t]).map((t) => TYPE_LABELS[t]).join(' + ') || 'none'}</dd></div>
          <div><dt>Pool size</dt><dd>{a.poolSize} possible characters per position</dd></div>
          <div><dt>If fully random</dt><dd>{a.length} × log₂({a.poolSize || 1}) ≈ {Math.round(a.bruteForceBits)} bits ({bitsLabel})</dd></div>
        </dl>
        <div aria-live="polite">
          {a.findings.length > 0 ? (
            <div className="gs-result alert" style={{ marginTop: 12 }}>
              <strong><AlertTriangle size={15} aria-hidden="true" /> Patterns found: the real strength is much lower</strong>
              <ul>{a.findings.map((f) => <li key={f.id}>{f.label}</li>)}</ul>
            </div>
          ) : a.length > 0 && <p className="gs-hint">No common patterns found. The bit count is only a ceiling: it assumes every character was chosen at random.</p>}
        </div>
        <p className="gs-hint">
          Notice how adding length raises the bits far faster than adding one symbol, and how patterns like words, years, and keyboard runs undercut the math entirely.
        </p>
      </section>
      <QuizBlock id="pwlab" title="Knowledge check" questions={PASSWORD_LAB_QUIZ} onPass={() => completeLab('password-lab')} />
    </div>
  );
}
