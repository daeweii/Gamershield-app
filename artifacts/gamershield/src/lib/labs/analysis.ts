// ---------------------------------------------------------------
// LAB HELPERS: password analysis and the hash avalanche effect.
// Pure functions, run on this device only.
// ---------------------------------------------------------------

export interface PasswordFinding {
  id: 'common' | 'repeat' | 'sequence' | 'keyboard' | 'year' | 'leet';
  label: string;
}

export interface PasswordAnalysis {
  length: number;
  /** How many possible characters each position could be, from the types used. */
  poolSize: number;
  types: { lower: boolean; upper: boolean; digits: boolean; symbols: boolean };
  /** Brute-force bits if every character were random: length × log2(pool). */
  bruteForceBits: number;
  /** Predictable patterns attackers' tools try early. */
  findings: PasswordFinding[];
}

const COMMON = ['password', 'qwerty', 'letmein', 'welcome', 'admin', 'dragon', 'monkey', 'iloveyou', 'football', 'baseball', 'gamer', 'fortnite', 'minecraft', 'roblox', 'valorant', 'sentrix'];
const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];

/** Undo common letter-for-symbol swaps (p@ssw0rd -> password) before checking for words. */
const unleet = (s: string) => s.toLowerCase().replace(/[@4]/g, 'a').replace(/3/g, 'e').replace(/[1!|]/g, 'i').replace(/0/g, 'o').replace(/[$5]/g, 's').replace(/7/g, 't');

function hasSequence(s: string, run = 4): boolean {
  const lower = s.toLowerCase();
  for (let i = 0; i + run <= lower.length; i++) {
    let up = true, down = true;
    for (let j = 1; j < run; j++) {
      const d = lower.charCodeAt(i + j) - lower.charCodeAt(i + j - 1);
      if (d !== 1) up = false;
      if (d !== -1) down = false;
    }
    if (up || down) return true;
  }
  return false;
}

export function analyzePassword(password: string): PasswordAnalysis {
  const types = {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digits: /[0-9]/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };
  const poolSize = (types.lower ? 26 : 0) + (types.upper ? 26 : 0) + (types.digits ? 10 : 0) + (types.symbols ? 33 : 0);
  const findings: PasswordFinding[] = [];
  const lower = password.toLowerCase();
  const plain = unleet(password);

  if (COMMON.some((w) => lower.includes(w))) findings.push({ id: 'common', label: 'Contains a common word that cracking lists try first.' });
  else if (COMMON.some((w) => plain.includes(w))) findings.push({ id: 'leet', label: 'Swapping letters for symbols (p@ssw0rd) doesn’t fool cracking tools; they undo it automatically.' });
  if (/(.)\1\1/.test(password)) findings.push({ id: 'repeat', label: 'Repeats the same character three or more times.' });
  if (hasSequence(password)) findings.push({ id: 'sequence', label: 'Contains a run like abcd or 4321.' });
  if (KEYBOARD_ROWS.some((row) => [...Array(Math.max(row.length - 3, 0))].some((_, i) => lower.includes(row.slice(i, i + 4)))))
    findings.push({ id: 'keyboard', label: 'Contains a keyboard pattern like qwer or asdf.' });
  if (/(19|20)\d\d/.test(password)) findings.push({ id: 'year', label: 'Contains a year, often a birthday or the current year.' });

  return { length: [...password].length, poolSize, types, bruteForceBits: poolSize ? [...password].length * Math.log2(poolSize) : 0, findings };
}

/** How many of the bits differ between two equal-length hex strings (the avalanche effect). */
export function differingBits(hexA: string, hexB: string): number {
  if (hexA.length !== hexB.length) throw new Error('Hashes must be the same length');
  let bits = 0;
  for (let i = 0; i < hexA.length; i++) {
    let x = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16);
    while (x) { bits += x & 1; x >>= 1; }
  }
  return bits;
}
