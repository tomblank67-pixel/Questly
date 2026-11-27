import { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { CategoryBadge, CategoryPicker, Label, Segmented, SectionTitle, Sheet, DifficultyChip } from '../components/ui';
import { describeRecurrence, isOnceQuestFinished } from '../lib/recurrence';
import { WEEKDAYS_SHORT, WEEKDAY_ORDER } from '../lib/date';
import { repo } from '../db/repo';
import type { CustomQuest, Difficulty, Recurrence } from '../types';
import { XP_BY_DIFFICULTY } from '../data/categories';
import { PixelIcon } from '../components/PixelIcon';

type Draft = Omit<CustomQuest, 'createdAt'> & { createdAt?: number };

const EMPTY: Draft = { title: '', description: '', category: 'geist', difficulty: 'leicht', recurrence: { type: 'once' } };

export function MyQuestsScreen({ creating, onCreatingChange }: { creating: boolean; onCreatingChange: (v: boolean) => void }) {
  const { customQuests, completions, today } = useApp();
  const [editing, setEditing] = useState<Draft | null>(null);

  const daysByQuest = useMemo(() => {
    const m = new Map<number, string[]>();
    for (const c of completions) {
      if (!c.questKey.startsWith('custom:')) continue;
      const id = Number(c.questKey.slice(7));
      m.set(id, [...(m.get(id) ?? []), c.day]);
    }
    return m;
  }, [completions]);

  const active = customQuests.filter((q) => !isOnceQuestFinished(q, daysByQuest.get(q.id!) ?? []));
  const finished = customQuests.filter((q) => isOnceQuestFinished(q, daysByQuest.get(q.id!) ?? []));

  const draft = creating ? EMPTY : editing;
  const close = () => {
    setEditing(null);
    onCreatingChange(false);
  };

  const row = (q: CustomQuest, dim = false) => {
    const count = daysByQuest.get(q.id!)?.length ?? 0;
    const doneToday = daysByQuest.get(q.id!)?.includes(today);
    return (
      <button key={q.id} onClick={() => setEditing(q)} className={`pixel-card flex w-full items-center gap-3 p-3 text-left ${dim ? 'opacity-60' : ''}`}>
        <CategoryBadge category={q.category} size={44} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-pixel text-lg">{q.title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-bold text-parchment-400">
            <span>🔁 {describeRecurrence(q)}</span>
            <span>· {XP_BY_DIFFICULTY[q.difficulty]} XP</span>
            {count > 0 && <span>· {count}× erledigt</span>}
            {doneToday && <span className="text-moss">· heute ✔</span>}
          </div>
        </div>
        <PixelIcon name="pen" size={16} className="text-parchment-400" />
      </button>
    );
  };

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="font-pixel text-3xl text-ember-300">Meine Quests</h1>
        <button className="pixel-btn-primary h-12 w-12 !px-0" onClick={() => onCreatingChange(true)} aria-label="Neue Quest">
          <PixelIcon name="plus" size={20} />
        </button>
      </header>
      <p className="mt-1 text-sm text-parchment-300">Eigene Quests erscheinen zusätzlich zu deinen Tagesquests – einmalig oder als wiederkehrendes Ritual.</p>

      {customQuests.length === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-night-600 p-6 text-center">
          <div className="text-4xl">📜</div>
          <div className="mt-2 font-pixel text-xl">Noch keine eigenen Quests</div>
          <p className="mt-1 text-sm text-parchment-400">Wie wär’s mit „10 Seiten lesen“ jeden Abend oder „Oma anrufen“ am Sonntag?</p>
          <button className="pixel-btn-primary mt-4" onClick={() => onCreatingChange(true)}>
            + Erste Quest erstellen
          </button>
        </div>
      )}

      {active.length > 0 && (
        <>
          <SectionTitle>Aktiv</SectionTitle>
          <div className="flex flex-col gap-3">{active.map((q) => row(q))}</div>
        </>
      )}
      {finished.length > 0 && (
        <>
          <SectionTitle>Abgeschlossen</SectionTitle>
          <div className="flex flex-col gap-3">{finished.map((q) => row(q, true))}</div>
        </>
      )}

      {draft && <QuestEditor key={draft.id ?? 'new'} initial={draft} onClose={close} />}
    </div>
  );
}

function QuestEditor({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const { showToast } = useApp();
  const [d, setD] = useState<Draft>(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isNew = initial.id == null;
  const weekdays = d.recurrence.type === 'weekly' ? d.recurrence.weekdays : [];
  const valid = d.title.trim().length > 0 && (d.recurrence.type !== 'weekly' || weekdays.length > 0);

  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }));
  const setRecurrence = (type: Recurrence['type']) =>
    set({ recurrence: type === 'weekly' ? { type, weekdays: weekdays.length ? weekdays : [1, 3, 5] } : { type } });
  const toggleDay = (wd: number) =>
    set({ recurrence: { type: 'weekly', weekdays: weekdays.includes(wd) ? weekdays.filter((x) => x !== wd) : [...weekdays, wd] } });

  const save = async () => {
    if (!valid) return;
    await repo.saveCustomQuest({ ...d, title: d.title.trim(), description: d.description.trim(), createdAt: d.createdAt ?? Date.now() });
    showToast(isNew ? 'Quest erstellt! 📜' : 'Quest gespeichert');
    onClose();
  };

  const remove = async () => {
    if (!confirmDelete) return setConfirmDelete(true);
    await repo.deleteCustomQuest(d.id!);
    showToast('Quest gelöscht');
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={isNew ? 'Neue Quest' : 'Quest bearbeiten'}>
      <Label>Titel</Label>
      <input className="field" value={d.title} maxLength={60} placeholder="z. B. 10 Seiten lesen" onChange={(e) => set({ title: e.target.value })} />

      <Label>Beschreibung (optional)</Label>
      <textarea className="field min-h-[72px] resize-none" maxLength={200} value={d.description} placeholder="Was genau ist zu tun?" onChange={(e) => set({ description: e.target.value })} />

      <Label>Kategorie</Label>
      <CategoryPicker value={d.category} onChange={(category) => set({ category })} />

      <Label>Schwierigkeit</Label>
      <Segmented<Difficulty>
        value={d.difficulty}
        onChange={(difficulty) => set({ difficulty })}
        options={[
          { value: 'leicht', label: <span>Leicht<br /><small className="opacity-70">10 XP</small></span> },
          { value: 'mittel', label: <span>Mittel<br /><small className="opacity-70">25 XP</small></span> },
          { value: 'episch', label: <span>Episch<br /><small className="opacity-70">50 XP</small></span> },
        ]}
      />
      <div className="mt-2"><DifficultyChip difficulty={d.difficulty} /></div>

      <Label>Wiederholung</Label>
      <Segmented<Recurrence['type']>
        value={d.recurrence.type}
        onChange={setRecurrence}
        options={[
          { value: 'once', label: 'Einmalig' },
          { value: 'daily', label: 'Täglich' },
          { value: 'weekly', label: 'Wochentage' },
        ]}
      />
      {d.recurrence.type === 'weekly' && (
        <div className="mt-3 flex justify-between gap-1">
          {WEEKDAY_ORDER.map((wd) => (
            <button
              key={wd}
              type="button"
              onClick={() => toggleDay(wd)}
              className={`h-11 flex-1 rounded-lg border-2 font-bold ${
                weekdays.includes(wd) ? 'border-ember-400 bg-ember-500/25 text-ember-300' : 'border-night-600 bg-night-900 text-parchment-400'
              }`}
            >
              {WEEKDAYS_SHORT[wd]}
            </button>
          ))}
        </div>
      )}

      <button className="pixel-btn-primary mt-7 w-full" disabled={!valid} onClick={save}>
        {isNew ? 'Quest erstellen' : 'Speichern'}
      </button>
      {!isNew && (
        <button className={`pixel-btn mt-3 w-full ${confirmDelete ? 'bg-red-600 text-white' : 'bg-night-700 text-red-300'}`} onClick={remove}>
          {confirmDelete ? 'Wirklich löschen? Nochmal tippen' : 'Quest löschen'}
        </button>
      )}
      {!isNew && <p className="mt-2 text-center text-xs text-parchment-400">Erledigte Einträge bleiben im Tagebuch erhalten.</p>}
    </Sheet>
  );
}
