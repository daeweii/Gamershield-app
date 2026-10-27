import { useEffect, useRef, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { strings } from './strings';
import type { SectionId } from './GeneratorApp';

/** Each step opens a section and highlights one control there (matched by data-tour). */
export const TOUR_STEPS: { section: SectionId; target: string }[] = [
  { section: 'customize', target: 'rules' },
  { section: 'generate', target: 'generate-button' },
  { section: 'generate', target: 'copy-first' },
];

interface Props {
  step: number;
  /** The section on screen, so the highlight re-runs once a step's section has opened. */
  section: SectionId;
  onStep: (step: number) => void;
  onStart: () => void;
  onClose: () => void;
}

/**
 * A small, non-blocking walkthrough card. The page stays usable underneath, so
 * people can try each step for real. Escape closes it; focus goes back to where it was.
 */
export function Walkthrough({ step, section, onStep, onStart, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<Element | null>(null);
  const total = TOUR_STEPS.length;
  const text = strings.tour.steps[step];

  useEffect(() => {
    returnFocus.current = document.activeElement;
    onStart();
    cardRef.current?.focus();
    return () => {
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
    };
    // Runs once when the walkthrough opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight this step's control. Effects run after React updates the page;
  // `section` in the dependencies re-runs this once the step's section is showing.
  useEffect(() => {
    if (section !== TOUR_STEPS[step].section) return;
    const target = document.querySelector(`[data-tour="${TOUR_STEPS[step].target}"]`);
    target?.classList.add('pg-tour-target');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    return () => target?.classList.remove('pg-tour-target');
  }, [step, section]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  }

  return (
    <div
      ref={cardRef}
      className="pg-tour"
      role="dialog"
      aria-modal="false"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      data-testid="dialog-tour"
    >
      <div className="pg-tour-head">
        <span className="pg-label">{strings.tour.step(step + 1, total)}</span>
        <button type="button" className="pg-icon-button" onClick={onClose} aria-label={strings.tour.close} data-testid="button-tour-close">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <h2 id="tour-title" className="pg-tour-title">{text.title}</h2>
      <p id="tour-body">{text.body}</p>
      <div className="pg-tour-actions">
        {step > 0 && <button type="button" className="pg-button" onClick={() => onStep(step - 1)}>{strings.tour.back}</button>}
        {step < total - 1
          ? <button type="button" className="pg-button pg-button-primary" onClick={() => onStep(step + 1)} data-testid="button-tour-next">{strings.tour.next}</button>
          : <button type="button" className="pg-button pg-button-primary" onClick={onClose} data-testid="button-tour-done">{strings.tour.done}</button>}
      </div>
    </div>
  );
}
