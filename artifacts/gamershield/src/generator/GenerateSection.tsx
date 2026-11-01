import { Check, Copy, Eye, EyeOff, Gauge, RefreshCw, SlidersHorizontal } from 'lucide-react';
import {
  COPY_FORMATS, LIMITS, formatForCopy, isValidEnvName,
  type CopyFormat, type GeneratorSettings, type Problem, type StrengthDetails,
} from '@/lib/security';
import { strings } from './strings';
import { ProblemList } from './ProblemList';
import type { Batch, CopyStatus } from './GeneratorApp';

interface Props {
  settings: GeneratorSettings;
  problems: Problem[];
  batch: Batch | null;
  strength: StrengthDetails | null;
  stale: boolean;
  batchSize: number;
  onBatchSize: (size: number) => void;
  onGenerate: () => void;
  copyFormat: CopyFormat;
  onCopyFormat: (format: CopyFormat) => void;
  envName: string;
  onEnvName: (name: string) => void;
  revealed: boolean[];
  onReveal: (index: number, value: boolean) => void;
  onRevealAll: (value: boolean) => void;
  copyStatus: CopyStatus;
  onCopy: (index: number) => void;
  onShowStrength: (index: number) => void;
  onCustomize: () => void;
}

const sizes = Array.from({ length: LIMITS.batch.max - LIMITS.batch.min + 1 }, (_, i) => LIMITS.batch.min + i);

/** Dots the same length as the password, so a hidden choice still shows its length. */
export const mask = (password: string) => '•'.repeat(password.length);

export function GenerateSection(props: Props) {
  const { batch, revealed, copyFormat, envName } = props;
  const envValid = copyFormat !== 'env' || isValidEnvName(envName);
  const allRevealed = revealed.length > 0 && revealed.every(Boolean);

  return (
    <section aria-labelledby="generate-heading">
      <div className="pg-section-head">
        <h2 id="generate-heading">{strings.generate.heading}</h2>
        <p className="pg-muted">{strings.generate.intro}</p>
      </div>

      <div className="pg-toolbar">
        <p className="pg-summary">
          <strong>{strings.summary(props.settings)}</strong>
          <button type="button" className="pg-link-button" onClick={props.onCustomize} data-testid="button-change-settings">
            <SlidersHorizontal size={15} aria-hidden="true" /> {strings.generate.change}
          </button>
        </p>
        <div className="pg-toolbar-row">
          <button
            type="button"
            className="pg-button pg-button-primary"
            onClick={props.onGenerate}
            disabled={props.problems.length > 0}
            data-tour="generate-button"
            data-testid="button-generate"
          >
            <RefreshCw size={18} aria-hidden="true" /> {strings.generate.button}
          </button>
          <fieldset className="pg-segment pg-segment-small">
            <legend>{strings.generate.howMany}</legend>
            {sizes.map((size) => (
              <label key={size}>
                <input type="radio" name="batch-size" value={size} checked={props.batchSize === size} onChange={() => props.onBatchSize(size)} />
                <span>{size}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </div>

      {props.problems.length > 0 && <ProblemList problems={props.problems} action={{ label: strings.generate.change, onClick: props.onCustomize }} />}
      {props.stale && props.problems.length === 0 && <p className="pg-notice" role="status">{strings.generate.stale}</p>}

      <div className="pg-copy-options">
        <fieldset className="pg-segment">
          <legend>{strings.copy.formatLabel}</legend>
          {COPY_FORMATS.map((format) => (
            <label key={format}>
              <input type="radio" name="copy-format" value={format} checked={copyFormat === format} onChange={() => props.onCopyFormat(format)} data-testid={`radio-format-${format}`} />
              <span>{strings.copy.formats[format]}</span>
            </label>
          ))}
        </fieldset>
        {copyFormat === 'env' && (
          <div className="pg-field pg-field-inline">
            <label htmlFor="env-name">{strings.copy.envName}</label>
            <input
              id="env-name"
              type="text"
              value={envName}
              onChange={(event) => props.onEnvName(event.target.value)}
              aria-invalid={!envValid}
              aria-describedby={envValid ? undefined : 'env-name-error'}
              autoComplete="off"
              spellCheck={false}
              maxLength={64}
              data-testid="input-env-name"
            />
            {!envValid && <p id="env-name-error" className="pg-error-text">{strings.copy.envNameError}</p>}
          </div>
        )}
      </div>

      {batch && (
        <>
          <div className="pg-list-head">
            {props.strength && <p className="pg-muted">{strings.generate.perChoice(props.strength.bits)}</p>}
            <button type="button" className="pg-button pg-button-quiet" aria-pressed={allRevealed} onClick={() => props.onRevealAll(!allRevealed)} data-testid="button-reveal-all">
              {allRevealed ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              {allRevealed ? strings.generate.hideAll : strings.generate.revealAll}
            </button>
          </div>
          <ol className="pg-choices" data-testid="list-choices">
            {batch.passwords.map((password, index) => {
              const shown = revealed[index] ?? false;
              const status = props.copyStatus?.index === index ? props.copyStatus.state : null;
              const preview = envValid ? formatForCopy(shown ? password : mask(password), copyFormat, envName) : '';
              return (
                <li key={password} className="pg-choice" aria-labelledby={`choice-${index}-label`}>
                  <div className="pg-choice-head">
                    <span id={`choice-${index}-label`} className="pg-choice-num">{strings.generate.choice(index + 1)}</span>
                    <span className="pg-muted">{strings.generate.length(password.length)}</span>
                  </div>
                  <p className="pg-value" data-testid={`text-choice-${index}`}>
                    {shown ? password : <><span aria-hidden="true">{mask(password)}</span><span className="pg-sr-only">{strings.generate.hiddenValue}</span></>}
                  </p>
                  {envValid && (
                    <p className="pg-preview">
                      <span>{strings.copy.previewLabel}</span>
                      <code aria-hidden={!shown} data-testid={`text-preview-${index}`}>{preview}</code>
                    </p>
                  )}
                  <div className="pg-choice-actions">
                    <button
                      type="button"
                      className="pg-button pg-button-primary"
                      onClick={() => props.onCopy(index)}
                      disabled={!envValid}
                      aria-label={`${strings.copy.button(strings.copy.formats[copyFormat])}, ${strings.generate.choice(index + 1)}`}
                      data-tour={index === 0 ? 'copy-first' : undefined}
                      data-testid={`button-copy-${index}`}
                    >
                      {status === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                      {status === 'copied' ? strings.copy.done : strings.copy.button(strings.copy.formats[copyFormat])}
                    </button>
                    <button
                      type="button"
                      className="pg-button"
                      aria-pressed={shown}
                      onClick={() => props.onReveal(index, !shown)}
                      aria-label={`${shown ? strings.generate.hide : strings.generate.reveal}, ${strings.generate.choice(index + 1)}`}
                      data-testid={`button-reveal-${index}`}
                    >
                      {shown ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                      {shown ? strings.generate.hide : strings.generate.reveal}
                    </button>
                    <button
                      type="button"
                      className="pg-button pg-button-quiet"
                      onClick={() => props.onShowStrength(index)}
                      aria-label={`${strings.generate.seeStrength}, ${strings.generate.choice(index + 1)}`}
                    >
                      <Gauge size={16} aria-hidden="true" /> {strings.generate.seeStrength}
                    </button>
                  </div>
                  {status === 'failed' && <p className="pg-error-text" role="alert">{strings.copy.failed}</p>}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
