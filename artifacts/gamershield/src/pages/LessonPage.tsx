import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { LESSONS, type Lesson } from '@/content/lessons';
import { findTool, toolHref } from '@/lib/platform/registry';
import { scoreQuiz, type QuizResult } from '@/lib/learning/progress';
import { saveAttempt, useLearning } from '@/hooks/use-learning';
import { PageHeader } from '@/components/sentrix/ToolCard';
import { Icon } from '@/components/sentrix/Icon';

/** A flashcard: a real button, so it works with keyboard and screen readers. */
function Flashcard({ term, definition }: { term: string; definition: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button type="button" className="sx-flashcard" aria-pressed={flipped} onClick={() => setFlipped(!flipped)}
      aria-label={flipped ? `${term}: ${definition}. Press to show the term.` : `${term}. Press to show the definition.`}>
      <span className="sx-flashcard-side">{flipped ? 'Definition' : 'Term'}</span>
      <span className="sx-flashcard-text">{flipped ? definition : term}</span>
    </button>
  );
}

export function LessonPage({ lesson }: { lesson: Lesson }) {
  const progress = useLearning();
  const [answers, setAnswers] = useState<(number | null)[]>(() => lesson.quiz.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);
  const index = LESSONS.findIndex((l) => l.id === lesson.id);
  const next = LESSONS[index + 1];
  const done = progress.completed.includes(lesson.id);

  function submit() {
    const scored = scoreQuiz(lesson.quiz, answers);
    setResult(scored);
    saveAttempt(lesson.id, scored); // saves only the lesson ID and score
  }

  function retry() {
    setAnswers(lesson.quiz.map(() => null));
    setResult(null);
  }

  return (
    <>
      <PageHeader icon="book" title={lesson.title} summary={lesson.summary}
        eyebrow={`Lesson ${index + 1} of ${LESSONS.length} · ${lesson.minutes} min${done ? ' · Completed' : ''}`}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Learning Center', href: '/learning' }]} />

      <article className="sx-card sx-lesson">
        {lesson.sections.map((section) => (
          <section key={section.heading} className="gs-guide-section">
            <h2 style={{ fontSize: 19, marginBottom: 8 }}>{section.heading}</h2>
            {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
      </article>

      <section className="sx-section" aria-labelledby="terms-heading">
        <div className="sx-section-head"><h2 id="terms-heading">Key terms</h2><p>Tap a card to flip it.</p></div>
        <div className="sx-flashcards">{lesson.keyTerms.map((k) => <Flashcard key={k.term} {...k} />)}</div>
      </section>

      <section className="sx-section" aria-labelledby="quiz-heading">
        <div className="sx-section-head"><h2 id="quiz-heading">Knowledge check</h2><p>Get 3 of 4 right to complete the lesson.</p></div>
        <form className="sx-card" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          {lesson.quiz.map((q, qi) => {
            const answered = result !== null;
            const right = result?.results[qi];
            return (
              <fieldset key={q.id} className="sx-question" data-testid={`question-${qi}`}>
                <legend><strong>{qi + 1}. {q.question}</strong></legend>
                {q.options.map((option, oi) => {
                  const state = !answered ? '' : oi === q.answer ? ' correct' : answers[qi] === oi ? ' wrong' : '';
                  return (
                    <label key={option} className={`sx-option${state}`}>
                      <input type="radio" name={q.id} checked={answers[qi] === oi} disabled={answered}
                        onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))} data-testid={`option-${qi}-${oi}`} />
                      <span>{option}</span>
                    </label>
                  );
                })}
                {answered && (
                  <p className={`sx-explain${right ? ' good' : ' bad'}`} role="note">
                    {right ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                    <span><strong>{right ? 'Correct.' : 'Not quite.'}</strong> {q.explanation}</span>
                  </p>
                )}
              </fieldset>
            );
          })}

          <div aria-live="polite">
            {result ? (
              <div className={`gs-result${result.passed ? '' : ' notice'}`} data-testid="quiz-result">
                <strong>{result.correct} of {result.total} correct{result.passed ? ': lesson complete!' : ''}</strong>
                {result.passed ? 'Nice work. Your progress is saved on this device.' : 'Read the explanations above, then try again. You need 3 of 4.'}
              </div>
            ) : null}
          </div>
          <div className="gs-actions">
            {!result && <button type="submit" className="gs-breach" disabled={answers.some((a) => a === null)} data-testid="button-submit-quiz">Check my answers</button>}
            {result && <button type="button" className="gs-secondary" onClick={retry} data-testid="button-retry-quiz"><RotateCcw size={16} aria-hidden="true" /> Try again</button>}
            {result?.passed && next && <Link href={`/learning/${next.id}`} className="gs-breach" style={{ textDecoration: 'none' }}>Next: {next.title} <ArrowRight size={16} aria-hidden="true" /></Link>}
            {result?.passed && !next && <Link href="/learning" className="gs-breach" style={{ textDecoration: 'none' }}>Back to the Learning Center</Link>}
          </div>
        </form>
      </section>

      {lesson.tryTools.length > 0 && (
        <section className="sx-section" aria-labelledby="try-heading">
          <div className="sx-section-head"><h2 id="try-heading">Try it in Sentrix</h2></div>
          <div className="sx-chip-row">
            {lesson.tryTools.map(findTool).filter((t) => !!t).map((tool) => {
              const href = toolHref(tool!);
              const body = <><Icon name={tool!.icon} size={16} />{tool!.name}</>;
              return tool!.standalonePath
                ? <a key={tool!.id} className="sx-chip-link" href={`${import.meta.env.BASE_URL}${href}`}>{body}</a>
                : <Link key={tool!.id} className="sx-chip-link" href={href}>{body}</Link>;
            })}
          </div>
        </section>
      )}
    </>
  );
}
