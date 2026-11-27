import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { Funke, AccessoryIcon } from '../components/Funke';
import { ProgressBar, SectionTitle } from '../components/ui';
import { STAGES, stageForLevel } from '../lib/funke';
import { ACCESSORIES, SLOT_LABEL } from '../data/accessories';
import { totalXpForLevel } from '../lib/level';
import { SettingsSheet } from './SettingsSheet';
import { PixelIcon } from '../components/PixelIcon';
import { haptic } from '../lib/haptics';
import type { AccessorySlot } from '../types';

export function FunkeScreen() {
  const { stats, funkeMood, funkeJumping, funkeLine, pokeFunke, settings, updateSettings } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const stage = stageForLevel(stats.level.level);
  const nextStage = STAGES.find((s) => s.minLevel > stats.level.level);
  const unlocked = ACCESSORIES.filter((a) => a.isUnlocked(stats)).length;

  const toggle = (slot: AccessorySlot, id: string) => {
    haptic();
    const equipped = { ...settings.equipped };
    if (equipped[slot] === id) delete equipped[slot];
    else equipped[slot] = id;
    void updateSettings({ equipped });
  };

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="font-pixel text-3xl text-ember-300">Funke</h1>
        <button className="pixel-btn-ghost h-12 w-12 !px-0" onClick={() => setSettingsOpen(true)} aria-label="Einstellungen">
          <PixelIcon name="gear" size={22} />
        </button>
      </header>

      <div className="pixel-card mt-4 overflow-hidden p-4 text-center">
        <div className="bg-stars -mx-4 -mt-4 flex flex-col items-center bg-gradient-to-b from-night-950 to-night-800 pb-2 pt-4">
          <button onClick={pokeFunke} aria-label="Funke antippen">
            <Funke stage={stage.stage} mood={funkeMood} jumping={funkeJumping} equipped={settings.equipped} size={230} />
          </button>
          <p key={funkeLine} className="bubble-in mx-6 -mt-1 text-sm italic text-parchment-300">„{funkeLine}“</p>
        </div>
        <div className="mt-3 font-pixel text-2xl">{stage.name}</div>
        <div className="text-sm text-parchment-400">{stage.description}</div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="font-pixel text-xl text-ember-300">Level {stats.level.level}</span>
          <span className="text-xs font-bold text-parchment-400">
            {stats.level.xpInLevel}/{stats.level.xpNeeded} XP bis Level {stats.level.level + 1}
          </span>
        </div>
        <ProgressBar value={stats.level.progress} className="mt-1" />
        {nextStage && (
          <p className="mt-2 text-xs text-parchment-400">
            Nächste Entwicklung „{nextStage.name}“ ab Level {nextStage.minLevel} – noch {totalXpForLevel(nextStage.minLevel) - stats.totalXp} XP
          </p>
        )}
      </div>

      <SectionTitle>Entwicklung</SectionTitle>
      <div className="grid grid-cols-4 gap-2">
        {STAGES.map((s) => {
          const reached = stats.level.level >= s.minLevel;
          return (
            <div key={s.stage} className={`pixel-card flex flex-col items-center px-1 pb-2 pt-1 ${s.stage === stage.stage ? 'border-ember-400' : ''}`}>
              <div style={reached ? undefined : { filter: 'brightness(0) opacity(0.35)' }}>
                <Funke stage={s.stage} mood="idle" size={72} />
              </div>
              <div className="w-full break-words text-center font-pixel text-[12px] leading-tight [hyphens:auto]" lang="de">{reached ? s.name : '???'}</div>
              <div className="text-[10px] font-bold text-parchment-400">ab Lv {s.minLevel}</div>
            </div>
          );
        })}
      </div>

      <SectionTitle right={<span className="text-sm font-bold text-parchment-400">{unlocked}/{ACCESSORIES.length}</span>}>Accessoires</SectionTitle>
      <p className="-mt-2 mb-3 text-sm text-parchment-400">Tippe auf ein freigeschaltetes Teil, um es Funke anzuziehen (eins pro Körperstelle).</p>
      <div className="grid grid-cols-3 gap-2">
        {ACCESSORIES.map((a) => {
          const isUnlocked = a.isUnlocked(stats);
          const worn = settings.equipped[a.slot] === a.id;
          return (
            <button
              key={a.id}
              disabled={!isUnlocked}
              onClick={() => toggle(a.slot, a.id)}
              className={`pixel-card relative flex flex-col items-center gap-1 p-2 text-center ${worn ? '!border-ember-400 !bg-ember-500/15' : ''}`}
            >
              {worn && <span className="absolute right-1.5 top-1 text-xs text-ember-300">✔</span>}
              <AccessoryIcon accessory={a} size={44} locked={!isUnlocked} />
              <div className={`text-xs font-bold leading-tight ${isUnlocked ? '' : 'text-parchment-400'}`}>{isUnlocked ? a.name : '🔒 ' + SLOT_LABEL[a.slot]}</div>
              {!isUnlocked && (
                <>
                  <div className="text-[10px] leading-tight text-parchment-400">{a.requirement}</div>
                  <div className="mt-auto h-1.5 w-full overflow-hidden rounded bg-night-950">
                    <div className="h-full bg-ember-500" style={{ width: `${a.progress(stats) * 100}%` }} />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
