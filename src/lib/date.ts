/**
 * Date helpers built around the "game day".
 *
 * A game day starts at a configurable hour (default 05:00). Anything before
 * that hour still belongs to the previous day – so finishing a quest at
 * 01:30 at night counts for "yesterday".
 *
 * Game days are plain strings "YYYY-MM-DD". Arithmetic on them is done in UTC
 * so daylight-saving switches can never shift a day.
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a local calendar date as YYYY-MM-DD. */
export function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Returns the game day for a moment in time. */
export function getGameDay(now: Date, rolloverHour: number): string {
  if (now.getHours() < rolloverHour) {
    // Before the rollover → still the previous calendar day.
    // Constructing via (y, m, d-1) is DST-safe, unlike subtracting 24h.
    return formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  }
  return formatLocalDate(now);
}

function parseDay(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

const DAY_MS = 86_400_000;

/** Adds (or subtracts) whole days to a game day string. */
export function addDays(day: string, n: number): string {
  const d = new Date(parseDay(day) + n * DAY_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Number of days from a to b (b − a). */
export function diffDays(a: string, b: string): number {
  return Math.round((parseDay(b) - parseDay(a)) / DAY_MS);
}

/** Weekday of a game day, 0 = Sonntag … 6 = Samstag. */
export function weekdayOf(day: string): number {
  return new Date(parseDay(day)).getUTCDay();
}

export const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
/** Display order Monday-first, as usual in Germany. */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WEEKDAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

/** "Freitag, 27. November" */
export function formatDayLong(day: string): string {
  const d = new Date(parseDay(day));
  return `${WEEKDAYS_LONG[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
}

/** Human friendly label relative to today: "Heute", "Gestern" or the long date. */
export function formatDayRelative(day: string, today: string): string {
  const diff = diffDays(day, today);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  return formatDayLong(day);
}

export type DayTime = 'morgen' | 'mittag' | 'abend' | 'nacht';

/** Rough part of the day, used for Funke's greetings. */
export function dayTimeOf(now: Date): DayTime {
  const h = now.getHours();
  if (h >= 5 && h < 11) return 'morgen';
  if (h >= 11 && h < 17) return 'mittag';
  if (h >= 17 && h < 22) return 'abend';
  return 'nacht';
}
