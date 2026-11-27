/**
 * Logic for the companion "Funke": evolution stage and mood.
 * Funke is never punished – after a break it just gets sleepy and is happy to see you again.
 */

export type FunkeStage = 1 | 2 | 3 | 4;

export interface StageInfo {
  stage: FunkeStage;
  name: string;
  minLevel: number;
  description: string;
}

export const STAGES: StageInfo[] = [
  { stage: 1, name: 'Glimmer', minLevel: 1, description: 'Ein winziger, neugieriger Funke.' },
  { stage: 2, name: 'Flämmchen', minLevel: 5, description: 'Hat kleine Ärmchen bekommen und winkt gern.' },
  { stage: 3, name: 'Feuergeist', minLevel: 10, description: 'Lässt Glutfunken um sich tanzen.' },
  { stage: 4, name: 'Sonnenflamme', minLevel: 20, description: 'Strahlt mit blauem Herzfeuer und goldener Aura.' },
];

export function stageForLevel(level: number): StageInfo {
  let result = STAGES[0];
  for (const s of STAGES) if (level >= s.minLevel) result = s;
  return result;
}

export type FunkeMood = 'idle' | 'happy' | 'proud' | 'sleepy';

/** Inactive days from which Funke gets sleepy. */
export const SLEEPY_AFTER_DAYS = 2;

/**
 * Base mood (without the short "jump for joy" animation, which the UI adds
 * temporarily after a completion).
 */
export function baseMood(opts: { daysInactive: number | null; doneToday: number; dailyTotal: number }): FunkeMood {
  if (opts.doneToday > 0 && opts.dailyTotal > 0 && opts.doneToday >= opts.dailyTotal) return 'proud';
  if (opts.doneToday > 0) return 'happy';
  if (opts.daysInactive !== null && opts.daysInactive >= SLEEPY_AFTER_DAYS) return 'sleepy';
  return 'idle';
}
