/**
 * Central domain types for Questly.
 */

export type CategoryId = 'koerper' | 'geist' | 'soziales' | 'kreativitaet' | 'natur' | 'abenteuer';

export type Difficulty = 'leicht' | 'mittel' | 'episch';

/** A quest from the built-in pool. */
export interface PoolQuest {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  difficulty: Difficulty;
}

/** How often a custom quest shows up. Weekdays use JS numbering: 0 = Sonntag … 6 = Samstag. */
export type Recurrence =
  | { type: 'once' }
  | { type: 'daily' }
  | { type: 'weekly'; weekdays: number[] };

/** A quest the user created. */
export interface CustomQuest {
  id?: number;
  title: string;
  description: string;
  category: CategoryId;
  difficulty: Difficulty;
  recurrence: Recurrence;
  createdAt: number;
}

/** The daily quests drawn for one game day. */
export interface DailySet {
  /** Game day, format YYYY-MM-DD. */
  day: string;
  /** Pool quest ids in display order. */
  questIds: string[];
  /** True once the user used the daily re-roll. */
  rerolled: boolean;
  createdAt: number;
}

/**
 * One finished quest. Title/category/xp are snapshotted, so the journal stays
 * intact even if a custom quest is later edited or deleted.
 */
export interface Completion {
  id?: number;
  day: string;
  /** "pool:<id>" or "custom:<id>" */
  questKey: string;
  title: string;
  category: CategoryId;
  difficulty: Difficulty;
  xp: number;
  completedAt: number;
  note?: string;
}

export type AccessorySlot = 'kopf' | 'gesicht' | 'hals' | 'ruecken' | 'hand';

export type ThemeMode = 'dark' | 'light';

export interface Settings {
  /** Hour (0–12) at which a new game day starts. Default 5. */
  rolloverHour: number;
  /** Number of daily quests, 3–5. */
  dailyCount: number;
  enabledCategories: CategoryId[];
  /** Equipped accessory id per slot. */
  equipped: Partial<Record<AccessorySlot, string>>;
  theme: ThemeMode;
}
