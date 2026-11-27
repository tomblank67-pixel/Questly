import { describe, expect, it } from 'vitest';
import { computeStreak, longestStreak } from './streak';

describe('computeStreak', () => {
  it('is 0 without any activity', () => {
    expect(computeStreak([], '2026-11-27')).toEqual({ current: 0, longest: 0, doneToday: false });
  });

  it('counts consecutive days including today', () => {
    const s = computeStreak(['2026-11-25', '2026-11-26', '2026-11-27'], '2026-11-27');
    expect(s.current).toBe(3);
    expect(s.doneToday).toBe(true);
  });

  it('keeps the streak alive while today is still open', () => {
    const s = computeStreak(['2026-11-25', '2026-11-26'], '2026-11-27');
    expect(s.current).toBe(2);
    expect(s.doneToday).toBe(false);
  });

  it('resets after a full missed day', () => {
    expect(computeStreak(['2026-11-24', '2026-11-25'], '2026-11-27').current).toBe(0);
  });

  it('stops at gaps and tracks the longest streak', () => {
    const days = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-26', '2026-11-27'];
    const s = computeStreak(days, '2026-11-27');
    expect(s.current).toBe(2);
    expect(s.longest).toBe(4);
  });

  it('handles month boundaries and duplicates', () => {
    expect(computeStreak(['2026-11-30', '2026-12-01', '2026-12-01'], '2026-12-01').current).toBe(2);
    expect(longestStreak(['2026-12-31', '2027-01-01', '2027-01-02'])).toBe(3);
  });
});
