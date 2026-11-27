import type { CustomQuest } from '../types';
import { weekdayOf } from './date';

/**
 * Should a custom quest be shown on `day`?
 *
 * @param completedDays  game days on which this quest was completed
 */
export function isCustomQuestDue(quest: CustomQuest, day: string, completedDays: string[]): boolean {
  switch (quest.recurrence.type) {
    case 'daily':
      return true;
    case 'weekly':
      return quest.recurrence.weekdays.includes(weekdayOf(day));
    case 'once':
      // Visible until done; on the day it was done it stays visible (as done).
      return completedDays.length === 0 || completedDays.includes(day);
  }
}

/** True if a one-time quest is finished for good (shown in the archive). */
export function isOnceQuestFinished(quest: CustomQuest, completedDays: string[]): boolean {
  return quest.recurrence.type === 'once' && completedDays.length > 0;
}

const NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export function describeRecurrence(quest: CustomQuest): string {
  const r = quest.recurrence;
  if (r.type === 'once') return 'Einmalig';
  if (r.type === 'daily') return 'Täglich';
  if (r.weekdays.length === 7) return 'Täglich';
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.filter((d) => r.weekdays.includes(d)).map((d) => NAMES[d]).join(', ');
}
