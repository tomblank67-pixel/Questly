import { describe, expect, it } from 'vitest';
import { drawDailyQuests, pickReroll, recentQuestIds, rngForDay } from './dailyQuests';
import { QUEST_POOL } from '../data/quests';
import { CATEGORY_IDS } from '../data/categories';
import { addDays } from './date';

const all = CATEGORY_IDS;

describe('quest pool', () => {
  it('has at least 80 quests in all 6 categories with unique ids', () => {
    expect(QUEST_POOL.length).toBeGreaterThanOrEqual(80);
    expect(new Set(QUEST_POOL.map((q) => q.id)).size).toBe(QUEST_POOL.length);
    for (const c of all) expect(QUEST_POOL.filter((q) => q.category === c).length).toBeGreaterThanOrEqual(10);
  });
});

describe('drawDailyQuests', () => {
  it('draws the requested number of quests from different categories', () => {
    for (const count of [3, 4, 5]) {
      const q = drawDailyQuests(QUEST_POOL, { count, enabledCategories: all, excludeIds: [], rng: rngForDay('2026-11-27') });
      expect(q).toHaveLength(count);
      expect(new Set(q.map((x) => x.category)).size).toBe(count);
      expect(new Set(q.map((x) => x.id)).size).toBe(count);
    }
  });

  it('is deterministic per day', () => {
    const a = drawDailyQuests(QUEST_POOL, { count: 3, enabledCategories: all, excludeIds: [], rng: rngForDay('2026-11-27') });
    const b = drawDailyQuests(QUEST_POOL, { count: 3, enabledCategories: all, excludeIds: [], rng: rngForDay('2026-11-27') });
    expect(a).toEqual(b);
  });

  it('respects disabled categories', () => {
    const q = drawDailyQuests(QUEST_POOL, { count: 5, enabledCategories: ['natur', 'geist'], excludeIds: [], rng: rngForDay('x') });
    expect(q).toHaveLength(5);
    expect(q.every((x) => x.category === 'natur' || x.category === 'geist')).toBe(true);
  });

  it('contains at most one epic quest', () => {
    for (let i = 0; i < 200; i++) {
      const q = drawDailyQuests(QUEST_POOL, { count: 5, enabledCategories: all, excludeIds: [], rng: rngForDay(`d${i}`) });
      expect(q.filter((x) => x.difficulty === 'episch').length).toBeLessThanOrEqual(1);
    }
  });

  it('never repeats a quest from the last 7 days over a simulated month', () => {
    const history: { day: string; questIds: string[] }[] = [];
    let day = '2026-11-01';
    for (let i = 0; i < 60; i++) {
      const recent = recentQuestIds(day, history);
      const q = drawDailyQuests(QUEST_POOL, { count: 5, enabledCategories: all, excludeIds: recent, rng: rngForDay(day) });
      for (const x of q) expect(recent.has(x.id)).toBe(false);
      history.push({ day, questIds: q.map((x) => x.id) });
      day = addDays(day, 1);
    }
  });

  it('falls back to repeats if the pool is too small', () => {
    const tiny = QUEST_POOL.filter((q) => q.category === 'natur').slice(0, 3);
    const q = drawDailyQuests(tiny, { count: 3, enabledCategories: ['natur'], excludeIds: tiny.map((t) => t.id), rng: rngForDay('y') });
    expect(q).toHaveLength(3);
  });
});

describe('recentQuestIds', () => {
  it('only includes the 7 days before the given day', () => {
    const sets = [
      { day: '2026-11-19', questIds: ['old'] },
      { day: '2026-11-20', questIds: ['a'] },
      { day: '2026-11-26', questIds: ['b'] },
      { day: '2026-11-27', questIds: ['today'] },
    ];
    expect([...recentQuestIds('2026-11-27', sets)].sort()).toEqual(['a', 'b']);
  });
});

describe('pickReroll', () => {
  it('returns a new quest, preferably of a category not yet present', () => {
    const current = drawDailyQuests(QUEST_POOL, { count: 3, enabledCategories: all, excludeIds: [], rng: rngForDay('r') });
    const ids = current.map((q) => q.id);
    const next = pickReroll(QUEST_POOL, ids, ids[0], { enabledCategories: all, excludeIds: [], rng: rngForDay('r', 'reroll') });
    expect(next).not.toBeNull();
    expect(ids).not.toContain(next!.id);
    const remainingCats = current.slice(1).map((q) => q.category);
    expect(remainingCats).not.toContain(next!.category);
  });
});
