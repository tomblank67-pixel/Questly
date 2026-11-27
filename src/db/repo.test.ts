import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { QuestlyDB } from './db';
import { Repo } from './repo';
import { addDays } from '../lib/date';

let repo: Repo;
let n = 0;

beforeEach(() => {
  repo = new Repo(new QuestlyDB(`test-${n++}`));
});

describe('Repo – daily sets', () => {
  it('creates a stable set per day', async () => {
    const s = await repo.getSettings();
    const a = await repo.ensureDailySet('2026-11-27', s);
    const b = await repo.ensureDailySet('2026-11-27', s);
    expect(a.questIds).toHaveLength(3);
    expect(b.questIds).toEqual(a.questIds);
  });

  it('draws a new set on the next day without repeating the last 7 days', async () => {
    const s = await repo.saveSettings({ dailyCount: 5 });
    const seen: string[][] = [];
    let day = '2026-11-01';
    for (let i = 0; i < 10; i++) {
      const set = await repo.ensureDailySet(day, s);
      const recent = seen.slice(-7).flat();
      for (const id of set.questIds) expect(recent).not.toContain(id);
      seen.push(set.questIds);
      day = addDays(day, 1);
    }
  });

  it('tops up and trims when the daily count changes, keeping finished quests', async () => {
    let s = await repo.getSettings();
    const set = await repo.ensureDailySet('2026-11-27', s);
    s = await repo.saveSettings({ dailyCount: 5 });
    const bigger = await repo.ensureDailySet('2026-11-27', s);
    expect(bigger.questIds).toHaveLength(5);
    expect(bigger.questIds.slice(0, 3)).toEqual(set.questIds);

    // finish the last one, then shrink to 3 → the finished one must survive
    const last = bigger.questIds[4];
    await repo.complete('2026-11-27', `pool:${last}`, { title: 't', category: 'geist', difficulty: 'leicht' });
    s = await repo.saveSettings({ dailyCount: 3 });
    const smaller = await repo.ensureDailySet('2026-11-27', s);
    expect(smaller.questIds).toHaveLength(3);
    expect(smaller.questIds).toContain(last);
  });

  it('allows exactly one re-roll per day', async () => {
    const s = await repo.getSettings();
    const set = await repo.ensureDailySet('2026-11-27', s);
    const rolled = await repo.rerollQuest('2026-11-27', set.questIds[0], s);
    expect(rolled).not.toBeNull();
    expect(rolled!.questIds[0]).not.toBe(set.questIds[0]);
    expect(rolled!.rerolled).toBe(true);
    expect(await repo.rerollQuest('2026-11-27', rolled!.questIds[1], s)).toBeNull();
  });
});

describe('Repo – completions & backup', () => {
  it('completes idempotently with the correct XP', async () => {
    const a = await repo.complete('2026-11-27', 'custom:1', { title: 'Lesen', category: 'geist', difficulty: 'episch' });
    const b = await repo.complete('2026-11-27', 'custom:1', { title: 'Lesen', category: 'geist', difficulty: 'episch' });
    expect(a.xp).toBe(50);
    expect(b.id).toBe(a.id);
  });

  it('round-trips an export through import', async () => {
    const c = await repo.complete('2026-11-27', 'pool:k01', { title: 'Spazieren', category: 'koerper', difficulty: 'leicht' });
    await repo.setNote(c.id!, 'Schön war’s');
    await repo.saveCustomQuest({ title: 'Meditieren', description: '', category: 'geist', difficulty: 'leicht', recurrence: { type: 'daily' }, createdAt: 1 });
    const backup = JSON.parse(JSON.stringify(await repo.exportData()));

    const other = new Repo(new QuestlyDB(`test-${n++}`));
    await other.importData(backup);
    const again = await other.exportData();
    expect(again.completions).toEqual(backup.completions);
    expect(again.customQuests).toEqual(backup.customQuests);
    expect(again.completions[0].note).toBe('Schön war’s');
  });

  it('rejects files that are not Questly backups', async () => {
    await expect(repo.importData({ foo: 1 })).rejects.toThrow('keine Questly-Sicherung');
  });
});
