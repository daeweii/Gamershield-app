import { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { scoreQuiz, type QuizQuestion, type QuizResult } from '@/lib/learning/progress';

/** A knowledge check with explanations. Calls onPass when the pass mark is reached. */
export function QuizBlock({ id, title, questions, onPass }: { id: string; title: string; questions: readonly QuizQuestion[]; onPass: () => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);

  function submit() {
    const scored = scoreQuiz(questions, answers);
    setResult(scored);
    if (scored.passed) onPass();
  }

  return (
    <form className="sx-card" onSubmit={(e) => { e.preventDefault(); submit(); }} aria-labelledby={`${id}-quiz`}>
      <h2 id={`${id}-quiz`} style={{ fontSize: 18, marginBottom: 14 }}>{title}</h2>
      {questions.map((q, qi) => (
        <fieldset key={q.id} className="sx-question">
          <legend><strong>{qi + 1}. {q.question}</strong></legend>
          {q.options.map((option, oi) => {
            const state = !result ? '' : oi === q.answer ? ' correct' : answers[qi] === oi ? ' wrong' : '';
            return (
              <label key={option} className={`sx-option${state}`}>
                <input type="radio" name={`${id}-${q.id}`} checked={answers[qi] === oi} disabled={!!result}
                  onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))} data-testid={`${id}-option-${qi}-${oi}`} />
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
          <div className={`gs-result${result.passed ? '' : ' notice'}`} data-testid={`${id}-result`}>
            <strong>{result.correct} of {result.total} correct{result.passed ? '. Lab complete!' : ''}</strong>
            {result.passed ? 'Nice work.' : 'Read the explanations, then try again.'}
          </div>
        )}
      </div>
      <div className="gs-actions">
        {!result
          ? <button type="submit" className="gs-breach" disabled={answers.some((a) => a === null)} data-testid={`${id}-submit`}>Check my answers</button>
          : <button type="button" className="gs-secondary" onClick={() => { setResult(null); setAnswers(questions.map(() => null)); }}><RotateCcw size={16} aria-hidden="true" /> Try again</button>}
      </div>
    </form>
  );
}
