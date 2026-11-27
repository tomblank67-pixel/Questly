import { addDays, diffDays } from './date';

/**
 * Streak = number of consecutive game days with at least one finished quest.
 *
 * If today has nothing yet but yesterday had, the streak is still "alive":
 * it is shown with yesterday's count until the day is over. Only a full day
 * without any quest resets it.
 */
export interface StreakInfo {
  current: number;
  longest: number;
  /** True when today already counts. */
  doneToday: boolean;
}

export function computeStreak(activeDays: Iterable<string>, today: string): StreakInfo {
  const days = new Set(activeDays);
  const doneToday = days.has(today);

  let current = 0;
  let cursor = doneToday ? today : addDays(today, -1);
  while (days.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  return { current, longest: Math.max(current, longestStreak(days)), doneToday };
}

/** Longest run of consecutive days anywhere in the history. */
export function longestStreak(days: Iterable<string>): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && diffDays(sorted[i - 1], sorted[i]) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}
