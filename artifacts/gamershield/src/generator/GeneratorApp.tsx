import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import {
  estimateStrength, findProblems, formatForCopy, generateBatch, isValidEnvName,
  type CopyFormat, type GeneratorSettings,
} from '@/lib/security';
import { clearPrefs, DEFAULT_PREFS, loadPrefs, savePrefs, type Prefs } from './prefs';
import { strings } from './strings';
import { GenerateSection } from './GenerateSection';
import { CustomizeSection } from './CustomizeSection';
import { StrengthSection } from './StrengthSection';
import { PrivacySection } from './PrivacySection';
import { Walkthrough, TOUR_STEPS } from './Walkthrough';

export type SectionId = 'generate' | 'customize' | 'strength' | 'privacy';
const SECTIONS: SectionId[] = ['generate', 'customize', 'strength', 'privacy'];

/** The current batch. Kept only in memory: never saved, logged, or sent. */
export interface Batch {
  passwords: string[];
  /** The settings that made this batch, so the strength estimate matches it exactly. */
  settings: GeneratorSettings;
}

function makeBatch(settings: GeneratorSettings, size: number): Batch | null {
  const result = generateBatch(settings, size);
  return result.ok ? { passwords: result.passwords, settings } : null;
}

export type CopyStatus = { index: number; state: 'copied' | 'failed' } | null;

/**
 * Copy text to the clipboard. Tries the modern Clipboard API first. Some
 * browsers and embedded views deny it, so fall back to the older copy command
 * on a temporary off-screen text box, which is removed immediately.
 */
async function writeClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fall through to the legacy method.
  }
  const box = document.createElement('textarea');
  box.value = text;
  box.setAttribute('readonly', '');
  box.setAttribute('aria-hidden', 'true');
  box.className = 'pg-offscreen';
  const focused = document.activeElement;
  document.body.appendChild(box);
  box.select();
  const copied = document.execCommand('copy');
  box.remove();
  if (focused instanceof HTMLElement) focused.focus();
  if (!copied) throw new Error('Copy was blocked');
}

export function GeneratorApp() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [section, setSection] = useState<SectionId>('generate');
  const [batch, setBatch] = useState<Batch | null>(() => makeBatch(prefs.settings, prefs.batchSize));
  const [revealed, setRevealed] = useState<boolean[]>(() => (batch ? batch.passwords.map(() => false) : []));
  const [selected, setSelected] = useState(0);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [tourStep, setTourStep] = useState<number | null>(prefs.tourDone ? null : 0);
  const [announcement, setAnnouncement] = useState('');
  const tabRefs = useRef<Partial<Record<SectionId, HTMLButtonElement | null>>>({});
  const copyTimer = useRef<number | undefined>(undefined);

  const problems = useMemo(() => findProblems(prefs.settings), [prefs.settings]);
  const batchStrength = useMemo(() => (batch ? estimateStrength(batch.settings) : null), [batch]);
  const stale = batch !== null && batch.settings !== prefs.settings;

  /** Screen readers read this region aloud. A zero-width toggle lets the same message repeat. */
  const announce = useCallback((text: string) => {
    setAnnouncement((previous) => (previous === text ? `${text}​` : text));
  }, []);

  /** Change preferences and remember them. Passwords are not part of prefs. */
  const updatePrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  const setSettings = useCallback((settings: GeneratorSettings) => updatePrefs({ settings }), [updatePrefs]);

  function generate(): boolean {
    const next = makeBatch(prefs.settings, prefs.batchSize);
    if (!next) {
      announce(strings.generate.blocked);
      return false;
    }
    setBatch(next);
    setRevealed(next.passwords.map(() => false));
    setSelected(0);
    setCopyStatus(null);
    announce(strings.generate.announced(next.passwords.length));
    return true;
  }

  async function copy(index: number) {
    if (!batch) return;
    const format: CopyFormat = prefs.copyFormat;
    if (format === 'env' && !isValidEnvName(prefs.envName)) return;
    const text = formatForCopy(batch.passwords[index], format, prefs.envName);
    window.clearTimeout(copyTimer.current);
    try {
      await writeClipboard(text);
      setCopyStatus({ index, state: 'copied' });
      announce(strings.copy.announced(index + 1, strings.copy.formats[format]));
      copyTimer.current = window.setTimeout(() => setCopyStatus(null), 2500);
    } catch {
      // Clipboard can be blocked (permissions, insecure page). Say so instead of pretending.
      setCopyStatus({ index, state: 'failed' });
      announce(strings.copy.failed);
    }
  }

  function resetPrefs() {
    clearPrefs();
    // Set state directly (not updatePrefs) so the defaults aren't written straight back.
    setPrefs({ ...DEFAULT_PREFS, tourDone: true });
    announce(strings.privacy.resetDone);
  }

  function goTo(next: SectionId, focusTab = false) {
    setSection(next);
    if (focusTab) tabRefs.current[next]?.focus();
  }

  // Arrow keys move between tabs (the standard tablist keyboard pattern).
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = SECTIONS.indexOf(section);
    const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (event.key in moves) {
      event.preventDefault();
      goTo(SECTIONS[(index + moves[event.key] + SECTIONS.length) % SECTIONS.length], true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      goTo(SECTIONS[event.key === 'Home' ? 0 : SECTIONS.length - 1], true);
    }
  }

  function finishTour() {
    setTourStep(null);
    updatePrefs({ tourDone: true });
  }

  return (
    <div className="pg-shell">
      <a className="pg-skip" href="#pg-main">Skip to content</a>
      <header className="pg-header">
        <div className="pg-header-inner">
          <a className="pg-back" href={import.meta.env.BASE_URL}>
            <ArrowLeft size={16} aria-hidden="true" /> {strings.backToSite}
          </a>
          <button type="button" className="pg-link-button" onClick={() => setTourStep(0)} data-testid="button-tour">
            <HelpCircle size={16} aria-hidden="true" /> {strings.tourButton}
          </button>
        </div>
        <div className="pg-title-row">
          <h1 className="pg-title"><span className="pg-title-kicker">{strings.brand}</span>{strings.pageTitle}</h1>
          <p className="pg-badge">{strings.onDevice}</p>
        </div>
        <nav aria-label={strings.nav.label}>
          <div className="pg-tabs" role="tablist" aria-label={strings.nav.label}>
            {SECTIONS.map((id) => (
              <button
                key={id}
                ref={(el) => { tabRefs.current[id] = el; }}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={section === id}
                aria-controls={`panel-${id}`}
                tabIndex={section === id ? 0 : -1}
                className="pg-tab"
                onClick={() => goTo(id)}
                onKeyDown={onTabKeyDown}
                data-tour={`tab-${id}`}
                data-testid={`tab-${id}`}
              >
                {strings.nav[id]}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main id="pg-main" className="pg-main">
        <div role="tabpanel" id={`panel-${section}`} aria-labelledby={`tab-${section}`} tabIndex={-1} className="pg-panel">
          {section === 'generate' && (
            <GenerateSection
              settings={prefs.settings}
              problems={problems}
              batch={batch}
              strength={batchStrength}
              stale={stale}
              batchSize={prefs.batchSize}
              onBatchSize={(batchSize) => updatePrefs({ batchSize })}
              onGenerate={generate}
              copyFormat={prefs.copyFormat}
              onCopyFormat={(copyFormat) => updatePrefs({ copyFormat })}
              envName={prefs.envName}
              onEnvName={(envName) => updatePrefs({ envName })}
              revealed={revealed}
              onReveal={(index, value) => setRevealed((r) => r.map((old, i) => (i === index ? value : old)))}
              onRevealAll={(value) => setRevealed((r) => r.map(() => value))}
              copyStatus={copyStatus}
              onCopy={copy}
              onShowStrength={(index) => { setSelected(index); goTo('strength'); }}
              onCustomize={() => goTo('customize')}
            />
          )}
          {section === 'customize' && (
            <CustomizeSection
              settings={prefs.settings}
              problems={problems}
              onChange={setSettings}
              onApply={() => { if (generate()) goTo('generate'); }}
            />
          )}
          {section === 'strength' && (
            <StrengthSection
              batch={batch}
              strength={batchStrength}
              selected={selected}
              onSelect={setSelected}
              revealed={revealed}
              onReveal={(index, value) => setRevealed((r) => r.map((old, i) => (i === index ? value : old)))}
            />
          )}
          {section === 'privacy' && (
            <PrivacySection onResetPrefs={resetPrefs} onReplayTour={() => setTourStep(0)} />
          )}
        </div>
      </main>

      <div className="pg-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

      {tourStep !== null && (
        <Walkthrough
          step={tourStep}
          section={section}
          onStep={(next) => {
            setTourStep(next);
            setSection(TOUR_STEPS[next].section);
          }}
          onStart={() => setSection(TOUR_STEPS[tourStep].section)}
          onClose={finishTour}
        />
      )}
    </div>
  );
}
