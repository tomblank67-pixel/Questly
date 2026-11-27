import { useState } from 'react';
import { useApp, type TodayQuest } from '../state/AppContext';
import { FunkeHero } from '../components/FunkeHero';
import { QuestCard } from '../components/QuestCard';
import { QuestDetailSheet } from '../components/QuestDetailSheet';
import { ProgressBar, SectionTitle } from '../components/ui';
import { formatDayLong } from '../lib/date';

export function TodayScreen({ onCreateQuest }: { onCreateQuest: () => void }) {
  const { today, stats, dailyQuests, customToday, dailySet, completeQuest, reroll } = useApp();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const canReroll = !!dailySet && !dailySet.rerolled;
  const all = [...dailyQuests, ...customToday];
  const open = all.find((q) => q.key === openKey) ?? null;

  const doneDaily = dailyQuests.filter((q) => q.completion).length;
  const allDailyDone = dailyQuests.length > 0 && doneDaily === dailyQuests.length;
  const xpToday = all.reduce((s, q) => s + (q.completion?.xp ?? 0), 0);

  const card = (q: TodayQuest) => (
    <QuestCard
      key={q.key}
      quest={q}
      onOpen={() => setOpenKey(q.key)}
      onComplete={(o) => void completeQuest(q, o)}
      onReroll={q.poolId && canReroll ? () => void reroll(q.poolId!) : undefined}
    />
  );

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-parchment-400">{formatDayLong(today)}</div>
          <h1 className="font-pixel text-3xl text-ember-300">Questly</h1>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border-2 border-night-600 bg-night-800 px-3 py-1.5 text-center" title="Serie">
            <div className="font-pixel text-xl leading-none">🔥 {stats.streak.current}</div>
            <div className="text-[10px] font-bold uppercase text-parchment-400">{stats.streak.current === 1 ? 'Tag' : 'Tage'}</div>
          </div>
          <div className="rounded-xl border-2 border-night-600 bg-night-800 px-3 py-1.5 text-center">
            <div className="font-pixel text-xl leading-none text-ember-300">Lv {stats.level.level}</div>
            <div className="text-[10px] font-bold uppercase text-parchment-400">{stats.totalXp} XP</div>
          </div>
        </div>
      </header>

      <div className="mt-2">
        <FunkeHero />
        <div className="mt-1 flex items-center gap-3">
          <ProgressBar value={stats.level.progress} className="flex-1" />
          <span className="whitespace-nowrap text-xs font-bold text-parchment-400">
            {stats.level.xpInLevel}/{stats.level.xpNeeded} XP
          </span>
        </div>
      </div>

      <SectionTitle
        right={
          <span className="text-sm font-bold text-parchment-400">
            {doneDaily}/{dailyQuests.length} {xpToday > 0 && <span className="text-ember-300">· +{xpToday} XP heute</span>}
          </span>
        }
      >
        Tagesquests
      </SectionTitle>

      {allDailyDone && (
        <div className="pop-in mb-3 rounded-xl border-2 border-moss/60 bg-moss/15 px-4 py-3 text-center font-bold text-moss">
          🏆 Alle Tagesquests geschafft! Morgen warten neue Abenteuer.
        </div>
      )}

      <div className="flex flex-col gap-3">{dailyQuests.map(card)}</div>
      {canReroll && !allDailyDone && (
        <p className="mt-2 text-center text-xs text-parchment-400">🎲 Du kannst heute eine Quest neu würfeln.</p>
      )}

      <SectionTitle
        right={
          <button onClick={onCreateQuest} className="min-h-[44px] px-2 text-sm font-bold text-ember-400">
            + Neue Quest
          </button>
        }
      >
        Deine Quests
      </SectionTitle>
      {customToday.length ? (
        <div className="flex flex-col gap-3">{customToday.map(card)}</div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-night-600 px-4 py-5 text-center text-sm text-parchment-400">
          Heute stehen keine eigenen Quests an. Leg dir unter „Meine Quests“ eigene Rituale an – z. B. „Tagebuch schreiben“ jeden Abend.
        </div>
      )}

      <QuestDetailSheet quest={open} onClose={() => setOpenKey(null)} canReroll={canReroll} />
    </div>
  );
}
