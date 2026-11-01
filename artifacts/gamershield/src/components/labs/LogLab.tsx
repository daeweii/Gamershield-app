import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { LOG_LINES, LOG_QUESTIONS } from '@/content/labs';
import { scoreQuiz, type QuizResult } from '@/lib/learning/progress';
import { completeLab } from '@/hooks/use-labs';

export function LogLab() {
  const [filter, setFilter] = useState('');
  const [answers, setAnswers] = useState<(number | null)[]>(() => LOG_QUESTIONS.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);
  const lines = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return LOG_LINES.map((line, i) => ({ line, n: i + 1 })).filter(({ line }) => !q || line.toLowerCase().includes(q));
  }, [filter]);

  function submit() {
    const scored = scoreQuiz(LOG_QUESTIONS, answers);
    setResult(scored);
    if (scored.passed) completeLab('log-analysis');
  }

  return (
    <div className="sx-stack">
      <section className="sx-card" aria-labelledby="log-heading">
        <p className="sx-badge sx-badge-red">Simulation · fictional server log</p>
        <h2 id="log-heading" style={{ fontSize: 18, margin: '12px 0 4px' }}>/var/log/auth.log on web01</h2>
        <p className="sx-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
          This log records every login attempt. Look for many failures from one address in a short time, then a success.
          Filter to focus, for example “Failed”, “Accepted”, or an IP address.
        </p>
        <input type="search" className="gs-input" style={{ marginTop: 12 }} value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter lines (e.g. Failed, 203.0.113.45)" aria-label="Filter log lines" data-testid="input-log-filter" />
        <pre className="gs-code sx-log" aria-label="Log lines" data-testid="log-output">
          {lines.length ? lines.map(({ line, n }) => `${String(n).padStart(2, '0')}  ${line}`).join('\n') : 'No lines match.'}
        </pre>
      </section>

      <form className="sx-card" onSubmit={(e) => { e.preventDefault(); submit(); }} aria-labelledby="log-q-heading">
        <h2 id="log-q-heading" style={{ fontSize: 18, marginBottom: 14 }}>Investigation questions</h2>
        {LOG_QUESTIONS.map((q, qi) => (
          <fieldset key={q.id} className="sx-question">
            <legend><strong>{qi + 1}. {q.question}</strong></legend>
            {q.options.map((option, oi) => {
              const state = !result ? '' : oi === q.answer ? ' correct' : answers[qi] === oi ? ' wrong' : '';
              return (
                <label key={option} className={`sx-option${state}`}>
                  <input type="radio" name={q.id} checked={answers[qi] === oi} disabled={!!result}
                    onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))} data-testid={`log-option-${qi}-${oi}`} />
                  <span>{option}</span>
                </label>
              );
            })}
            {result && (
              <p className={`sx-explain${result.results[qi] ? ' good' : ' bad'}`}>
                {result.results[qi] ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                <span>{q.explanation}</span>
              </p>
            )}
          </fieldset>
        ))}
        <div aria-live="polite">
          {result && (
            <div className={`gs-result${result.passed ? '' : ' notice'}`} data-testid="log-result">
              <strong>{result.correct} of {result.total} correct{result.passed ? '. Lab complete!' : ''}</strong>
              {result.passed ? 'You traced the attack from brute force to compromise to payload download.' : 'Review the explanations and the log, then try again.'}
            </div>
          )}
        </div>
        <div className="gs-actions">
          {!result
            ? <button type="submit" className="gs-breach" disabled={answers.some((a) => a === null)} data-testid="button-submit-log">Submit findings</button>
            : <button type="button" className="gs-secondary" onClick={() => { setResult(null); setAnswers(LOG_QUESTIONS.map(() => null)); }}>Try again</button>}
        </div>
      </form>
    </div>
  );
}
