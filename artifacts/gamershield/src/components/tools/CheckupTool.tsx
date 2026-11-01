import { useState } from 'react';
import { ClipboardCheck, RefreshCw } from 'lucide-react';
import { CHECKUP_QUESTIONS, scoreCheckup, type Platform } from '@/lib/security';
import { PlatformPicker, ToolPanel } from './ToolPanel';

type Answer = boolean | null;

const unanswered = (): Answer[] => CHECKUP_QUESTIONS.map(() => null);

export function CheckupTool() {
  const [platform, setPlatform] = useState<Platform>('PlayStation');
  const [answers, setAnswers] = useState<Answer[]>(unanswered);

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const result = answeredCount === CHECKUP_QUESTIONS.length ? scoreCheckup(answers as boolean[]) : null;

  function answer(index: number, value: boolean) {
    setAnswers((current) => current.map((old, i) => (i === index ? value : old)));
  }

  return (
    <ToolPanel id="checkup" icon={ClipboardCheck} title="Account Security Checkup">
      <PlatformPicker
        label="Which account are we checking?"
        value={platform}
        onChange={(next) => { setPlatform(next); setAnswers(unanswered()); }}
      />

      <ol className="gs-questions">
        {CHECKUP_QUESTIONS.map(({ question }, index) => (
          <li className="gs-question" key={question}>
            <span id={`checkup-q${index}`}>{question}</span>
            <span className="gs-yesno" role="group" aria-labelledby={`checkup-q${index}`}>
              <button type="button" className="yes" aria-pressed={answers[index] === true} onClick={() => answer(index, true)} data-testid={`button-yes-${index}`}>Yes</button>
              <button type="button" className="no" aria-pressed={answers[index] === false} onClick={() => answer(index, false)} data-testid={`button-no-${index}`}>No</button>
            </span>
          </li>
        ))}
      </ol>

      <div role="status" aria-live="polite" data-testid="status-checkup-result">
        {!result && (
          <p className="gs-hint">{answeredCount} of {CHECKUP_QUESTIONS.length} answered. Your score shows up when you finish.</p>
        )}
        {result && (
          <div className={`gs-result ${result.grade === 'SOLID' ? '' : result.grade === 'AT RISK' ? 'notice' : 'alert'}`}>
            <strong>
              {platform} security score: {result.percent}%{' '}
              <span className={`gs-grade ${result.grade.toLowerCase().replace(' ', '-')}`}>{result.grade}</span>
            </strong>
            {result.fixes.length === 0
              ? 'You’re locked down. Nice.'
              : <>Fix these, top one first:<ol>{result.fixes.map((fix) => <li key={fix}>{fix}</li>)}</ol></>}
          </div>
        )}
      </div>

      {answeredCount > 0 && (
        <button type="button" className="gs-secondary gs-reset" onClick={() => setAnswers(unanswered())} data-testid="button-reset-checkup">
          <RefreshCw size={15} /> Start over
        </button>
      )}
    </ToolPanel>
  );
}
