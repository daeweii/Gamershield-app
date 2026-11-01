import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { IR_STEPS } from '@/content/labs';
import { completeLab } from '@/hooks/use-labs';

/** Walk through one incident, one phase at a time. Each choice is explained before moving on. */
export function IncidentLab() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const current = IR_STEPS[step];
  const picked = picks[step];
  const best = picks.filter((p, i) => IR_STEPS[i].options[p]?.best).length;
  const finished = picks.length === IR_STEPS.length && picked !== undefined && step === IR_STEPS.length - 1;

  function choose(i: number) {
    if (picked !== undefined) return;
    const next = [...picks];
    next[step] = i;
    setPicks(next);
    if (next.length === IR_STEPS.length) completeLab('incident-response');
  }

  return (
    <div className="sx-stack">
      <ol className="sx-ir-phases" aria-label="Incident phases">
        {IR_STEPS.map((s, i) => <li key={s.id} className={i === step ? 'active' : i < step ? 'done' : ''}>{s.phase}</li>)}
      </ol>
      <section className="sx-card" aria-labelledby="ir-heading" data-testid={`ir-step-${current.id}`}>
        <p className="sx-badge sx-badge-red">Simulation · fictional incident · step {step + 1} of {IR_STEPS.length}</p>
        <h2 id="ir-heading" style={{ fontSize: 19, margin: '12px 0 8px' }}>{current.phase}</h2>
        <p style={{ lineHeight: 1.7, margin: '0 0 14px' }}>{current.situation}</p>
        <div role="group" aria-label="Your response">
          {current.options.map((o, i) => {
            const state = picked === undefined ? '' : o.best ? ' correct' : picked === i ? ' wrong' : '';
            return (
              <button key={o.text} type="button" className={`sx-option sx-ir-option${state}`} onClick={() => choose(i)} disabled={picked !== undefined} data-testid={`ir-option-${i}`}>
                <span>{o.text}</span>
              </button>
            );
          })}
        </div>
        {picked !== undefined && (
          <div aria-live="polite">
            {current.options.map((o, i) => (i === picked || o.best) && (
              <p key={i} className={`sx-explain${o.best ? ' good' : ' bad'}`}>
                {o.best ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                <span><strong>{o.best ? 'Best response.' : 'Your pick.'}</strong> {o.why}</span>
              </p>
            ))}
            {step < IR_STEPS.length - 1 && (
              <div className="gs-actions"><button type="button" className="gs-breach" onClick={() => setStep(step + 1)} data-testid="ir-next">Next: {IR_STEPS[step + 1].phase}</button></div>
            )}
          </div>
        )}
      </section>
      {finished && (
        <div className="gs-result" data-testid="ir-complete">
          <strong>Incident closed. You chose the best response {best} of {IR_STEPS.length} times. Lab complete.</strong>
          You worked through the NIST incident-handling phases: detect, contain, eradicate, recover, and learn so it doesn’t happen again.
        </div>
      )}
    </div>
  );
}
