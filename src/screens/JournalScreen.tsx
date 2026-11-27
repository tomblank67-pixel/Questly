import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { CATEGORIES, categoryInfo } from '../data/categories';
import { addDays, formatDayRelative, WEEKDAY_ORDER, weekdayOf, WEEKDAYS_SHORT } from '../lib/date';
import { SectionTitle, Sheet } from '../components/ui';
import { repo } from '../db/repo';
import type { CategoryId, Completion } from '../types';

const WEEKS = 12;

export function JournalScreen() {
  const { completions, stats, today, showToast } = useApp();
  const [filter, setFilter] = useState<CategoryId | null>(null);
  const [editing, setEditing] = useState<Completion | null>(null);
  const [note, setNote] = useState('');

  const byDay = useMemo(() => {
    const list = completions.filter((c) => !filter || c.category === filter).slice().sort((a, b) => b.completedAt - a.completedAt);
    const groups = new Map<string, Completion[]>();
    for (const c of list) groups.set(c.day, [...(groups.get(c.day) ?? []), c]);
    return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [completions, filter]);

  // Heatmap: last WEEKS weeks, Monday-first columns.
  const heat = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of completions) counts.set(c.day, (counts.get(c.day) ?? 0) + 1);
    const offset = WEEKDAY_ORDER.indexOf(weekdayOf(today)); // 0 = Monday
    const start = addDays(today, -offset - (WEEKS - 1) * 7);
    return Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const day = addDays(start, w * 7 + d);
        return { day, n: day > today ? -1 : counts.get(day) ?? 0 };
      }),
    );
  }, [completions, today]);

  const maxCat = Math.max(1, ...CATEGORIES.map((c) => stats.byCategory[c.id].count));

  return (
    <div>
      <h1 className="font-pixel text-3xl text-ember-300">Abenteuer-Tagebuch</h1>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          ['⭐', stats.totalXp, 'XP gesamt'],
          ['📜', stats.totalCompleted, 'Quests erledigt'],
          ['🔥', stats.streak.current, 'Aktuelle Serie'],
          ['🏅', stats.streak.longest, 'Längste Serie'],
        ].map(([icon, value, label]) => (
          <div key={label as string} className="pixel-card p-3">
            <div className="font-pixel text-2xl">
              {icon} {value}
            </div>
            <div className="text-xs font-bold uppercase text-parchment-400">{label}</div>
          </div>
        ))}
      </div>

      <SectionTitle>Die letzten {WEEKS} Wochen</SectionTitle>
      <div className="pixel-card flex gap-2 p-3">
        <div className="flex flex-col justify-between py-0.5 text-[10px] font-bold text-parchment-400">
          {WEEKDAY_ORDER.map((d, i) => (
            <span key={d} className="h-[18px] leading-[18px]">{i % 2 === 0 ? WEEKDAYS_SHORT[d] : ''}</span>
          ))}
        </div>
        <div className="flex flex-1 justify-between">
          {heat.map((week, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {week.map(({ day, n }) => (
                <div
                  key={day}
                  title={`${day}: ${Math.max(0, n)}`}
                  className={`h-[18px] w-[18px] rounded-[3px] ${day === today ? 'ring-2 ring-parchment-100' : ''}`}
                  style={{
                    background:
                      n < 0 ? 'transparent' : n === 0 ? 'rgb(var(--night-950))' : ['#7a3a1e', '#c4541f', '#ff8c3a', '#ffd23f'][Math.min(3, n - 1)],
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>Kategorien</SectionTitle>
      <div className="pixel-card flex flex-col gap-3 p-4">
        {CATEGORIES.map((c) => {
          const s = stats.byCategory[c.id];
          return (
            <div key={c.id}>
              <div className="mb-1 flex justify-between text-sm font-bold">
                <span>
                  {c.emoji} {c.name}
                </span>
                <span className="text-parchment-400">
                  {s.count}× · {s.xp} XP
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded bg-night-950">
                <div className="h-full rounded transition-[width] duration-700" style={{ width: `${(s.count / maxCat) * 100}%`, background: c.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle>Einträge</SectionTitle>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip active={!filter} onClick={() => setFilter(null)}>Alle</FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c.id} active={filter === c.id} color={c.color} onClick={() => setFilter(filter === c.id ? null : c.id)}>
            {c.emoji} {c.name}
          </FilterChip>
        ))}
      </div>

      {byDay.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-night-600 p-6 text-center text-parchment-400">
          Dein Tagebuch ist noch leer. Jede erledigte Quest wird hier verewigt! ✨
        </div>
      )}

      <div className="flex flex-col gap-5">
        {byDay.map(([day, items]) => (
          <div key={day}>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="font-pixel text-lg text-parchment-200">{formatDayRelative(day, today)}</div>
              <div className="text-xs font-bold text-ember-300">+{items.reduce((s, c) => s + c.xp, 0)} XP</div>
            </div>
            <div className="flex flex-col gap-2 border-l-2 border-dashed border-night-600 pl-3">
              {items.map((c) => {
                const cat = categoryInfo(c.category);
                return (
                  <button
                    key={c.id}
                    className="pixel-card w-full p-3 text-left"
                    onClick={() => {
                      setEditing(c);
                      setNote(c.note ?? '');
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="flex-1 font-bold">{c.title}</span>
                      <span className="text-xs font-bold text-parchment-400">
                        {new Date(c.completedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} · +{c.xp}
                      </span>
                    </div>
                    {c.note ? (
                      <p className="mt-2 rounded-lg bg-night-900 px-3 py-2 text-sm italic text-parchment-200">„{c.note}“</p>
                    ) : (
                      <p className="mt-1 text-xs text-parchment-400">+ Notiz hinzufügen</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Notiz">
        {editing && (
          <>
            <div className="font-pixel text-xl">{editing.title}</div>
            <div className="mb-3 text-sm text-parchment-400">{formatDayRelative(editing.day, today)}</div>
            <textarea className="field min-h-[110px] resize-none" maxLength={280} value={note} placeholder="Wie war’s?" onChange={(e) => setNote(e.target.value)} />
            <button
              className="pixel-btn-primary mt-4 w-full"
              onClick={async () => {
                await repo.setNote(editing.id!, note);
                showToast('Notiz gespeichert ✍️');
                setEditing(null);
              }}
            >
              Speichern
            </button>
          </>
        )}
      </Sheet>
    </div>
  );
}

function FilterChip({ active, color, onClick, children }: { active: boolean; color?: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-full border-2 px-3 text-sm font-bold ${active ? '' : 'border-night-600 text-parchment-300'}`}
      style={active ? { borderColor: color ?? '#ffb454', color: color ?? '#ffb454', background: `${color ?? '#ffb454'}22` } : undefined}
    >
      {children}
    </button>
  );
}
