// Tests for the Learning Center: quiz scoring, saved progress, and lesson content.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { EMPTY_PROGRESS, parseProgress, pathPercent, recordAttempt, scoreQuiz, type QuizQuestion } from './progress.ts';
import { LESSONS, LESSON_IDS, PATHS } from '../../content/lessons.ts';
import { TOOL_IDS, appRoutes } from '../platform/registry.ts';

const QUIZ: QuizQuestion[] = [0, 1, 2, 3].map((n) => ({ id: `q${n}`, question: `Q${n}`, options: ['a', 'b', 'c'], answer: n % 3, explanation: 'why' }));

test('quiz scoring: 3 of 4 passes, 2 of 4 does not, unanswered counts as wrong', () => {
  assert.deepEqual(scoreQuiz(QUIZ, [0, 1, 2, 0]), { correct: 4, total: 4, passed: true, results: [true, true, true, true] });
  assert.equal(scoreQuiz(QUIZ, [0, 1, 2, 2]).passed, true);
  assert.equal(scoreQuiz(QUIZ, [0, 1, 0, 2]).passed, false);
  assert.equal(scoreQuiz(QUIZ, [null, null, null, null]).correct, 0);
  assert.equal(scoreQuiz([], []).passed, false);
});

test('progress keeps the best score and never un-completes a lesson', () => {
  const id = LESSONS[0].id;
  let p = recordAttempt(EMPTY_PROGRESS, id, scoreQuiz(QUIZ, [0, 1, 0, 2]));
  assert.deepEqual(p, { completed: [], best: { [id]: 50 } });
  p = recordAttempt(p, id, scoreQuiz(QUIZ, [0, 1, 2, 0]));
  assert.deepEqual(p, { completed: [id], best: { [id]: 100 } });
  p = recordAttempt(p, id, scoreQuiz(QUIZ, [null, null, null, null]));
  assert.deepEqual(p, { completed: [id], best: { [id]: 100 } });
  assert.equal(pathPercent(p, LESSONS.map((l) => l.id)), Math.round(100 / LESSONS.length));
});

test('saved progress is sanitized: unknown IDs, bad scores, and junk are dropped', () => {
  const id = LESSONS[0].id;
  assert.deepEqual(parseProgress(null, LESSON_IDS), EMPTY_PROGRESS);
  assert.deepEqual(parseProgress('not json', LESSON_IDS), EMPTY_PROGRESS);
  const raw = JSON.stringify({ completed: [id, id, 'evil', 7], best: { [id]: 80, evil: 100, [LESSONS[1].id]: 900, [LESSONS[2].id]: 'x' } });
  assert.deepEqual(parseProgress(raw, LESSON_IDS), { completed: [id], best: { [id]: 80 } });
});

test('lesson content is complete and consistent', () => {
  assert.equal(LESSON_IDS.size, LESSONS.length, 'lesson IDs are unique');
  for (const lesson of LESSONS) {
    assert.ok(PATHS.some((p) => p.id === lesson.path), lesson.id);
    assert.ok(lesson.sections.length >= 2 && lesson.keyTerms.length >= 3, lesson.id);
    assert.equal(lesson.quiz.length, 4, `${lesson.id} has 4 questions`);
    for (const q of lesson.quiz) {
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `${lesson.id}/${q.id} answer index`);
      assert.equal(new Set(q.options).size, q.options.length, `${lesson.id}/${q.id} options are distinct`);
      assert.ok(q.explanation.length > 20, `${lesson.id}/${q.id} has an explanation`);
    }
    for (const tool of lesson.tryTools) assert.ok(TOOL_IDS.has(tool), `${lesson.id} links real tool ${tool}`);
  }
});

test('every lesson gets a real page in the build', () => {
  const routes = appRoutes();
  for (const lesson of LESSONS) assert.ok(routes.includes(`/learning/${lesson.id}`), lesson.id);
});
