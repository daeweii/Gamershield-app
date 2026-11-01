// Preferences saved in this browser between visits. Passwords are NEVER part of this.
// localStorage can be cleared, blocked, or edited by anything on the device,
// so every read is wrapped in try/catch and run through sanitizeSettings().

import {
  COPY_FORMATS, DEFAULT_SETTINGS, LIMITS, MODES, isValidEnvName, sanitizeSettings,
  type CopyFormat, type GeneratorSettings, type Mode,
} from '@/lib/security';

const STORAGE_KEY = 'gamershield.generator.prefs.v1';

export interface Prefs {
  settings: GeneratorSettings;
  batchSize: number;
  copyFormat: CopyFormat;
  envName: string;
  tourDone: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  settings: DEFAULT_SETTINGS,
  batchSize: 3,
  copyFormat: 'plain',
  envName: 'PASSWORD',
  tourDone: false,
};

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const saved: Record<string, unknown> = JSON.parse(raw) ?? {};
    return {
      settings: sanitizeSettings(saved.settings),
      batchSize: Number.isInteger(saved.batchSize) && (saved.batchSize as number) >= LIMITS.batch.min && (saved.batchSize as number) <= LIMITS.batch.max
        ? (saved.batchSize as number) : DEFAULT_PREFS.batchSize,
      copyFormat: COPY_FORMATS.includes(saved.copyFormat as CopyFormat) ? (saved.copyFormat as CopyFormat) : DEFAULT_PREFS.copyFormat,
      envName: typeof saved.envName === 'string' && saved.envName.length <= 64 && isValidEnvName(saved.envName) ? saved.envName : DEFAULT_PREFS.envName,
      tourDone: saved.tourDone === true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * A link like generator/?mode=passphrase opens a specific mode for this visit.
 * Only known modes are accepted, and nothing is saved until the user changes a setting.
 */
export function withModeFromUrl(prefs: Prefs, search = window.location.search): Prefs {
  const mode = new URLSearchParams(search).get('mode');
  return MODES.includes(mode as Mode) ? { ...prefs, settings: { ...prefs.settings, mode: mode as Mode } } : prefs;
}

export function savePrefs(prefs: Prefs): void {
  try {
    // An env name mid-typing may be invalid; save the default instead of a broken one.
    const envName = isValidEnvName(prefs.envName) ? prefs.envName : DEFAULT_PREFS.envName;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, envName }));
  } catch {
    // Storage blocked (private mode, settings). The page still works; it just won't remember.
  }
}

export function clearPrefs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is blocked.
  }
}
