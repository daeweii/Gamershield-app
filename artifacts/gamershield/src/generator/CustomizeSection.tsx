import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  CHAR_TYPES, LIMITS, MODES, PASSPHRASE_SEPARATORS, PRESETS, WORDS, applyPreset,
  type CharType, type GeneratorSettings, type Mode, type PassphraseSeparator, type Problem,
} from '@/lib/security';
import { strings } from './strings';
import { ProblemList } from './ProblemList';

interface Props {
  settings: GeneratorSettings;
  problems: Problem[];
  onChange: (settings: GeneratorSettings) => void;
  onApply: () => void;
}

/** A number typed into a box. Empty or partial input becomes NaN, which the rules report as a problem. */
const readNumber = (value: string) => (value.trim() === '' ? Number.NaN : Number(value));
const shown = (n: number) => (Number.isNaN(n) ? '' : String(n));

function NumberField({ id, label, value, min, max, onChange, slider = false }: {
  id: string; label: string; value: number; min: number; max: number; onChange: (n: number) => void; slider?: boolean;
}) {
  return (
    <div className="pg-field">
      <label htmlFor={id}>{label}</label>
      <div className="pg-number-row">
        {slider && (
          <input
            type="range"
            min={min}
            max={max}
            value={Number.isNaN(value) ? min : Math.min(Math.max(value, min), max)}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label={label}
            aria-valuetext={shown(value)}
            tabIndex={-1}
          />
        )}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={shown(value)}
          onChange={(event) => onChange(readNumber(event.target.value))}
          data-testid={`input-${id}`}
        />
      </div>
    </div>
  );
}

function Checkbox({ id, label, checked, onChange, hint }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="pg-check">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} aria-describedby={hint ? `${id}-hint` : undefined} data-testid={`check-${id}`} />
      <label htmlFor={id}>{label}</label>
      {hint && <p id={`${id}-hint`} className="pg-hint">{hint}</p>}
    </div>
  );
}

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="pg-group">
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

export function CustomizeSection({ settings, problems, onChange, onApply }: Props) {
  const mode = settings.mode;
  const setMode = (next: Mode) => onChange({ ...settings, mode: next });
  const patchRandom = (patch: Partial<GeneratorSettings['random']>) => onChange({ ...settings, random: { ...settings.random, ...patch } });
  const patchPhrase = (patch: Partial<GeneratorSettings['passphrase']>) => onChange({ ...settings, passphrase: { ...settings.passphrase, ...patch } });
  const patchSite = (patch: Partial<GeneratorSettings['site']>) => onChange({ ...settings, site: { ...settings.site, ...patch } });
  const toggle = (record: Record<CharType, boolean>, type: CharType, value: boolean) => ({ ...record, [type]: value });

  return (
    <section aria-labelledby="customize-heading">
      <div className="pg-section-head">
        <h2 id="customize-heading">{strings.customize.heading}</h2>
      </div>

      <fieldset className="pg-modes" data-tour="rules">
        <legend>{strings.customize.modeLabel}</legend>
        {MODES.map((option) => (
          <label key={option} className="pg-mode">
            <input type="radio" name="mode" value={option} checked={mode === option} onChange={() => setMode(option)} data-testid={`radio-mode-${option}`} />
            <span className="pg-mode-name">{strings.modes[option]}</span>
            <span className="pg-mode-hint">{strings.modeHints[option]}</span>
          </label>
        ))}
      </fieldset>

      {mode !== 'site' && (
        <div className="pg-presets" role="group" aria-label={strings.customize.presetsLabel}>
          <span className="pg-label">{strings.customize.presetsLabel}</span>
          {PRESETS[mode].map((preset) => (
            <button key={preset} type="button" className="pg-chip" onClick={() => onChange(applyPreset(settings, preset))} data-testid={`preset-${preset}`}>
              {strings.presets[preset]}
            </button>
          ))}
        </div>
      )}

      {mode === 'random' && (
        <div className="pg-rules">
          <NumberField id="random-length" label={strings.customize.length} value={settings.random.length} min={LIMITS.random.min} max={LIMITS.random.max} onChange={(length) => patchRandom({ length })} slider />
          <Group legend={strings.customize.characters}>
            {CHAR_TYPES.map((type) => (
              <Checkbox key={type} id={`random-${type}`} label={type === 'symbols' ? `${strings.types.symbols} (!@#$%^&*-_=+?)` : strings.types[type]} checked={settings.random.types[type]} onChange={(v) => patchRandom({ types: toggle(settings.random.types, type, v) })} />
            ))}
            <Checkbox id="random-ambiguous" label={strings.customize.excludeAmbiguous} checked={settings.random.excludeAmbiguous} onChange={(excludeAmbiguous) => patchRandom({ excludeAmbiguous })} />
          </Group>
          <details className="pg-details" open={settings.random.requireEachType || undefined}>
            <summary>{strings.customize.more}</summary>
            <Checkbox id="random-require" label={strings.customize.requireEach} checked={settings.random.requireEachType} onChange={(requireEachType) => patchRandom({ requireEachType })} hint={strings.customize.requireEachNote} />
          </details>
        </div>
      )}

      {mode === 'passphrase' && (
        <div className="pg-rules">
          <NumberField id="phrase-words" label={strings.customize.words} value={settings.passphrase.wordCount} min={LIMITS.passphrase.min} max={LIMITS.passphrase.max} onChange={(wordCount) => patchPhrase({ wordCount })} slider />
          <div className="pg-field">
            <label htmlFor="phrase-separator">{strings.customize.separator}</label>
            <select id="phrase-separator" value={settings.passphrase.separator} onChange={(event) => patchPhrase({ separator: event.target.value as PassphraseSeparator })} data-testid="select-separator">
              {PASSPHRASE_SEPARATORS.map((sep) => <option key={sep || 'none'} value={sep}>{strings.separators[sep]}</option>)}
            </select>
          </div>
          <Checkbox id="phrase-capitalize" label={strings.customize.capitalize} checked={settings.passphrase.capitalize} onChange={(capitalize) => patchPhrase({ capitalize })} />
          <Checkbox id="phrase-number" label={strings.customize.addNumber} checked={settings.passphrase.addNumber} onChange={(addNumber) => patchPhrase({ addNumber })} />
          <p className="pg-hint">{strings.customize.wordList(WORDS.length)}</p>
        </div>
      )}

      {mode === 'pin' && (
        <div className="pg-rules">
          <NumberField id="pin-length" label={strings.customize.pinLength} value={settings.pin.length} min={LIMITS.pin.min} max={LIMITS.pin.max} onChange={(length) => onChange({ ...settings, pin: { length } })} slider />
          <p className="pg-notice">{strings.customize.pinNote}</p>
        </div>
      )}

      {mode === 'site' && (
        <div className="pg-rules">
          <Group legend={strings.customize.site.limits}>
            <div className="pg-grid-3">
              <NumberField id="site-min" label={strings.customize.site.min} value={settings.site.minLength} min={LIMITS.site.min} max={LIMITS.site.max} onChange={(minLength) => patchSite({ minLength })} />
              <NumberField id="site-max" label={strings.customize.site.max} value={settings.site.maxLength} min={LIMITS.site.min} max={LIMITS.site.max} onChange={(maxLength) => patchSite({ maxLength })} />
              <NumberField id="site-length" label={strings.customize.site.length} value={settings.site.length} min={LIMITS.site.min} max={LIMITS.site.max} onChange={(length) => patchSite({ length })} />
            </div>
          </Group>
          <Group legend={strings.customize.site.allowed}>
            {CHAR_TYPES.map((type) => (
              <Checkbox key={type} id={`site-allow-${type}`} label={strings.types[type]} checked={settings.site.allowed[type]} onChange={(v) => patchSite({ allowed: toggle(settings.site.allowed, type, v) })} />
            ))}
            {settings.site.allowed.symbols && (
              <div className="pg-field">
                <label htmlFor="site-symbols">{strings.customize.site.allowedSymbols}</label>
                <input id="site-symbols" type="text" value={settings.site.allowedSymbols} onChange={(event) => patchSite({ allowedSymbols: event.target.value })} maxLength={64} autoComplete="off" spellCheck={false} data-testid="input-site-symbols" />
              </div>
            )}
          </Group>
          <Group legend={strings.customize.site.required}>
            {CHAR_TYPES.map((type) => (
              <Checkbox key={type} id={`site-require-${type}`} label={strings.types[type]} checked={settings.site.required[type]} onChange={(v) => patchSite({ required: toggle(settings.site.required, type, v) })} />
            ))}
          </Group>
          <div className="pg-field">
            <label htmlFor="site-excluded">{strings.customize.site.excluded}</label>
            <input id="site-excluded" type="text" value={settings.site.excluded} onChange={(event) => patchSite({ excluded: event.target.value })} maxLength={128} autoComplete="off" spellCheck={false} aria-describedby="site-excluded-hint" data-testid="input-site-excluded" />
            <p id="site-excluded-hint" className="pg-hint">{strings.customize.site.excludedHint}</p>
          </div>
        </div>
      )}

      {problems.length > 0 && <ProblemList problems={problems} />}

      <button type="button" className="pg-button pg-button-primary pg-apply" onClick={onApply} disabled={problems.length > 0} data-testid="button-apply">
        <RefreshCw size={18} aria-hidden="true" /> {strings.customize.apply}
      </button>
    </section>
  );
}
