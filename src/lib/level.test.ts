import { describe, expect, it } from 'vitest';
import { levelInfo, totalXpForLevel, xpToNext } from './level';

describe('level curve', () => {
  it('gets steeper with every level', () => {
    expect(xpToNext(1)).toBe(50);
    expect(xpToNext(2)).toBe(75);
    expect(xpToNext(10)).toBe(275);
    for (let l = 1; l < 50; l++) expect(xpToNext(l + 1)).toBeGreaterThan(xpToNext(l));
  });

  it('sums up total XP per level', () => {
    expect(totalXpForLevel(1)).toBe(0);
    expect(totalXpForLevel(2)).toBe(50);
    expect(totalXpForLevel(3)).toBe(125);
    expect(totalXpForLevel(10)).toBe(1350);
  });

  it('maps XP to level and progress', () => {
    expect(levelInfo(0)).toEqual({ level: 1, xpInLevel: 0, xpNeeded: 50, progress: 0 });
    expect(levelInfo(49).level).toBe(1);
    expect(levelInfo(50)).toMatchObject({ level: 2, xpInLevel: 0, xpNeeded: 75 });
    expect(levelInfo(100)).toMatchObject({ level: 2, xpInLevel: 50 });
    expect(levelInfo(1350).level).toBe(10);
    expect(levelInfo(-5).level).toBe(1);
  });

  it('is consistent: reaching exactly the threshold always levels up', () => {
    for (let l = 1; l < 40; l++) {
      expect(levelInfo(totalXpForLevel(l)).level).toBe(l);
      expect(levelInfo(totalXpForLevel(l + 1) - 1).level).toBe(l);
    }
  });
});
