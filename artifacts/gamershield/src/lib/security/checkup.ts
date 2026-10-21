// ---------------------------------------------------------------
// ACCOUNT SECURITY CHECKUP
// Seven yes/no questions, a score, and a fix list ordered by importance.
// Answers stay in the browser and are never saved.
// ---------------------------------------------------------------

export interface CheckupQuestion {
  question: string;
  /** Shown when the answer is "no". */
  fix: string;
}

// Ordered most important first, so the fix list is too.
export const CHECKUP_QUESTIONS: readonly CheckupQuestion[] = [
  { question: 'Is 2FA turned on for this account?', fix: 'Turn on 2FA. It stops most account takeovers. (The 2FA guides show how.)' },
  { question: 'Is this password used ONLY on this account?', fix: 'Use a different password for every account.' },
  { question: 'Is your recovery email or phone up to date?', fix: 'Update your recovery info so you can get back in.' },
  { question: 'Is the email tied to this account also protected with 2FA?', fix: 'Lock down your email too. Whoever owns your email can reset everything.' },
  { question: 'Have you saved your 2FA backup codes somewhere safe?', fix: 'Save your backup codes in case you lose your phone.' },
  { question: 'Do you avoid logging in through links people send you?', fix: 'Always type the site address yourself.' },
  { question: 'Have you checked your logged-in devices in the last month?', fix: 'Sign out devices you don’t recognize.' },
];

export type CheckupGrade = 'SOLID' | 'AT RISK' | 'HIGH RISK';

export interface CheckupResult {
  percent: number;
  grade: CheckupGrade;
  /** Fixes for every "no", most important first. Empty means fully locked down. */
  fixes: string[];
}

/** Score the checkup. `answers[i]` is true for "yes" to CHECKUP_QUESTIONS[i]. */
export function scoreCheckup(answers: readonly boolean[]): CheckupResult {
  if (answers.length !== CHECKUP_QUESTIONS.length) {
    throw new RangeError(`Expected ${CHECKUP_QUESTIONS.length} answers, got ${answers.length}.`);
  }
  const yesCount = answers.filter(Boolean).length;
  const percent = Math.round((yesCount / CHECKUP_QUESTIONS.length) * 100);
  const grade: CheckupGrade = percent >= 85 ? 'SOLID' : percent >= 50 ? 'AT RISK' : 'HIGH RISK';
  const fixes = CHECKUP_QUESTIONS.filter((_, i) => !answers[i]).map(({ fix }) => fix);
  return { percent, grade, fixes };
}
