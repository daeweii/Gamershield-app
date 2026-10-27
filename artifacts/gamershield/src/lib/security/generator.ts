// ---------------------------------------------------------------
// PASSWORD GENERATOR
// Random passwords and passphrases, made with the browser's secure
// random number generator. Nothing is saved or sent anywhere.
// ---------------------------------------------------------------

import { WORDS } from './wordlist.ts';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = LOWER.toUpperCase();
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*';
const POOL = LOWER + UPPER + DIGITS + SYMBOLS;

export const DEFAULT_PASSWORD_LENGTH = 16;
export const DEFAULT_PASSPHRASE_WORDS = 6;

/**
 * A secure random whole number from 0 to n-1, like Python's secrets.randbelow().
 *
 * crypto.getRandomValues() is cryptographically secure. Math.random() is NOT:
 * its output can be predicted, so never use it for passwords.
 *
 * The loop avoids "modulo bias". A 32-bit random number has 4,294,967,296
 * possible values. If n doesn't divide that evenly, plain `value % n` would
 * land on small numbers slightly more often. So we throw away the leftover
 * values at the top of the range and roll again.
 */
export function randomBelow(n: number): number {
  const limit = Math.floor(2 ** 32 / n) * n;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % n;
}

/** Random password with at least one lowercase, uppercase, number, and symbol. */
export function generatePassword(length = DEFAULT_PASSWORD_LENGTH): string {
  if (!Number.isInteger(length) || length < 4) {
    throw new RangeError('Password length must be a whole number, 4 or more.');
  }
  while (true) {
    let password = '';
    for (let i = 0; i < length; i++) password += POOL[randomBelow(POOL.length)];
    // Throwing away results that miss a character type and trying again keeps
    // every allowed password equally likely.
    if ([LOWER, UPPER, DIGITS, SYMBOLS].every((set) => [...password].some((c) => set.includes(c)))) {
      return password;
    }
  }
}

/** Pick `count` different words, like Python's random.sample(). */
export function sampleWords(count: number): string[] {
  const words = [...WORDS];
  // Partial Fisher-Yates shuffle: every ordering is equally likely.
  for (let i = 0; i < count; i++) {
    const j = i + randomBelow(words.length - i);
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words.slice(0, count);
}

/** Easy to remember, hard to crack. Example: Falcon-Copper-Orbit-Blaze-Ember-Drift-42 */
export function generatePassphrase(wordCount = DEFAULT_PASSPHRASE_WORDS): string {
  if (!Number.isInteger(wordCount) || wordCount < 1 || wordCount > WORDS.length) {
    throw new RangeError(`Word count must be between 1 and ${WORDS.length}.`);
  }
  const words = sampleWords(wordCount).map((w) => w[0].toUpperCase() + w.slice(1));
  return `${words.join('-')}-${randomBelow(90) + 10}`;
}

// ---------------------------------------------------------------
// ENTROPY: how many guesses an attacker needs, written as a power of 2.
// "60 bits" means about 2^60, or a billion billion, possible results.
// These count what the generator COULD make, which is the honest measure.
// ---------------------------------------------------------------

export function passwordBits(length = DEFAULT_PASSWORD_LENGTH): number {
  return length * Math.log2(POOL.length);
}

export function passphraseBits(wordCount = DEFAULT_PASSPHRASE_WORDS): number {
  let bits = Math.log2(90); // the 2-digit number on the end
  for (let i = 0; i < wordCount; i++) bits += Math.log2(WORDS.length - i);
  return bits;
}

export type StrengthVerdict = 'WEAK' | 'OKAY' | 'STRONG';

/** Turn a bit count into a verdict and a plain-English explanation for the UI. */
export function describeBits(bits: number): { verdict: StrengthVerdict; explanation: string } {
  if (bits < 40) return { verdict: 'WEAK', explanation: 'A cracking computer could guess this quickly.' };
  if (bits < 60) return { verdict: 'OKAY', explanation: 'Fine against online guessing, weaker if a site’s database leaks.' };
  return { verdict: 'STRONG', explanation: 'Would take an attacker far longer than a lifetime to guess.' };
}
