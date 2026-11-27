import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS, normalizeSettings } from '../db/db';
import { repo } from '../db/repo';
import { useGameDay } from '../hooks/useGameDay';
import { computeStats, daysInactive, type PlayerStats } from '../lib/stats';
import { baseMood, stageForLevel, type FunkeMood, type StageInfo } from '../lib/funke';
import { isCustomQuestDue } from '../lib/recurrence';
import { dayTimeOf } from '../lib/date';
import { pick } from '../lib/random';
import { poolQuestById } from '../data/quests';
import { ACCESSORIES, unlockedAccessoryIds, type Accessory } from '../data/accessories';
import * as S from '../data/sayings';
import { celebrateAt } from '../lib/celebrate';
import { haptic } from '../lib/haptics';
import { categoryInfo } from '../data/categories';
import type { Completion, CustomQuest, DailySet, PoolQuest, Settings } from '../types';

/** A quest as shown on the Today screen – pool or custom, with its status. */
export interface TodayQuest {
  key: string; // "pool:k01" | "custom:3"
  source: 'pool' | 'custom';
  title: string;
  description: string;
  category: PoolQuest['category'];
  difficulty: PoolQuest['difficulty'];
  completion?: Completion;
  poolId?: string;
}

export interface LevelUpEvent {
  level: number;
  newStage?: StageInfo;
}

interface AppState {
  ready: boolean;
  today: string;
  settings: Settings;
  completions: Completion[];
  customQuests: CustomQuest[];
  dailySet?: DailySet;
  stats: PlayerStats;
  dailyQuests: TodayQuest[];
  customToday: TodayQuest[];
  funkeMood: FunkeMood;
  funkeJumping: boolean;
  funkeLine: string;
  levelUp: LevelUpEvent | null;
  toast: { message: string; accessory?: Accessory } | null;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  completeQuest: (q: TodayQuest, origin?: { x: number; y: number }) => Promise<void>;
  undoQuest: (q: TodayQuest) => Promise<void>;
  reroll: (poolId: string) => Promise<boolean>;
  pokeFunke: () => void;
  dismissLevelUp: () => void;
  showToast: (message: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
};

export function AppProvider({ children }: { children: ReactNode }) {
  // ---- live data from IndexedDB ----
  const settingsRow = useLiveQuery(() => db.settings.get('app'), [], null);
  const settings = useMemo(() => normalizeSettings(settingsRow?.value ?? DEFAULT_SETTINGS), [settingsRow]);
  const today = useGameDay(settings.rolloverHour);
  const completions = useLiveQuery(() => db.completions.orderBy('completedAt').toArray(), [], undefined);
  const customQuests = useLiveQuery(() => db.customQuests.orderBy('createdAt').toArray(), [], undefined);
  const dailySet = useLiveQuery(() => db.dailySets.get(today), [today]);

  // Create / adjust today's draw whenever the day or relevant settings change.
  const settingsKey = `${settings.dailyCount}|${settings.enabledCategories.join(',')}`;
  useEffect(() => {
    if (settingsRow === null) return; // still loading
    repo.ensureDailySet(today, settings).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, settingsKey, settingsRow === null]);

  // Theme on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('light', settings.theme === 'light');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'light' ? '#faf0de' : '#1a1220');
  }, [settings.theme]);

  // Ask the browser to keep our data (reduces the chance of eviction).
  useEffect(() => {
    navigator.storage?.persist?.().catch(() => undefined);
  }, []);

  const list = completions ?? [];
  const stats = useMemo(() => computeStats(list, today), [list, today]);

  const todayDone = useMemo(() => {
    const m = new Map<string, Completion>();
    for (const c of list) if (c.day === today) m.set(c.questKey, c);
    return m;
  }, [list, today]);

  const dailyQuests: TodayQuest[] = useMemo(
    () =>
      (dailySet?.questIds ?? [])
        .map((id) => poolQuestById(id))
        .filter((q): q is PoolQuest => !!q)
        .map((q) => ({
          key: `pool:${q.id}`,
          source: 'pool' as const,
          poolId: q.id,
          title: q.title,
          description: q.description,
          category: q.category,
          difficulty: q.difficulty,
          completion: todayDone.get(`pool:${q.id}`),
        })),
    [dailySet, todayDone],
  );

  const customToday: TodayQuest[] = useMemo(() => {
    const daysByKey = new Map<string, string[]>();
    for (const c of list) {
      if (!c.questKey.startsWith('custom:')) continue;
      if (!daysByKey.has(c.questKey)) daysByKey.set(c.questKey, []);
      daysByKey.get(c.questKey)!.push(c.day);
    }
    return (customQuests ?? [])
      .filter((q) => isCustomQuestDue(q, today, daysByKey.get(`custom:${q.id}`) ?? []))
      .map((q) => ({
        key: `custom:${q.id}`,
        source: 'custom' as const,
        title: q.title,
        description: q.description,
        category: q.category,
        difficulty: q.difficulty,
        completion: todayDone.get(`custom:${q.id}`),
      }));
  }, [customQuests, list, today, todayDone]);

  // ---- Funke ----
  const dailyDoneCount = dailyQuests.filter((q) => q.completion).length;
  const funkeMood = baseMood({
    daysInactive: daysInactive(stats, today),
    doneToday: todayDone.size,
    dailyTotal: dailyQuests.length,
  });

  const [funkeJumping, setJumping] = useState(false);
  const [funkeLine, setFunkeLine] = useState('');
  const jumpTimer = useRef<number>();

  const jump = useCallback(() => {
    setJumping(false);
    window.clearTimeout(jumpTimer.current);
    // restart the CSS animation on the next frame
    requestAnimationFrame(() => {
      setJumping(true);
      jumpTimer.current = window.setTimeout(() => setJumping(false), 950);
    });
  }, []);

  const ready = completions !== undefined && customQuests !== undefined && settingsRow !== null;

  // Greeting when the app is ready, on a new day, or when Funke falls asleep / wakes up
  // (e.g. after importing a backup).
  const greetedFor = useRef('');
  useEffect(() => {
    const key = funkeMood === 'sleepy' ? `${today}|sleepy` : today;
    // Waking up (sleepy → happy) must not overwrite Funke's praise.
    if (!ready || greetedFor.current === key || (key === today && greetedFor.current.startsWith(today))) return;
    greetedFor.current = key;
    if (funkeMood === 'sleepy') setFunkeLine(pick(S.SLEEPY));
    else if (stats.streak.current >= 3 && Math.random() < 0.4) setFunkeLine(pick(S.STREAK).replace('{n}', String(stats.streak.current)));
    else if (funkeMood === 'proud') setFunkeLine(pick(S.ALL_DONE));
    else setFunkeLine(pick(S.GREETINGS[dayTimeOf(new Date())]));
  }, [ready, today, funkeMood, stats.streak]);

  const pokeFunke = useCallback(() => {
    haptic();
    jump();
    setFunkeLine((prev) => {
      let next = prev;
      const pool = Math.random() < 0.6 ? S.TAP : S.MOTIVATION;
      while (next === prev) next = pick(pool);
      return next;
    });
  }, [jump]);

  // ---- level-ups and unlocks ----
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(null);
  const [toast, setToast] = useState<AppState['toast']>(null);
  const toastTimer = useRef<number>();
  const showToastObj = useCallback((t: NonNullable<AppState['toast']>) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);
  const showToast = useCallback((message: string) => showToastObj({ message }), [showToastObj]);

  const completeQuest = useCallback(
    async (q: TodayQuest, origin?: { x: number; y: number }) => {
      if (q.completion) return;
      const before = stats;
      const c = await repo.complete(today, q.key, q);

      // Feedback first – it should feel instant.
      haptic('success');
      if (origin) celebrateAt(origin.x, origin.y, c.xp, categoryInfo(q.category).color);
      jump();

      const after = computeStats([...list, c], today);
      const allDailyDone = q.source === 'pool' && dailyDoneCount + 1 >= dailyQuests.length;
      setFunkeLine(pick(allDailyDone ? S.ALL_DONE : S.PRAISE));

      if (after.level.level > before.level.level) {
        const oldStage = stageForLevel(before.level.level);
        const newStage = stageForLevel(after.level.level);
        window.setTimeout(() => {
          setLevelUp({ level: after.level.level, newStage: newStage.stage !== oldStage.stage ? newStage : undefined });
          setFunkeLine(pick(S.LEVEL_UP));
        }, 900);
      }

      const beforeIds = unlockedAccessoryIds(before);
      const fresh = ACCESSORIES.filter((a) => a.isUnlocked(after) && !beforeIds.has(a.id));
      if (fresh.length) {
        window.setTimeout(() => showToastObj({ message: `Neu freigeschaltet: ${fresh.map((a) => a.name).join(', ')}!`, accessory: fresh[0] }), 1200);
      }
    },
    [stats, today, list, jump, dailyDoneCount, dailyQuests.length, showToastObj],
  );

  const undoQuest = useCallback(async (q: TodayQuest) => {
    if (q.completion?.id != null) await repo.undoCompletion(q.completion.id);
  }, []);

  const reroll = useCallback(
    async (poolId: string) => {
      const res = await repo.rerollQuest(today, poolId, settings);
      if (res) haptic();
      return !!res;
    },
    [today, settings],
  );

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    await repo.saveSettings(patch);
  }, []);

  const value: AppState = {
    ready,
    today,
    settings,
    completions: list,
    customQuests: customQuests ?? [],
    dailySet,
    stats,
    dailyQuests,
    customToday,
    funkeMood,
    funkeJumping,
    funkeLine,
    levelUp,
    toast,
    updateSettings,
    completeQuest,
    undoQuest,
    reroll,
    pokeFunke,
    dismissLevelUp: () => setLevelUp(null),
    showToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
