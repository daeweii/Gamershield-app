// What Sentrix remembers in this browser, and the pure rules for it.
// Only preferences and tool IDs are stored: never passwords, messages, links,
// or anything else a user types. Saved values are untrusted on read
// (any script or person with device access can edit localStorage), so
// every reader validates and falls back to safe defaults.

import { TOOL_IDS } from './registry.ts';

export const STORAGE_KEYS = {
  favorites: 'sentrix.favorites.v1',
  recent: 'sentrix.recent.v1',
  theme: 'sentrix.theme.v1',
  sidebar: 'sentrix.sidebar.v1',
  /** IDs of ticked Security Checklist items. */
  checklist: 'sentrix.checklist.v1',
  /** Learning Center: completed lesson IDs and best quiz scores. */
  learning: 'sentrix.learning.v1',
  /** IDs of completed Cyber Labs. */
  labs: 'sentrix.labs.v1',
  /** Owned by the password generator page; listed so "reset everything" clears it too. */
  generatorPrefs: 'gamershield.generator.prefs.v1',
} as const;

export const MAX_RECENT = 6;

/** Parse a saved list of tool IDs: drop unknown IDs, duplicates, and junk. */
export function parseToolIds(raw: string | null, max = Infinity): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const ids = value.filter((id): id is string => typeof id === 'string' && TOOL_IDS.has(id));
    return [...new Set(ids)].slice(0, max);
  } catch {
    return [];
  }
}

/** Parse saved IDs from any allowed set (used for checklist progress). */
export function parseIdList(raw: string | null, allowed: ReadonlySet<string>): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && allowed.has(id)))];
  } catch {
    return [];
  }
}

export function toggleFavorite(favorites: readonly string[], id: string): string[] {
  return favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
}

/** Most recent first, no duplicates, capped. */
export function pushRecent(recent: readonly string[], id: string, max = MAX_RECENT): string[] {
  return [id, ...recent.filter((r) => r !== id)].slice(0, max);
}

export type ThemePreference = 'light' | 'dark' | 'system';
export const THEME_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

export function parseTheme(raw: string | null): ThemePreference {
  return THEME_PREFERENCES.includes(raw as ThemePreference) ? (raw as ThemePreference) : 'system';
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): 'light' | 'dark' {
  return preference === 'system' ? (systemPrefersDark ? 'dark' : 'light') : preference;
}

// Thin, crash-proof wrappers: storage can be blocked (private mode, settings).
export function readStorage(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function writeStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* not remembered, still works */ }
}
export function removeStorage(key: string): void {
  try { localStorage.removeItem(key); } catch { /* nothing to remove */ }
}
