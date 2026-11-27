import { useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { TabBar, type Tab } from './components/TabBar';
import { TodayScreen } from './screens/TodayScreen';
import { MyQuestsScreen } from './screens/MyQuestsScreen';
import { JournalScreen } from './screens/JournalScreen';
import { FunkeScreen } from './screens/FunkeScreen';
import { LevelUpModal } from './components/LevelUpModal';
import { Toast } from './components/ui';
import { AccessoryIcon, Funke } from './components/Funke';

function Shell() {
  const { ready, toast } = useApp();
  const [tab, setTab] = useState<Tab>('heute');
  const [creating, setCreating] = useState(false);
  const scroller = useRef<HTMLElement>(null);

  // Each tab starts at the top.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [tab]);

  if (!ready) {
    return (
      <div className="grid h-full place-items-center">
        <Funke stage={1} mood="idle" size={120} />
      </div>
    );
  }

  return (
    <div className="bg-stars flex h-full flex-col">
      <main ref={scroller} className="pt-safe flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-lg px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-2">
          {tab === 'heute' && (
            <TodayScreen
              onCreateQuest={() => {
                setTab('quests');
                setCreating(true);
              }}
            />
          )}
          {tab === 'quests' && <MyQuestsScreen creating={creating} onCreatingChange={setCreating} />}
          {tab === 'tagebuch' && <JournalScreen />}
          {tab === 'funke' && <FunkeScreen />}
        </div>
      </main>
      <TabBar tab={tab} onChange={setTab} />
      <LevelUpModal />
      {toast && <Toast message={toast.message} icon={toast.accessory && <AccessoryIcon accessory={toast.accessory} size={36} />} />}

      <div className="landscape-hint fixed inset-0 z-[100] flex-col items-center justify-center gap-3 bg-night-900 text-center">
        <Funke stage={1} mood="sleepy" size={100} />
        <div className="font-pixel text-xl">Bitte dreh dein iPhone ins Hochformat 🙂</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
