// ---------------------------------------------------------------
// LEARNING CENTER LOGIC
// Quiz scoring and saved progress. Progress is stored in this browser
// only (lesson IDs and best scores, never answers or anything typed),
// and is validated on every read because localStorage can be edited.
// ---------------------------------------------------------------

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** Index into options. */
  answer: number;
  /** Shown after answering: why the right answer is right. */
  explanation: string;
}

/** A lesson passes at 75% or better (3 of 4 questions). */
export const PASS_RATIO = 0.75;

export interface QuizResult {
  correct: number;
  total: number;
  passed: boolean;
  /** Per question: was the chosen option right? */
  results: boolean[];
}

/** `answers[i]` is the chosen option index for question i, or null if skipped. */
export function scoreQuiz(questions: readonly QuizQuestion[], answers: readonly (number | null)[]): QuizResult {
  const results = questions.map((q, i) => answers[i] === q.answer);
  const correct = results.filter(Boolean).length;
  return { correct, total: questions.length, passed: questions.length > 0 && correct / questions.length >= PASS_RATIO, results };
}

export interface LearningProgress {
  /** Lessons whose quiz was passed. */
  completed: string[];
  /** Best quiz score per lesson, as a whole percent. */
  best: Record<string, number>;
}

export const EMPTY_PROGRESS: LearningProgress = { completed: [], best: {} };

/** Read saved progress, keeping only real lesson IDs and valid scores. */
export function parseProgress(raw: string | null, lessonIds: ReadonlySet<string>): LearningProgress {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const completed = Array.isArray(value?.completed)
      ? [...new Set(value.completed.filter((id): id is string => typeof id === 'string' && lessonIds.has(id)))]
      : [];
    const best: Record<string, number> = {};
    if (value?.best && typeof value.best === 'object' && !Array.isArray(value.best)) {
      for (const [id, score] of Object.entries(value.best as Record<string, unknown>)) {
        if (lessonIds.has(id) && typeof score === 'number' && Number.isInteger(score) && score >= 0 && score <= 100) best[id] = score;
      }
    }
    return { completed, best };
  } catch {
    return EMPTY_PROGRESS;
  }
}

/** Record a quiz attempt: keep the best score, and mark complete once passed (never un-complete). */
export function recordAttempt(progress: LearningProgress, lessonId: string, result: QuizResult): LearningProgress {
  const percent = Math.round((result.correct / Math.max(result.total, 1)) * 100);
  return {
    completed: result.passed && !progress.completed.includes(lessonId) ? [...progress.completed, lessonId] : progress.completed,
    best: { ...progress.best, [lessonId]: Math.max(progress.best[lessonId] ?? 0, percent) },
  };
}

/** Percent of a path's lessons completed. */
export function pathPercent(progress: LearningProgress, lessonIds: readonly string[]): number {
  if (!lessonIds.length) return 0;
  return Math.round((lessonIds.filter((id) => progress.completed.includes(id)).length / lessonIds.length) * 100);
}
