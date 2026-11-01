// ---------------------------------------------------------------
// PASSWORD RULES ENGINE (powers the full generator page)
// Four modes (Random, Passphrase, PIN, Site rules), conflict checks,
// strength estimates, and copy formats. Runs on this device only:
// no network, no storage, no logging. UI text lives in the UI;
// this file returns problem *codes* so labels can be translated.
// ---------------------------------------------------------------

import { randomBelow, sampleWords } from './generator.ts';
import { WORDS } from './wordlist.ts';

export type CharType = 'lower' | 'upper' | 'digits' | 'symbols';
export const CHAR_TYPES: readonly CharType[] = ['lower', 'upper', 'digits', 'symbols'];

export const CHARACTER_SETS: Readonly<Record<CharType, string>> = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*-_=+?',
};

/** Characters people mix up when reading or typing a password. */
export const AMBIGUOUS_CHARACTERS = 'Il1O0o';

export const PASSPHRASE_SEPARATORS = ['-', '.', '_', ' ', ''] as const;
export type PassphraseSeparator = (typeof PASSPHRASE_SEPARATORS)[number];

export const LIMITS = {
  random: { min: 8, max: 128 },
  passphrase: { min: 3, max: 12 },
  pin: { min: 4, max: 12 },
  site: { min: 1, max: 256 },
  batch: { min: 3, max: 5 },
} as const;

export type Mode = 'random' | 'passphrase' | 'pin' | 'site';
export const MODES: readonly Mode[] = ['random', 'passphrase', 'pin', 'site'];

export interface RandomSettings {
  length: number;
  types: Record<CharType, boolean>;
  excludeAmbiguous: boolean;
  /** Off by default: NIST SP 800-63B advises against forced composition rules. */
  requireEachType: boolean;
}

export interface PassphraseSettings {
  wordCount: number;
  separator: PassphraseSeparator;
  capitalize: boolean;
  addNumber: boolean;
}

export interface PinSettings {
  length: number;
}

/** A website's password rules. Only used when the user picks Site rules mode. */
export interface SiteSettings {
  minLength: number;
  maxLength: number;
  length: number;
  allowed: Record<CharType, boolean>;
  /** Which symbols the site accepts. */
  allowedSymbols: string;
  required: Record<CharType, boolean>;
  /** Characters the site rejects, typed by the user. */
  excluded: string;
}

export interface GeneratorSettings {
  mode: Mode;
  random: RandomSettings;
  passphrase: PassphraseSettings;
  pin: PinSettings;
  site: SiteSettings;
}

const allTypes = (value: boolean): Record<CharType, boolean> => ({ lower: value, upper: value, digits: value, symbols: value });

export const DEFAULT_SETTINGS: GeneratorSettings = {
  mode: 'random',
  random: { length: 20, types: allTypes(true), excludeAmbiguous: false, requireEachType: false },
  passphrase: { wordCount: 6, separator: '-', capitalize: true, addNumber: true },
  pin: { length: 6 },
  site: {
    minLength: 8,
    maxLength: 64,
    length: 16,
    allowed: allTypes(true),
    allowedSymbols: '!@#$%^&*',
    required: allTypes(false),
    excluded: '',
  },
};

// ---------------------------------------------------------------
// PRESETS: one click sets several options. Labels live in the UI.
// ---------------------------------------------------------------

export type PresetId =
  | 'random-everyday' | 'random-strong' | 'random-max' | 'random-easy-read'
  | 'passphrase-short' | 'passphrase-strong' | 'passphrase-long'
  | 'pin-4' | 'pin-6' | 'pin-8';

export const PRESETS: Readonly<Record<Exclude<Mode, 'site'>, readonly PresetId[]>> = {
  random: ['random-everyday', 'random-strong', 'random-max', 'random-easy-read'],
  passphrase: ['passphrase-short', 'passphrase-strong', 'passphrase-long'],
  pin: ['pin-4', 'pin-6', 'pin-8'],
};

export function applyPreset(settings: GeneratorSettings, preset: PresetId): GeneratorSettings {
  const random = (patch: Partial<RandomSettings>) => ({ ...settings, mode: 'random' as const, random: { ...settings.random, ...patch } });
  const passphrase = (patch: Partial<PassphraseSettings>) => ({ ...settings, mode: 'passphrase' as const, passphrase: { ...settings.passphrase, ...patch } });
  const pin = (length: number) => ({ ...settings, mode: 'pin' as const, pin: { length } });
  switch (preset) {
    case 'random-everyday': return random({ length: 16, types: allTypes(true), excludeAmbiguous: false });
    case 'random-strong': return random({ length: 24, types: allTypes(true), excludeAmbiguous: false });
    case 'random-max': return random({ length: 64, types: allTypes(true), excludeAmbiguous: false });
    case 'random-easy-read': return random({ length: 20, types: { ...allTypes(true), symbols: false }, excludeAmbiguous: true });
    case 'passphrase-short': return passphrase({ wordCount: 4 });
    case 'passphrase-strong': return passphrase({ wordCount: 6 });
    case 'passphrase-long': return passphrase({ wordCount: 10 });
    case 'pin-4': return pin(4);
    case 'pin-6': return pin(6);
    case 'pin-8': return pin(8);
  }
}

// ---------------------------------------------------------------
// PROBLEMS: every conflict is reported, never silently "fixed".
// ---------------------------------------------------------------

export type Problem =
  | { code: 'random-no-types' }
  | { code: 'length-out-of-range'; min: number; max: number }
  | { code: 'too-short-for-required'; length: number; needed: number }
  | { code: 'words-out-of-range'; min: number; max: number }
  | { code: 'separator-invalid' }
  | { code: 'site-min-over-max'; min: number; max: number }
  | { code: 'site-limits-out-of-range'; min: number; max: number }
  | { code: 'site-length-outside-limits'; length: number; min: number; max: number }
  | { code: 'site-no-allowed-types' }
  | { code: 'site-required-not-allowed'; type: CharType }
  | { code: 'site-required-all-excluded'; type: CharType }
  | { code: 'site-symbols-invalid'; characters: string }
  | { code: 'site-everything-excluded' };

const isWhole = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;
const unique = (text: string) => [...new Set([...text])].join('');
const without = (text: string, remove: string) => [...text].filter((c) => !remove.includes(c)).join('');

interface CharacterPlan {
  length: number;
  /** Every character the password may contain (no repeats). */
  pool: string;
  /** Each entry is a set the password must use at least once. Sets never overlap. */
  required: string[];
}

/** Turn Random or Site settings into the exact characters allowed and required. */
function characterPlan(settings: GeneratorSettings): CharacterPlan {
  if (settings.mode === 'site') {
    const site = settings.site;
    const sets = new Map<CharType, string>();
    for (const type of CHAR_TYPES) {
      if (!site.allowed[type]) continue;
      const base = type === 'symbols' ? unique(site.allowedSymbols) : CHARACTER_SETS[type];
      sets.set(type, without(base, site.excluded));
    }
    return {
      length: site.length,
      pool: [...sets.values()].join(''),
      required: CHAR_TYPES.filter((t) => site.required[t] && sets.has(t)).map((t) => sets.get(t)!).filter(Boolean),
    };
  }
  const random = settings.random;
  const sets = CHAR_TYPES
    .filter((type) => random.types[type])
    .map((type) => (random.excludeAmbiguous ? without(CHARACTER_SETS[type], AMBIGUOUS_CHARACTERS) : CHARACTER_SETS[type]));
  return { length: random.length, pool: sets.join(''), required: random.requireEachType ? sets : [] };
}

/** Every reason the current settings can't make a password. Empty means good to go. */
export function findProblems(settings: GeneratorSettings): Problem[] {
  const problems: Problem[] = [];
  switch (settings.mode) {
    case 'random': {
      const { length, types, requireEachType } = settings.random;
      const selected = CHAR_TYPES.filter((t) => types[t]).length;
      if (selected === 0) problems.push({ code: 'random-no-types' });
      if (!isWhole(length, LIMITS.random.min, LIMITS.random.max)) {
        problems.push({ code: 'length-out-of-range', ...LIMITS.random });
      } else if (requireEachType && length < selected) {
        problems.push({ code: 'too-short-for-required', length, needed: selected });
      }
      break;
    }
    case 'passphrase': {
      const { wordCount, separator } = settings.passphrase;
      if (!isWhole(wordCount, LIMITS.passphrase.min, LIMITS.passphrase.max)) problems.push({ code: 'words-out-of-range', ...LIMITS.passphrase });
      if (!PASSPHRASE_SEPARATORS.includes(separator)) problems.push({ code: 'separator-invalid' });
      break;
    }
    case 'pin':
      if (!isWhole(settings.pin.length, LIMITS.pin.min, LIMITS.pin.max)) problems.push({ code: 'length-out-of-range', ...LIMITS.pin });
      break;
    case 'site': {
      const site = settings.site;
      const limitsOk = isWhole(site.minLength, LIMITS.site.min, LIMITS.site.max) && isWhole(site.maxLength, LIMITS.site.min, LIMITS.site.max);
      if (!limitsOk) {
        problems.push({ code: 'site-limits-out-of-range', ...LIMITS.site });
      } else if (site.minLength > site.maxLength) {
        problems.push({ code: 'site-min-over-max', min: site.minLength, max: site.maxLength });
      } else if (!isWhole(site.length, site.minLength, site.maxLength)) {
        problems.push({ code: 'site-length-outside-limits', length: site.length, min: site.minLength, max: site.maxLength });
      }

      const badSymbols = unique([...site.allowedSymbols].filter((c) => /[\p{L}\p{N}\s]/u.test(c)).join(''));
      if (badSymbols) problems.push({ code: 'site-symbols-invalid', characters: badSymbols });

      if (!CHAR_TYPES.some((t) => site.allowed[t])) problems.push({ code: 'site-no-allowed-types' });
      for (const type of CHAR_TYPES) {
        if (!site.required[type]) continue;
        if (!site.allowed[type]) {
          problems.push({ code: 'site-required-not-allowed', type });
        } else {
          const base = type === 'symbols' ? site.allowedSymbols : CHARACTER_SETS[type];
          if (!without(base, site.excluded)) problems.push({ code: 'site-required-all-excluded', type });
        }
      }

      if (!problems.length) {
        const plan = characterPlan(settings);
        if (!plan.pool) problems.push({ code: 'site-everything-excluded' });
        else if (plan.length < plan.required.length) {
          problems.push({ code: 'too-short-for-required', length: plan.length, needed: plan.required.length });
        }
      }
      break;
    }
  }
  return problems;
}

// ---------------------------------------------------------------
// GENERATION
// ---------------------------------------------------------------

function randomFrom(plan: CharacterPlan): string {
  // Rejection sampling: draw from the whole pool and start over if a required
  // set is missing. Every valid password stays equally likely (no bias toward
  // putting the required characters first, for example).
  for (let attempt = 0; attempt < 100_000; attempt++) {
    let password = '';
    for (let i = 0; i < plan.length; i++) password += plan.pool[randomBelow(plan.pool.length)];
    if (plan.required.every((set) => [...password].some((c) => set.includes(c)))) return password;
  }
  throw new Error('Could not meet the required character types. Try a longer length.');
}

function generateOne(settings: GeneratorSettings): string {
  switch (settings.mode) {
    case 'random':
    case 'site':
      return randomFrom(characterPlan(settings));
    case 'passphrase': {
      const { wordCount, separator, capitalize, addNumber } = settings.passphrase;
      const words = sampleWords(wordCount).map((w) => (capitalize ? w[0].toUpperCase() + w.slice(1) : w));
      if (addNumber) words.push(String(randomBelow(90) + 10));
      return words.join(separator);
    }
    case 'pin': {
      let pin = '';
      for (let i = 0; i < settings.pin.length; i++) pin += randomBelow(10);
      return pin;
    }
  }
}

export type BatchResult = { ok: true; passwords: string[] } | { ok: false; problems: Problem[] };

/** Make `count` different passwords, or explain why the settings can't. */
export function generateBatch(settings: GeneratorSettings, count: number): BatchResult {
  const problems = findProblems(settings);
  if (problems.length) return { ok: false, problems };
  const size = Math.min(Math.max(Math.trunc(count), LIMITS.batch.min), LIMITS.batch.max);
  const passwords = new Set<string>();
  // Repeats are astronomically unlikely except for short PINs; skip them so the choices differ.
  for (let tries = 0; passwords.size < size && tries < size * 50; tries++) passwords.add(generateOne(settings));
  return { ok: true, passwords: [...passwords] };
}

// ---------------------------------------------------------------
// STRENGTH ESTIMATE
// Counts how many passwords these settings could produce, as bits
// (log2 of the count). It assumes the attacker knows the settings,
// which is the honest, worst-case view. It is an estimate of the
// method, not a "time to crack".
// ---------------------------------------------------------------

function log2Big(n: bigint): number {
  if (n <= 0n) return 0;
  const bits = n.toString(2).length;
  const shift = Math.max(0, bits - 53);
  return Math.log2(Number(n >> BigInt(shift))) + shift;
}

/** Exact number of length-L strings over the pool that use every required set (inclusion-exclusion). */
function countWithRequired(poolSize: number, length: number, requiredSizes: number[]): bigint {
  let total = 0n;
  const k = requiredSizes.length;
  for (let mask = 0; mask < 1 << k; mask++) {
    let missing = 0;
    let sign = 1n;
    for (let i = 0; i < k; i++) {
      if (mask & (1 << i)) { missing += requiredSizes[i]; sign = -sign; }
    }
    total += sign * BigInt(poolSize - missing) ** BigInt(length);
  }
  return total;
}

export interface StrengthDetails {
  bits: number;
  mode: Mode;
  /** Random and Site modes */
  length?: number;
  poolSize?: number;
  requiredTypes?: number;
  /** Passphrase mode */
  wordCount?: number;
  wordListSize?: number;
  addsNumber?: boolean;
}

export function estimateStrength(settings: GeneratorSettings): StrengthDetails | null {
  if (findProblems(settings).length) return null;
  switch (settings.mode) {
    case 'random':
    case 'site': {
      const plan = characterPlan(settings);
      const count = countWithRequired(plan.pool.length, plan.length, plan.required.map((s) => s.length));
      return { bits: log2Big(count), mode: settings.mode, length: plan.length, poolSize: plan.pool.length, requiredTypes: plan.required.length };
    }
    case 'passphrase': {
      const { wordCount, addNumber } = settings.passphrase;
      let bits = addNumber ? Math.log2(90) : 0;
      for (let i = 0; i < wordCount; i++) bits += Math.log2(WORDS.length - i);
      return { bits, mode: 'passphrase', wordCount, wordListSize: WORDS.length, addsNumber: addNumber };
    }
    case 'pin':
      return { bits: settings.pin.length * Math.log2(10), mode: 'pin', length: settings.pin.length, poolSize: 10 };
  }
}

// ---------------------------------------------------------------
// COPY FORMATS
// ---------------------------------------------------------------

export type CopyFormat = 'plain' | 'json' | 'env';
export const COPY_FORMATS: readonly CopyFormat[] = ['plain', 'json', 'env'];

export const isValidEnvName = (name: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);

/**
 * Format a password for pasting somewhere specific.
 * - json: a JSON string literal; JSON.stringify handles quotes, backslashes, and control characters.
 * - env: NAME="value" using shell-style double-quote escaping (\\ \" \$ \`), which
 *   shells, Docker Compose, and python-dotenv read back exactly.
 */
export function formatForCopy(password: string, format: CopyFormat, envName = 'PASSWORD'): string {
  switch (format) {
    case 'plain': return password;
    case 'json': return JSON.stringify(password);
    case 'env': {
      if (!isValidEnvName(envName)) throw new Error('Invalid variable name');
      return `${envName}="${password.replace(/[\\"$`]/g, (c) => `\\${c}`)}"`;
    }
  }
}

// ---------------------------------------------------------------
// SANITIZING SAVED SETTINGS
// Saved preferences come back from localStorage, which anything on the
// device can edit. Treat them as untrusted: keep only known fields with
// the right types, and fall back to defaults for the rest.
// ---------------------------------------------------------------

type Loose = Record<string, unknown>;
const asObject = (v: unknown): Loose => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Loose) : {});
const pickBool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const pickInt = (v: unknown, fallback: number, min: number, max: number) => (typeof v === 'number' && isWhole(v, min, max) ? v : fallback);
const pickText = (v: unknown, fallback: string, maxLength: number) => (typeof v === 'string' && v.length <= maxLength ? v : fallback);
const pickTypes = (v: unknown, fallback: Record<CharType, boolean>) => {
  const o = asObject(v);
  return Object.fromEntries(CHAR_TYPES.map((t) => [t, pickBool(o[t], fallback[t])])) as Record<CharType, boolean>;
};

export function sanitizeSettings(raw: unknown): GeneratorSettings {
  const d = DEFAULT_SETTINGS;
  const o = asObject(raw);
  const r = asObject(o.random);
  const p = asObject(o.passphrase);
  const s = asObject(o.site);
  return {
    mode: MODES.includes(o.mode as Mode) ? (o.mode as Mode) : d.mode,
    random: {
      length: pickInt(r.length, d.random.length, LIMITS.random.min, LIMITS.random.max),
      types: pickTypes(r.types, d.random.types),
      excludeAmbiguous: pickBool(r.excludeAmbiguous, d.random.excludeAmbiguous),
      requireEachType: pickBool(r.requireEachType, d.random.requireEachType),
    },
    passphrase: {
      wordCount: pickInt(p.wordCount, d.passphrase.wordCount, LIMITS.passphrase.min, LIMITS.passphrase.max),
      separator: PASSPHRASE_SEPARATORS.includes(p.separator as PassphraseSeparator) ? (p.separator as PassphraseSeparator) : d.passphrase.separator,
      capitalize: pickBool(p.capitalize, d.passphrase.capitalize),
      addNumber: pickBool(p.addNumber, d.passphrase.addNumber),
    },
    pin: { length: pickInt(asObject(o.pin).length, d.pin.length, LIMITS.pin.min, LIMITS.pin.max) },
    site: {
      minLength: pickInt(s.minLength, d.site.minLength, LIMITS.site.min, LIMITS.site.max),
      maxLength: pickInt(s.maxLength, d.site.maxLength, LIMITS.site.min, LIMITS.site.max),
      length: pickInt(s.length, d.site.length, LIMITS.site.min, LIMITS.site.max),
      allowed: pickTypes(s.allowed, d.site.allowed),
      allowedSymbols: pickText(s.allowedSymbols, d.site.allowedSymbols, 64),
      required: pickTypes(s.required, d.site.required),
      excluded: pickText(s.excluded, d.site.excluded, 128),
    },
  };
}
