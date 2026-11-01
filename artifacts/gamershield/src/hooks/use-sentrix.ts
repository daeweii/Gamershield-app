// App-wide preferences: favorites, recently used tools, theme, and sidebar.
// A tiny store (no library needed) that saves to localStorage and keeps every
// component, and every open tab, in sync. Never holds anything a user typed.

import { useSyncExternalStore } from 'react';
import {
  MAX_RECENT, STORAGE_KEYS, parseTheme, parseToolIds, pushRecent, readStorage, removeStorage,
  toggleFavorite as toggle, writeStorage, type ThemePreference,
} from '@/lib/platform/storage';
import { applyTheme, startTheme } from '@/lib/platform/themeDom';

export interface SentrixState {
  favorites: string[];
  recent: string[];
  theme: ThemePreference;
  sidebarCollapsed: boolean;
}

function load(): SentrixState {
  return {
    favorites: parseToolIds(readStorage(STORAGE_KEYS.favorites)),
    recent: parseToolIds(readStorage(STORAGE_KEYS.recent), MAX_RECENT),
    theme: parseTheme(readStorage(STORAGE_KEYS.theme)),
    sidebarCollapsed: readStorage(STORAGE_KEYS.sidebar) === 'collapsed',
  };
}

let state = load();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function update(patch: Partial<SentrixState>) {
  state = { ...state, ...patch };
  if (patch.favorites) writeStorage(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
  if (patch.recent) writeStorage(STORAGE_KEYS.recent, JSON.stringify(state.recent));
  if (patch.theme) { writeStorage(STORAGE_KEYS.theme, state.theme); applyTheme(state.theme); }
  if (patch.sidebarCollapsed !== undefined) writeStorage(STORAGE_KEYS.sidebar, state.sidebarCollapsed ? 'collapsed' : 'expanded');
  emit();
}

// Apply the theme before the first render, and follow the OS if set to "system".
startTheme(() => state.theme);

// Another tab changed something: reload from storage.
window.addEventListener('storage', (event) => {
  if (event.key && !event.key.startsWith('sentrix.')) return;
  state = load();
  applyTheme(state.theme);
  emit();
});

export const sentrix = {
  toggleFavorite: (id: string) => update({ favorites: toggle(state.favorites, id) }),
  recordVisit: (id: string) => { if (state.recent[0] !== id) update({ recent: pushRecent(state.recent, id) }); },
  setTheme: (theme: ThemePreference) => update({ theme }),
  setSidebarCollapsed: (sidebarCollapsed: boolean) => update({ sidebarCollapsed }),
  clearFavorites: () => update({ favorites: [] }),
  clearRecent: () => update({ recent: [] }),
  /** Remove everything Sentrix saved in this browser, including generator preferences. */
  resetAll: () => {
    Object.values(STORAGE_KEYS).forEach(removeStorage);
    state = load();
    applyTheme(state.theme);
    emit();
  },
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useSentrix(): SentrixState {
  return useSyncExternalStore(subscribe, () => state);
}
