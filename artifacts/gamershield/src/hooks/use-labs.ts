// Which Cyber Labs are completed (lab IDs only), saved in this browser.

import { useSyncExternalStore } from 'react';
import { READY_LAB_IDS } from '@/content/labs';
import { STORAGE_KEYS, parseIdList, readStorage, writeStorage } from '@/lib/platform/storage';

let completed = parseIdList(readStorage(STORAGE_KEYS.labs), READY_LAB_IDS);
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

window.addEventListener('storage', () => reloadLabs());

export function completeLab(id: string) {
  if (completed.includes(id) || !READY_LAB_IDS.has(id)) return;
  completed = [...completed, id];
  writeStorage(STORAGE_KEYS.labs, JSON.stringify(completed));
  emit();
}

export function reloadLabs() {
  completed = parseIdList(readStorage(STORAGE_KEYS.labs), READY_LAB_IDS);
  emit();
}

export function useCompletedLabs(): string[] {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => completed);
}
