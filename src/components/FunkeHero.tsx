import { Funke } from './Funke';
import { useApp } from '../state/AppContext';
import { stageForLevel } from '../lib/funke';

/** Funke with speech bubble – the top of the Today screen. */
export function FunkeHero() {
  const { stats, funkeMood, funkeJumping, funkeLine, pokeFunke, settings } = useApp();
  const stage = stageForLevel(stats.level.level).stage;

  return (
    <div className="relative flex items-end gap-1">
      <button onClick={pokeFunke} className="-mb-1 -ml-4 shrink-0" aria-label="Funke antippen">
        <Funke stage={stage} mood={funkeMood} jumping={funkeJumping} equipped={settings.equipped} size={168} />
      </button>
      <div key={funkeLine} className="bubble-in relative mb-20 flex-1 rounded-2xl border-2 border-black/20 bg-[#fff4e0] px-4 py-3 text-[15px] font-bold leading-snug text-[#3a2418] shadow-pixel">
        {funkeLine || '…'}
        {/* bubble tail, pixel-style */}
        <span className="absolute -left-[10px] bottom-4 h-3 w-3 bg-[#fff4e0]" />
        <span className="absolute -left-[16px] bottom-2 h-2 w-2 bg-[#fff4e0]" />
      </div>
    </div>
  );
}
