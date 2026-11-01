// Applies the saved theme to the page. Shared by the main app and the
// standalone generator page so both always match.

import { STORAGE_KEYS, parseTheme, readStorage, resolveTheme, type ThemePreference } from './storage.ts';

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function applyTheme(preference: ThemePreference): void {
  const theme = resolveTheme(preference, darkQuery().matches);
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

/** Apply the saved theme now and follow the system setting when set to "system". */
export function startTheme(getPreference: () => ThemePreference = () => parseTheme(readStorage(STORAGE_KEYS.theme))): void {
  applyTheme(getPreference());
  darkQuery().addEventListener('change', () => applyTheme(getPreference()));
}
