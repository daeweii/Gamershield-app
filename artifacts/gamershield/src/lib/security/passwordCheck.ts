// ---------------------------------------------------------------
// PASSWORD CHECK
// Moved out of App.tsx unchanged so it can be tested. The strength score
// runs on this device; the optional breach check sends only the first
// 5 characters of a SHA-1 hash (k-anonymity), never the password.
// ---------------------------------------------------------------

export const RISKY_TERMS = [
  'password', '123456', 'qwerty', 'letmein', 'gamer', 'fortnite',
  'minecraft', 'playstation', 'xbox', 'admin', 'roblox', 'valorant',
];

export type StrengthLevel = 'WEAK' | 'OKAY' | 'STRONG';

export interface PasswordAssessment {
  score: number;
  level: StrengthLevel;
  tips: string[];
  containsRiskyTerm: boolean;
}

/** A local estimate from 0 to 6. It does not predict every attack. */
export function assessPassword(password: string): PasswordAssessment {
  let score = 0;
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9\s]/.test(password)) score += 1;
  const containsRiskyTerm = RISKY_TERMS.some((term) => password.toLowerCase().includes(term));
  if (containsRiskyTerm) score -= 2;
  score = Math.max(0, Math.min(6, score));
  const level: StrengthLevel = score <= 2 ? 'WEAK' : score <= 4 ? 'OKAY' : 'STRONG';

  const tips: string[] = [];
  if (password.length < 12) tips.push('Use 12 or more characters.');
  if (!/[a-z]/.test(password)) tips.push('Add a lowercase letter.');
  if (!/[A-Z]/.test(password)) tips.push('Add an uppercase letter.');
  if (!/[0-9]/.test(password)) tips.push('Add a number.');
  if (!/[^A-Za-z0-9\s]/.test(password)) tips.push('Add a symbol, like ! or #.');
  if (containsRiskyTerm) tips.push('Avoid common words and game names.');
  if (tips.length === 0) tips.push('Good mix. Keep it unique to this account.');
  return { score, level, tips, containsRiskyTerm };
}

export async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * How many times this password appears in Have I Been Pwned's breach data.
 * Hash locally, send only the first five SHA-1 characters, compare the rest here.
 * `fetchImpl` is swappable so tests can check exactly what would be sent.
 */
export async function countBreaches(password: string, fetchImpl: typeof fetch = fetch): Promise<number> {
  const fullHash = await sha1Hex(password);
  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);
  const response = await fetchImpl(`https://api.pwnedpasswords.com/range/${prefix}`, {
    credentials: 'omit',
    // Padding makes every response a similar size, so the prefix can't be guessed from traffic.
    headers: { 'Add-Padding': 'true' },
  });
  if (!response.ok) throw new Error('Breach lookup was unavailable.');
  let count = 0;
  for (const line of (await response.text()).split(/\r?\n/)) {
    const [candidate, rawCount] = line.trim().split(':');
    const parsedCount = Number(rawCount);
    // HIBP padding entries use a count of zero and are not real matches.
    if (candidate?.toUpperCase() === suffix && parsedCount > 0) count = parsedCount;
  }
  return count;
}
