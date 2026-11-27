/**
 * Level curve.
 *
 * Reaching the next level costs a little more each time:
 *   XP needed from level n → n+1  =  BASE + STEP · (n − 1)
 * i.e. 50, 75, 100, 125, … – a gentle, linearly growing (overall quadratic) curve.
 */

export const LEVEL_BASE_XP = 50;
export const LEVEL_STEP_XP = 25;

/** XP required to advance from `level` to `level + 1`. */
export function xpToNext(level: number): number {
  return LEVEL_BASE_XP + LEVEL_STEP_XP * (level - 1);
}

/** Total XP needed to *reach* a level (level 1 = 0 XP). */
export function totalXpForLevel(level: number): number {
  const n = level - 1; // number of level-ups
  return n * LEVEL_BASE_XP + (LEVEL_STEP_XP * n * (n - 1)) / 2;
}

export interface LevelInfo {
  level: number;
  /** XP collected inside the current level. */
  xpInLevel: number;
  /** XP the current level requires in total. */
  xpNeeded: number;
  /** 0…1 progress towards the next level. */
  progress: number;
}

export function levelInfo(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  while (totalXpForLevel(level + 1) <= xp) level++;
  const xpInLevel = xp - totalXpForLevel(level);
  const xpNeeded = xpToNext(level);
  return { level, xpInLevel, xpNeeded, progress: xpInLevel / xpNeeded };
}
