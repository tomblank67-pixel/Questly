import { describe, expect, it } from 'vitest';
import { addDays, diffDays, getGameDay, weekdayOf, formatDayLong } from './date';

describe('getGameDay (Tageswechsel)', () => {
  it('counts times after the rollover hour as the same calendar day', () => {
    expect(getGameDay(new Date(2026, 10, 27, 5, 0), 5)).toBe('2026-11-27');
    expect(getGameDay(new Date(2026, 10, 27, 23, 59), 5)).toBe('2026-11-27');
  });

  it('counts times before the rollover hour as the previous day', () => {
    expect(getGameDay(new Date(2026, 10, 27, 4, 59), 5)).toBe('2026-11-26');
    expect(getGameDay(new Date(2026, 10, 27, 0, 30), 5)).toBe('2026-11-26');
  });

  it('handles month and year boundaries', () => {
    expect(getGameDay(new Date(2026, 0, 1, 2, 0), 5)).toBe('2025-12-31');
    expect(getGameDay(new Date(2026, 2, 1, 3, 0), 5)).toBe('2026-02-28');
  });

  it('supports a custom rollover hour and midnight', () => {
    expect(getGameDay(new Date(2026, 10, 27, 7, 0), 8)).toBe('2026-11-26');
    expect(getGameDay(new Date(2026, 10, 27, 0, 0), 0)).toBe('2026-11-27');
  });

  it('is not shifted by daylight saving switches', () => {
    // DST in Germany ends on 2026-10-25 and starts on 2026-03-29.
    expect(getGameDay(new Date(2026, 9, 25, 4, 30), 5)).toBe('2026-10-24');
    expect(getGameDay(new Date(2026, 2, 29, 6, 0), 5)).toBe('2026-03-29');
  });
});

describe('day arithmetic', () => {
  it('adds and diffs days across months and leap years', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(diffDays('2026-11-20', '2026-11-27')).toBe(7);
    expect(diffDays('2026-03-28', '2026-03-30')).toBe(2); // across DST
  });

  it('returns weekdays and German labels', () => {
    expect(weekdayOf('2026-11-27')).toBe(5); // Freitag
    expect(formatDayLong('2026-11-27')).toBe('Freitag, 27. November');
  });
});
