import { ExternalLink, Eye, EyeOff } from 'lucide-react';
import { describeBits, type StrengthDetails } from '@/lib/security';
import { strings } from './strings';
import { mask } from './GenerateSection';
import type { Batch } from './GeneratorApp';

interface Props {
  batch: Batch | null;
  strength: StrengthDetails | null;
  selected: number;
  onSelect: (index: number) => void;
  revealed: boolean[];
  onReveal: (index: number, value: boolean) => void;
}

const NIST_URL = 'https://pages.nist.gov/800-63-4/sp800-63b.html';

export function StrengthSection({ batch, strength, selected, onSelect, revealed, onReveal }: Props) {
  if (!batch || !strength) {
    return (
      <section aria-labelledby="strength-heading">
        <div className="pg-section-head"><h2 id="strength-heading">{strings.strength.heading}</h2></div>
        <p className="pg-muted">{strings.strength.none}</p>
      </section>
    );
  }

  const index = Math.min(selected, batch.passwords.length - 1);
  const password = batch.passwords[index];
  const shown = revealed[index] ?? false;
  const { verdict } = describeBits(strength.bits);
  // The bar fills at 128 bits, a common "far beyond guessing" mark.
  const fill = Math.min(strength.bits / 128, 1);
  const c = strings.strength.considers;

  const considers: string[] = [];
  if (strength.mode === 'pin') considers.push(c.pin(strength.length!));
  else if (strength.mode === 'passphrase') {
    considers.push(c.words(strength.wordCount!, strength.wordListSize!));
    if (strength.addsNumber) considers.push(c.number);
    considers.push(c.fixed);
  } else {
    considers.push(c.characters(strength.length!, strength.poolSize!));
    if (strength.requiredTypes) considers.push(c.required(strength.requiredTypes));
  }

  return (
    <section aria-labelledby="strength-heading">
      <div className="pg-section-head"><h2 id="strength-heading">{strings.strength.heading}</h2></div>

      <fieldset className="pg-segment">
        <legend>{strings.strength.pick}</legend>
        {batch.passwords.map((_, i) => (
          <label key={i}>
            <input type="radio" name="strength-choice" checked={i === index} onChange={() => onSelect(i)} />
            <span>{i + 1}</span>
          </label>
        ))}
      </fieldset>

      <div className="pg-strength-card">
        <div className="pg-choice-head">
          <span className="pg-choice-num">{strings.generate.choice(index + 1)}</span>
          <button type="button" className="pg-button pg-button-quiet" aria-pressed={shown} onClick={() => onReveal(index, !shown)}>
            {shown ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            {shown ? strings.generate.hide : strings.generate.reveal}
          </button>
        </div>
        <p className="pg-value">{shown ? password : <><span aria-hidden="true">{mask(password)}</span><span className="pg-sr-only">{strings.generate.hiddenValue}</span></>}</p>

        <p className="pg-label">{strings.strength.estimateLabel}</p>
        <p className="pg-strength-score" data-testid="text-strength">
          <span className={`pg-verdict pg-verdict-${verdict.toLowerCase()}`}>{strings.strength.verdicts[verdict]}</span>
          <span>{strings.strength.bits(strength.bits)}</span>
        </p>
        <div
          className="pg-meter"
          role="meter"
          aria-label={strings.strength.estimateLabel}
          aria-valuemin={0}
          aria-valuemax={128}
          aria-valuenow={Math.round(Math.min(strength.bits, 128))}
          aria-valuetext={`${strings.strength.verdicts[verdict]}, ${strings.strength.bits(strength.bits)}`}
        >
          <span className={`pg-meter-fill pg-verdict-${verdict.toLowerCase()}`} style={{ width: `${fill * 100}%` }} />
        </div>
        <p className="pg-hint">{strings.strength.bitsExplainer}</p>
        {strength.mode === 'pin' && <p className="pg-notice">{strings.strength.pinWarning}</p>}
      </div>

      <div className="pg-columns">
        <div>
          <h3>{strings.strength.considersHeading}</h3>
          <ul className="pg-list">{considers.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
        <div>
          <h3>{strings.strength.limitsHeading}</h3>
          <ul className="pg-list">{strings.strength.limits.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      </div>

      <div className="pg-callout">
        <h3>{strings.strength.nistHeading}</h3>
        <ul className="pg-list">{strings.strength.nist.map((line) => <li key={line}>{line}</li>)}</ul>
        <a href={NIST_URL} target="_blank" rel="noopener noreferrer" className="pg-link">
          {strings.strength.nistLink} <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
