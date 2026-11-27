import type { CategoryId, PoolQuest } from '../types';
import { createRng, shuffle, type Rng } from './random';
import { addDays } from './date';

/** How many past days are excluded from the draw. */
export const NO_REPEAT_DAYS = 7;

export interface DrawOptions {
  count: number;
  enabledCategories: CategoryId[];
  /** Quest ids that should not appear (e.g. drawn in the last 7 days). */
  excludeIds: Iterable<string>;
  rng: Rng;
}

/** Ids drawn on the NO_REPEAT_DAYS days before `day`. */
export function recentQuestIds(day: string, sets: { day: string; questIds: string[] }[]): Set<string> {
  const from = addDays(day, -NO_REPEAT_DAYS);
  const ids = new Set<string>();
  for (const s of sets) {
    if (s.day >= from && s.day < day) s.questIds.forEach((id) => ids.add(id));
  }
  return ids;
}

/**
 * Draws `count` quests:
 *  1. only from enabled categories,
 *  2. avoiding excluded (recent) quests – unless the pool would run dry,
 *  3. spreading over as many different categories as possible (round-robin),
 *  4. with at most one "episch" quest when alternatives exist, so a day stays doable.
 */
export function drawDailyQuests(pool: PoolQuest[], opts: DrawOptions): PoolQuest[] {
  const enabled = new Set(opts.enabledCategories.length ? opts.enabledCategories : pool.map((q) => q.category));
  const exclude = new Set(opts.excludeIds);
  const inEnabled = pool.filter((q) => enabled.has(q.category));

  let candidates = inEnabled.filter((q) => !exclude.has(q.id));
  // Fallback: too few fresh quests (tiny pool / few categories) → allow repeats.
  if (candidates.length < opts.count) candidates = inEnabled;

  const shuffled = shuffle(candidates, opts.rng);
  const byCategory = new Map<CategoryId, PoolQuest[]>();
  for (const q of shuffled) {
    if (!byCategory.has(q.category)) byCategory.set(q.category, []);
    byCategory.get(q.category)!.push(q);
  }

  const chosen: PoolQuest[] = [];
  let epicCount = 0;
  const categoryOrder = shuffle([...byCategory.keys()], opts.rng);

  // Round-robin over categories until we have enough or everything is used.
  while (chosen.length < opts.count) {
    let progressed = false;
    for (const cat of categoryOrder) {
      if (chosen.length >= opts.count) break;
      const list = byCategory.get(cat)!;
      if (!list.length) continue;
      // Prefer a non-epic quest once an epic one is already in the set.
      let idx = 0;
      if (epicCount >= 1) {
        const nonEpic = list.findIndex((q) => q.difficulty !== 'episch');
        if (nonEpic >= 0) idx = nonEpic;
      }
      const [q] = list.splice(idx, 1);
      if (q.difficulty === 'episch') epicCount++;
      chosen.push(q);
      progressed = true;
    }
    if (!progressed) break;
  }
  return chosen;
}

/**
 * Picks a replacement for one quest of today's set (the daily re-roll).
 * Prefers a category that is not yet in the remaining set. Returns null if
 * no alternative exists.
 */
export function pickReroll(
  pool: PoolQuest[],
  currentIds: string[],
  replaceId: string,
  opts: Omit<DrawOptions, 'count'>,
): PoolQuest | null {
  const enabled = new Set(opts.enabledCategories);
  const exclude = new Set([...opts.excludeIds, ...currentIds]);
  const remainingCats = new Set(
    currentIds.filter((id) => id !== replaceId).map((id) => pool.find((q) => q.id === id)?.category),
  );

  let candidates = pool.filter((q) => enabled.has(q.category) && !exclude.has(q.id));
  if (!candidates.length) {
    candidates = pool.filter((q) => enabled.has(q.category) && !currentIds.includes(q.id));
  }
  if (!candidates.length) return null;

  const fresh = candidates.filter((q) => !remainingCats.has(q.category));
  const list = shuffle(fresh.length ? fresh : candidates, opts.rng);
  return list[0];
}

/** Seeded RNG for the draw of a given day. */
export const rngForDay = (day: string, salt = '') => createRng(`questly:${day}:${salt}`);
