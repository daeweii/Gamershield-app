// Learning progress shared across pages (Learning Center, lessons, Dashboard).
// Stored only in this browser; Settings → Reset everything clears it.

import { useSyncExternalStore } from 'react';
import { LESSON_IDS } from '@/content/lessons';
import { parseProgress, recordAttempt, type LearningProgress, type QuizResult } from '@/lib/learning/progress';
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/platform/storage';

let progress: LearningProgress = parseProgress(readStorage(STORAGE_KEYS.learning), LESSON_IDS);
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// Stay in sync with other tabs and with "Reset everything" (which removes the key).
window.addEventListener('storage', () => { progress = parseProgress(readStorage(STORAGE_KEYS.learning), LESSON_IDS); emit(); });

export function saveAttempt(lessonId: string, result: QuizResult) {
  progress = recordAttempt(progress, lessonId, result);
  writeStorage(STORAGE_KEYS.learning, JSON.stringify(progress));
  emit();
}

/** Reload after Settings clears storage in this same tab. */
export function reloadLearning() {
  progress = parseProgress(readStorage(STORAGE_KEYS.learning), LESSON_IDS);
  emit();
}

export function useLearning(): LearningProgress {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => progress);
}
