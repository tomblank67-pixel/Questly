/**
 * All reads/writes of app data go through this module, so screens stay simple
 * and the logic can be tested against an in-memory IndexedDB.
 */
import type { Completion, CustomQuest, DailySet, Settings } from '../types';
import { QUEST_POOL, poolQuestById } from '../data/quests';
import { XP_BY_DIFFICULTY } from '../data/categories';
import { drawDailyQuests, pickReroll, recentQuestIds, rngForDay, NO_REPEAT_DAYS } from '../lib/dailyQuests';
import { addDays } from '../lib/date';
import { db as defaultDb, normalizeSettings, type QuestlyDB } from './db';

export class Repo {
  constructor(private db: QuestlyDB = defaultDb) {}

  // ---------- Settings ----------

  async getSettings(): Promise<Settings> {
    const row = await this.db.settings.get('app');
    return normalizeSettings(row?.value);
  }

  async saveSettings(patch: Partial<Settings>): Promise<Settings> {
    const next = normalizeSettings({ ...(await this.getSettings()), ...patch });
    await this.db.settings.put({ key: 'app', value: next });
    return next;
  }

  // ---------- Daily quests ----------

  private async recentIds(day: string) {
    const sets = await this.db.dailySets.where('day').between(addDays(day, -NO_REPEAT_DAYS), day, true, false).toArray();
    return recentQuestIds(day, sets);
  }

  /**
   * Makes sure today's set exists and matches the configured count:
   * - creates a fresh draw on a new day,
   * - tops up if the count was increased,
   * - trims *open* quests if the count was decreased (finished ones stay).
   */
  async ensureDailySet(day: string, settings: Settings): Promise<DailySet> {
    return this.db.transaction('rw', this.db.dailySets, this.db.completions, async () => {
      const existing = await this.db.dailySets.get(day);
      const recent = await this.recentIds(day);
      const base = { enabledCategories: settings.enabledCategories, excludeIds: recent };

      if (!existing) {
        const quests = drawDailyQuests(QUEST_POOL, { ...base, count: settings.dailyCount, rng: rngForDay(day) });
        const set: DailySet = { day, questIds: quests.map((q) => q.id), rerolled: false, createdAt: Date.now() };
        await this.db.dailySets.put(set);
        return set;
      }

      // Drop ids that no longer exist in the pool (defensive, e.g. after an update).
      let ids = existing.questIds.filter((id) => poolQuestById(id));

      if (ids.length < settings.dailyCount) {
        const extra = drawDailyQuests(
          QUEST_POOL.filter((q) => !ids.includes(q.id)),
          { ...base, count: settings.dailyCount - ids.length, rng: rngForDay(day, `topup${ids.length}`) },
        );
        ids = [...ids, ...extra.map((q) => q.id)];
      } else if (ids.length > settings.dailyCount) {
        const done = new Set(
          (await this.db.completions.where('day').equals(day).toArray()).map((c) => c.questKey),
        );
        // Remove open quests from the end until the count fits.
        for (let i = ids.length - 1; i >= 0 && ids.length > settings.dailyCount; i--) {
          if (!done.has(`pool:${ids[i]}`)) ids.splice(i, 1);
        }
      }

      if (ids.join() !== existing.questIds.join()) {
        const updated = { ...existing, questIds: ids };
        await this.db.dailySets.put(updated);
        return updated;
      }
      return existing;
    });
  }

  /** Replaces one quest of today's set. Allowed once per day. */
  async rerollQuest(day: string, questId: string, settings: Settings): Promise<DailySet | null> {
    return this.db.transaction('rw', this.db.dailySets, async () => {
      const set = await this.db.dailySets.get(day);
      if (!set || set.rerolled || !set.questIds.includes(questId)) return null;
      const recent = await this.recentIds(day);
      const next = pickReroll(QUEST_POOL, set.questIds, questId, {
        enabledCategories: settings.enabledCategories,
        excludeIds: recent,
        rng: rngForDay(day, `reroll:${questId}`),
      });
      if (!next) return null;
      const updated: DailySet = { ...set, rerolled: true, questIds: set.questIds.map((id) => (id === questId ? next.id : id)) };
      await this.db.dailySets.put(updated);
      return updated;
    });
  }

  // ---------- Completions ----------

  /** Marks a quest as done for a day. Idempotent: completing twice does nothing. */
  async complete(day: string, questKey: string, quest: Pick<Completion, 'title' | 'category' | 'difficulty'>): Promise<Completion> {
    return this.db.transaction('rw', this.db.completions, async () => {
      const existing = await this.db.completions.where('[day+questKey]').equals([day, questKey]).first();
      if (existing) return existing;
      const c: Completion = {
        day,
        questKey,
        title: quest.title,
        category: quest.category,
        difficulty: quest.difficulty,
        xp: XP_BY_DIFFICULTY[quest.difficulty],
        completedAt: Date.now(),
      };
      c.id = await this.db.completions.add(c);
      return c;
    });
  }

  async undoCompletion(id: number) {
    await this.db.completions.delete(id);
  }

  async setNote(id: number, note: string) {
    await this.db.completions.update(id, { note: note.trim() || undefined });
  }

  // ---------- Custom quests ----------

  async saveCustomQuest(q: CustomQuest): Promise<number> {
    return this.db.customQuests.put(q);
  }

  async deleteCustomQuest(id: number) {
    // Completions keep their snapshot, so the journal is unaffected.
    await this.db.customQuests.delete(id);
  }

  // ---------- Backup ----------

  async exportData(): Promise<BackupFile> {
    return {
      app: 'questly',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: await this.getSettings(),
      dailySets: await this.db.dailySets.toArray(),
      completions: await this.db.completions.toArray(),
      customQuests: await this.db.customQuests.toArray(),
    };
  }

  /** Replaces all local data with the backup (after validation). */
  async importData(raw: unknown): Promise<void> {
    const data = validateBackup(raw);
    await this.db.transaction('rw', [this.db.settings, this.db.dailySets, this.db.completions, this.db.customQuests], async () => {
      await Promise.all([this.db.settings.clear(), this.db.dailySets.clear(), this.db.completions.clear(), this.db.customQuests.clear()]);
      await this.db.settings.put({ key: 'app', value: normalizeSettings(data.settings) });
      await this.db.dailySets.bulkPut(data.dailySets);
      await this.db.completions.bulkPut(data.completions);
      await this.db.customQuests.bulkPut(data.customQuests);
    });
  }

  async resetAll() {
    await Promise.all([this.db.settings.clear(), this.db.dailySets.clear(), this.db.completions.clear(), this.db.customQuests.clear()]);
  }
}

export interface BackupFile {
  app: 'questly';
  version: 1;
  exportedAt: string;
  settings: Settings;
  dailySets: DailySet[];
  completions: Completion[];
  customQuests: CustomQuest[];
}

/** Throws a German error message if the file is not a Questly backup. */
export function validateBackup(raw: unknown): BackupFile {
  const d = raw as Partial<BackupFile> | null;
  if (!d || typeof d !== 'object' || d.app !== 'questly') throw new Error('Das ist keine Questly-Sicherung.');
  if (d.version !== 1) throw new Error('Diese Sicherung stammt aus einer unbekannten Version.');
  if (!Array.isArray(d.completions) || !Array.isArray(d.dailySets) || !Array.isArray(d.customQuests)) {
    throw new Error('Die Sicherung ist unvollständig.');
  }
  for (const c of d.completions) {
    if (typeof c.day !== 'string' || typeof c.questKey !== 'string' || typeof c.xp !== 'number') {
      throw new Error('Die Sicherung enthält fehlerhafte Einträge.');
    }
  }
  return d as BackupFile;
}

export const repo = new Repo();
