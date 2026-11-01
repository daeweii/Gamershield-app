import { Link } from 'wouter';
import { CheckCircle2, CircleDashed, Clock } from 'lucide-react';
import { LESSONS, PATHS, lessonsIn } from '@/content/lessons';
import { pathPercent } from '@/lib/learning/progress';
import { useLearning } from '@/hooks/use-learning';
import { PageHeader } from '@/components/sentrix/ToolCard';

export function LearningPage() {
  const progress = useLearning();
  const overall = pathPercent(progress, LESSONS.map((l) => l.id));

  return (
    <>
      <PageHeader icon="book" title="Learning Center" eyebrow="Learn"
        summary="Short lessons with flashcards and a quiz each. Pass a quiz (3 of 4) to complete the lesson. Go in order or jump to any topic."
        breadcrumb={[{ label: 'Home', href: '/' }]} />

      <div className="sx-card" style={{ marginBottom: 24 }}>
        <p className="gs-input-label" id="overall-label" style={{ marginTop: 0 }}>Your progress: {progress.completed.length} of {LESSONS.length} lessons ({overall}%)</p>
        <div className="gs-progress" role="progressbar" aria-labelledby="overall-label" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall}>
          <span style={{ width: `${overall}%` }} />
        </div>
        <p className="sx-muted" style={{ marginTop: 10, fontSize: 13 }}>Progress is saved only in this browser. Settings → Reset everything clears it.</p>
      </div>

      {PATHS.map((path) => {
        const lessons = lessonsIn(path.id);
        return (
          <section key={path.id} className="sx-section" aria-labelledby={`path-${path.id}`} style={{ marginTop: 0, marginBottom: 32 }}>
            <div className="sx-section-head">
              <h2 id={`path-${path.id}`}>{path.name}</h2>
              <p>{path.summary}</p>
            </div>
            {lessons.length > 0 ? (
              <ol className="sx-lesson-list">
                {lessons.map((lesson, i) => {
                  const done = progress.completed.includes(lesson.id);
                  const best = progress.best[lesson.id];
                  return (
                    <li key={lesson.id}>
                      <Link href={`/learning/${lesson.id}`} className="sx-lesson-row" data-testid={`lesson-${lesson.id}`}>
                        <span className={`sx-lesson-num${done ? ' done' : ''}`} aria-hidden="true">{done ? <CheckCircle2 size={18} /> : i + 1}</span>
                        <span className="sx-lesson-text">
                          <strong>{lesson.title}</strong>
                          <span>{lesson.summary}</span>
                        </span>
                        <span className="sx-lesson-meta">
                          <span className="sx-badge"><Clock size={12} aria-hidden="true" />{lesson.minutes} min</span>
                          {done ? <span className="sx-badge sx-badge-good">Completed{best !== undefined ? ` · ${best}%` : ''}</span>
                            : best !== undefined ? <span className="sx-badge">Best {best}%</span> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="sx-tool-card is-planned">
                <span className="sx-tool-meta"><span className="sx-badge">Planned</span></span>
                <ul className="sx-list" style={{ marginTop: 6 }}>
                  {path.plannedTopics?.map((t) => <li key={t}><CircleDashed size={16} aria-hidden="true" />{t}</li>)}
                </ul>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
