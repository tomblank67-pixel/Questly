import { PixelIcon, type PixelIconName } from './PixelIcon';

export type Tab = 'heute' | 'quests' | 'tagebuch' | 'funke';

const TABS: { id: Tab; label: string; icon: PixelIconName }[] = [
  { id: 'heute', label: 'Heute', icon: 'sun' },
  { id: 'quests', label: 'Meine Quests', icon: 'scroll' },
  { id: 'tagebuch', label: 'Tagebuch', icon: 'book' },
  { id: 'funke', label: 'Funke', icon: 'flame' },
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t-2 border-night-600 bg-night-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 pt-2 transition-colors ${
                active ? 'text-ember-400' : 'text-parchment-400'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={`transition-transform ${active ? '-translate-y-0.5 scale-110' : ''}`}>
                <PixelIcon name={t.icon} size={24} accent={active ? '#fff1b8' : 'currentColor'} />
              </span>
              <span className="font-pixel text-[13px] leading-none">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
