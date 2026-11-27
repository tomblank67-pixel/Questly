import { useRef, useState } from 'react';
import type { TodayQuest } from '../state/AppContext';
import { categoryInfo } from '../data/categories';
import { CategoryBadge, DifficultyChip } from './ui';
import { PixelIcon } from './PixelIcon';

interface Props {
  quest: TodayQuest;
  onComplete: (origin: { x: number; y: number }) => void;
  onOpen: () => void;
  onReroll?: () => void;
}

export function QuestCard({ quest, onComplete, onOpen, onReroll }: Props) {
  const btn = useRef<HTMLButtonElement>(null);
  const [rolling, setRolling] = useState(false);
  const done = !!quest.completion;
  const cat = categoryInfo(quest.category);

  const handleComplete = () => {
    const r = btn.current?.getBoundingClientRect();
    onComplete(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 });
  };

  return (
    <div
      className={`pixel-card relative flex items-stretch gap-3 overflow-hidden p-3 transition-all duration-300 ${done ? 'opacity-75' : ''}`}
      style={{ borderColor: done ? `${cat.color}88` : undefined }}
    >
      {/* category colour stripe */}
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: cat.color }} />

      <button className="flex min-w-0 flex-1 items-start gap-3 pl-1 text-left" onClick={onOpen}>
        <CategoryBadge category={quest.category} size={46} />
        <div className="min-w-0 flex-1">
          <div className={`font-pixel text-lg leading-tight ${done ? 'text-parchment-300 line-through decoration-2' : 'text-parchment-100'}`}>
            {quest.title}
          </div>
          <div className="mt-1 line-clamp-2 text-sm leading-snug text-parchment-300">{quest.description}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <DifficultyChip difficulty={quest.difficulty} />
            {quest.completion?.note && <span className="text-xs text-parchment-400">📝 Notiz</span>}
          </div>
        </div>
      </button>

      <div className="flex flex-col items-center justify-between gap-2">
        <button
          ref={btn}
          onClick={done ? onOpen : handleComplete}
          aria-label={done ? 'Erledigt' : 'Als erledigt markieren'}
          className={`grid h-14 w-14 place-items-center rounded-xl border-[3px] shadow-pixel-sm transition-transform active:scale-90 ${
            done ? 'border-moss bg-moss text-night-950' : 'border-ember-400/70 bg-night-900 text-ember-400'
          }`}
        >
          {done ? <PixelIcon name="check" size={26} className="check-pop" /> : <span className="h-5 w-5 rounded-sm border-2 border-dashed border-ember-400/50" />}
        </button>
        {onReroll && !done && (
          <button
            onClick={() => {
              setRolling(true);
              onReroll();
            }}
            className={`grid h-10 w-14 place-items-center rounded-lg bg-night-700 text-parchment-300 ${rolling ? 'shake' : ''}`}
            aria-label="Quest neu würfeln"
            title="Neu würfeln (1× pro Tag)"
          >
            <PixelIcon name="dice" size={18} accent="#ff8c3a" />
          </button>
        )}
      </div>
    </div>
  );
}
