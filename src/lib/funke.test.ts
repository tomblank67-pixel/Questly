import { describe, expect, it } from 'vitest';
import { baseMood, stageForLevel } from './funke';
import { isCustomQuestDue } from './recurrence';
import { computeStats, daysInactive } from './stats';
import { ACCESSORIES, unlockedAccessoryIds } from '../data/accessories';
import { ALL_SAYINGS } from '../data/sayings';
import type { Completion, CustomQuest } from '../types';

describe('Funke stages', () => {
  it('evolves in 4 stages with the level', () => {
    expect(stageForLevel(1).stage).toBe(1);
    expect(stageForLevel(4).stage).toBe(1);
    expect(stageForLevel(5).stage).toBe(2);
    expect(stageForLevel(10).stage).toBe(3);
    expect(stageForLevel(20).stage).toBe(4);
    expect(stageForLevel(99).stage).toBe(4);
  });
});

describe('Funke mood', () => {
  it('gets sleepy after 2+ inactive days, never otherwise', () => {
    expect(baseMood({ daysInactive: null, doneToday: 0, dailyTotal: 3 })).toBe('idle');
    expect(baseMood({ daysInactive: 1, doneToday: 0, dailyTotal: 3 })).toBe('idle');
    expect(baseMood({ daysInactive: 2, doneToday: 0, dailyTotal: 3 })).toBe('sleepy');
    expect(baseMood({ daysInactive: 30, doneToday: 0, dailyTotal: 3 })).toBe('sleepy');
  });

  it('is happy / proud when quests are done today', () => {
    expect(baseMood({ daysInactive: 0, doneToday: 1, dailyTotal: 3 })).toBe('happy');
    expect(baseMood({ daysInactive: 0, doneToday: 3, dailyTotal: 3 })).toBe('proud');
  });

  it('has at least 40 different sayings', () => {
    expect(new Set(ALL_SAYINGS).size).toBeGreaterThanOrEqual(40);
  });
});

const completion = (day: string, extra: Partial<Completion> = {}): Completion => ({
  day,
  questKey: 'pool:k01',
  title: 'x',
  category: 'koerper',
  difficulty: 'leicht',
  xp: 10,
  completedAt: 0,
  ...extra,
});

describe('stats & accessories', () => {
  it('derives XP, level, streak and inactivity', () => {
    const list = [completion('2026-11-25', { xp: 50, difficulty: 'episch' }), completion('2026-11-26'), completion('2026-11-26', { category: 'geist', note: 'toll' })];
    const s = computeStats(list, '2026-11-27');
    expect(s.totalXp).toBe(70);
    expect(s.level.level).toBe(2);
    expect(s.streak.current).toBe(2);
    expect(s.byCategory.geist.count).toBe(1);
    expect(s.notesWritten).toBe(1);
    expect(daysInactive(s, '2026-11-27')).toBe(1);
    expect(daysInactive(s, '2026-11-29')).toBe(3);
  });

  it('unlocks accessories on milestones', () => {
    expect(unlockedAccessoryIds(computeStats([], '2026-11-27')).size).toBe(0);
    const ids = unlockedAccessoryIds(computeStats([completion('2026-11-27', { difficulty: 'episch', xp: 50 })], '2026-11-27'));
    expect(ids.has('schal')).toBe(true);
    expect(ids.has('laterne')).toBe(true);
    expect(ACCESSORIES.length).toBeGreaterThanOrEqual(10);
  });
});

describe('custom quest recurrence', () => {
  const base: Omit<CustomQuest, 'recurrence'> = { title: 'x', description: '', category: 'geist', difficulty: 'leicht', createdAt: 0 };

  it('daily quests are always due', () => {
    expect(isCustomQuestDue({ ...base, recurrence: { type: 'daily' } }, '2026-11-27', ['2026-11-26'])).toBe(true);
  });

  it('weekly quests are due on chosen weekdays only', () => {
    const q: CustomQuest = { ...base, recurrence: { type: 'weekly', weekdays: [1, 5] } };
    expect(isCustomQuestDue(q, '2026-11-27', [])).toBe(true); // Freitag
    expect(isCustomQuestDue(q, '2026-11-28', [])).toBe(false); // Samstag
    expect(isCustomQuestDue(q, '2026-11-30', [])).toBe(true); // Montag
  });

  it('one-time quests disappear the day after completion', () => {
    const q: CustomQuest = { ...base, recurrence: { type: 'once' } };
    expect(isCustomQuestDue(q, '2026-11-27', [])).toBe(true);
    expect(isCustomQuestDue(q, '2026-11-27', ['2026-11-27'])).toBe(true);
    expect(isCustomQuestDue(q, '2026-11-28', ['2026-11-27'])).toBe(false);
  });
});
