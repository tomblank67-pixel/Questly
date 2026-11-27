import type { CategoryId, Completion } from '../types';
import { CATEGORY_IDS } from '../data/categories';
import { computeStreak, type StreakInfo } from './streak';
import { levelInfo, type LevelInfo } from './level';
import { diffDays } from './date';

export interface PlayerStats {
  totalXp: number;
  totalCompleted: number;
  byCategory: Record<CategoryId, { count: number; xp: number }>;
  epicCompleted: number;
  customCompleted: number;
  notesWritten: number;
  activeDays: Set<string>;
  lastActiveDay: string | null;
  streak: StreakInfo;
  level: LevelInfo;
}

/** Derives every progress number from the list of completions (single source of truth). */
export function computeStats(completions: Completion[], today: string): PlayerStats {
  const byCategory = Object.fromEntries(CATEGORY_IDS.map((c) => [c, { count: 0, xp: 0 }])) as PlayerStats['byCategory'];
  const activeDays = new Set<string>();
  let totalXp = 0;
  let epicCompleted = 0;
  let customCompleted = 0;
  let notesWritten = 0;
  let lastActiveDay: string | null = null;

  for (const c of completions) {
    totalXp += c.xp;
    byCategory[c.category].count++;
    byCategory[c.category].xp += c.xp;
    if (c.difficulty === 'episch') epicCompleted++;
    if (c.questKey.startsWith('custom:')) customCompleted++;
    if (c.note?.trim()) notesWritten++;
    activeDays.add(c.day);
    if (!lastActiveDay || c.day > lastActiveDay) lastActiveDay = c.day;
  }

  return {
    totalXp,
    totalCompleted: completions.length,
    byCategory,
    epicCompleted,
    customCompleted,
    notesWritten,
    activeDays,
    lastActiveDay,
    streak: computeStreak(activeDays, today),
    level: levelInfo(totalXp),
  };
}

/** Days since the last finished quest (null if there never was one). */
export function daysInactive(stats: Pick<PlayerStats, 'lastActiveDay'>, today: string): number | null {
  return stats.lastActiveDay ? diffDays(stats.lastActiveDay, today) : null;
}
