import Dexie, { type Table } from 'dexie';
import type { Completion, CustomQuest, DailySet, Settings } from '../types';
import { CATEGORY_IDS } from '../data/categories';

/**
 * Local IndexedDB database (via Dexie). Everything stays on the device.
 */
export class QuestlyDB extends Dexie {
  settings!: Table<{ key: string; value: Settings }, string>;
  dailySets!: Table<DailySet, string>;
  completions!: Table<Completion, number>;
  customQuests!: Table<CustomQuest, number>;

  constructor(name = 'questly') {
    super(name);
    this.version(1).stores({
      settings: 'key',
      dailySets: 'day',
      completions: '++id, day, questKey, [day+questKey], completedAt',
      customQuests: '++id, createdAt',
    });
  }
}

export const db = new QuestlyDB();

export const DEFAULT_SETTINGS: Settings = {
  rolloverHour: 5,
  dailyCount: 3,
  enabledCategories: [...CATEGORY_IDS],
  equipped: {},
  theme: 'dark',
};

/** Merges stored settings with defaults (forward compatible with new fields). */
export function normalizeSettings(s: Partial<Settings> | undefined): Settings {
  const merged = { ...DEFAULT_SETTINGS, ...(s ?? {}) };
  merged.dailyCount = Math.min(5, Math.max(3, Math.round(merged.dailyCount)));
  merged.rolloverHour = Math.min(12, Math.max(0, Math.round(merged.rolloverHour)));
  merged.enabledCategories = merged.enabledCategories.filter((c) => CATEGORY_IDS.includes(c));
  if (!merged.enabledCategories.length) merged.enabledCategories = [...CATEGORY_IDS];
  return merged;
}
