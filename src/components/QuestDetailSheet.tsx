import { useEffect, useState } from 'react';
import { Sheet, CategoryBadge, DifficultyChip } from './ui';
import { useApp, type TodayQuest } from '../state/AppContext';
import { categoryInfo } from '../data/categories';
import { repo } from '../db/repo';

interface Props {
  quest: TodayQuest | null;
  onClose: () => void;
  canReroll: boolean;
}

/** Details of a quest: complete, re-roll, undo and write a short note. */
export function QuestDetailSheet({ quest, onClose, canReroll }: Props) {
  const { completeQuest, undoQuest, reroll, showToast } = useApp();
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(quest?.completion?.note ?? '');
  }, [quest?.completion?.id, quest?.completion?.note]);

  if (!quest) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const cat = categoryInfo(quest.category);
  const done = quest.completion;

  const saveNote = async () => {
    if (done?.id == null) return;
    await repo.setNote(done.id, note);
    showToast('Notiz gespeichert ✍️');
  };

  return (
    <Sheet open onClose={onClose} title={done ? 'Erledigt! 🎉' : 'Quest'}>
      <div className="flex items-start gap-3">
        <CategoryBadge category={quest.category} size={56} />
        <div>
          <div className="font-pixel text-2xl leading-tight">{quest.title}</div>
          <div className="mt-1 text-sm font-bold" style={{ color: cat.color }}>
            {cat.name} {quest.source === 'custom' && '· Eigene Quest'}
          </div>
        </div>
      </div>
      {quest.description && <p className="mt-4 text-base leading-relaxed text-parchment-200">{quest.description}</p>}
      <div className="mt-3">
        <DifficultyChip difficulty={quest.difficulty} />
      </div>

      {!done ? (
        <div className="mt-6 flex flex-col gap-3">
          <button
            className="pixel-btn-primary w-full text-xl"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              void completeQuest(quest, { x: r.left + r.width / 2, y: r.top });
              onClose();
            }}
          >
            ✔ Erledigt!
          </button>
          {quest.poolId && canReroll && (
            <button
              className="pixel-btn-ghost w-full"
              onClick={async () => {
                if (await reroll(quest.poolId!)) onClose();
              }}
            >
              🎲 Neu würfeln (1× heute)
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-parchment-400" htmlFor="note">
            Notiz fürs Tagebuch (optional)
          </label>
          <textarea
            id="note"
            className="field min-h-[96px] resize-none"
            maxLength={280}
            placeholder="Wie war’s? Was hast du erlebt?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="mt-1 text-right text-xs text-parchment-400">{note.length}/280</div>
          <div className="mt-2 flex gap-3">
            <button className="pixel-btn-ghost flex-1" onClick={async () => { await undoQuest(quest); onClose(); }}>
              ↩ Rückgängig
            </button>
            <button className="pixel-btn-primary flex-1" onClick={async () => { await saveNote(); onClose(); }}>
              Speichern
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
