import { useEffect } from 'react';
import { Funke } from './Funke';
import { useApp } from '../state/AppContext';
import { stageForLevel } from '../lib/funke';
import { celebrateAt } from '../lib/celebrate';

export function LevelUpModal() {
  const { levelUp, dismissLevelUp, settings } = useApp();

  useEffect(() => {
    if (!levelUp) return;
    // a few extra bursts for the big moment
    const t = [0, 250, 500].map((d, i) =>
      window.setTimeout(() => celebrateAt(innerWidth * (0.25 + i * 0.25), innerHeight * 0.35, 0), d),
    );
    return () => t.forEach(clearTimeout);
  }, [levelUp]);

  if (!levelUp) return null;
  const stage = stageForLevel(levelUp.level);

  return (
    <div className="fade-in fixed inset-0 z-50 grid place-items-center bg-black/70 px-6" onClick={dismissLevelUp}>
      <div className="pop-in pixel-card w-full max-w-sm border-ember-400 p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="font-pixel text-4xl text-ember-300">Level {levelUp.level}!</div>
        <div className="mx-auto my-2 w-fit">
          <Funke stage={stage.stage} mood="proud" jumping equipped={settings.equipped} size={150} />
        </div>
        {levelUp.newStage ? (
          <>
            <div className="font-pixel text-2xl">Funke entwickelt sich!</div>
            <p className="mt-1 text-parchment-300">
              Neue Stufe: <b className="text-ember-300">{levelUp.newStage.name}</b> – {levelUp.newStage.description}
            </p>
          </>
        ) : (
          <p className="text-parchment-300">Du wirst immer stärker – und Funke strahlt mit dir um die Wette.</p>
        )}
        <button className="pixel-btn-primary mt-5 w-full" onClick={dismissLevelUp}>
          Weiter geht’s!
        </button>
      </div>
    </div>
  );
}
