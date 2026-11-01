import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { writeClipboard } from '@/lib/platform/clipboard';
import { toast } from '@/hooks/use-toast';

/** Copy button with instant feedback (icon change + toast) and an honest failure message. */
export function CopyButton({ text, label = 'Copy', what = 'Text', disabled = false, testId }: {
  text: string; label?: string; what?: string; disabled?: boolean; testId?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await writeClipboard(text);
      setCopied(true);
      toast({ title: `${what} copied` });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Couldn’t copy automatically', description: 'Select the text and copy it by hand.', variant: 'destructive' });
    }
  }

  return (
    <button type="button" className="gs-secondary" onClick={copy} disabled={disabled || !text} data-testid={testId}>
      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

/** Two-or-more option switch built on real radio buttons (arrow keys work). */
export function ModeSwitch<T extends string>({ name, value, options, onChange, label }: {
  name: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; label: string;
}) {
  return (
    <fieldset className="gs-mode-switch">
      <legend className="sx-sr-only">{label}</legend>
      {options.map((o) => (
        <label key={o.value}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} data-testid={`radio-${name}-${o.value}`} />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** A label/value table for results. Values are rendered as text, never HTML. */
export function ResultTable({ rows, caption }: { rows: [string, ReactNode][]; caption?: string }) {
  return (
    <dl className="gs-kv" aria-label={caption}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'good' | 'bad' | 'warn'; title?: string; children: ReactNode }) {
  const cls = tone === 'bad' ? ' alert' : tone === 'warn' ? ' notice' : tone === 'info' ? ' info' : '';
  return (
    <div className={`gs-result${cls}`} role="status">
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
}
