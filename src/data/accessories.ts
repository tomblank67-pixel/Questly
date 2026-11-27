import type { AccessorySlot } from '../types';
import type { PlayerStats } from '../lib/stats';

/**
 * Accessories are tiny pixel-art overlays for Funke.
 *
 * `pixels` is a char map; every char is looked up in `palette` ('.' = empty).
 * The map is centred horizontally on the slot's anchor point and shifted by `offset`.
 */
export interface Accessory {
  id: string;
  name: string;
  slot: AccessorySlot;
  /** Milestone text shown while locked. */
  requirement: string;
  isUnlocked: (s: PlayerStats) => boolean;
  /** 0..1 progress towards the unlock (for the locked UI). */
  progress: (s: PlayerStats) => number;
  pixels: string[];
  palette: Record<string, string>;
  offset?: [number, number];
}

const ratio = (v: number, goal: number) => Math.min(1, v / goal);

export const SLOT_LABEL: Record<AccessorySlot, string> = {
  kopf: 'Kopf',
  gesicht: 'Gesicht',
  hals: 'Hals',
  ruecken: 'Rücken',
  hand: 'Hand',
};

export const ACCESSORIES: Accessory[] = [
  {
    id: 'schal',
    name: 'Kuschelschal',
    slot: 'hals',
    requirement: 'Erledige deine erste Quest',
    isUnlocked: (s) => s.totalCompleted >= 1,
    progress: (s) => ratio(s.totalCompleted, 1),
    palette: { a: '#3fa7a0', b: '#7fe0cf', o: '#1d4f4c' },
    pixels: [
      '.oooooooooooo.',
      'oabababababao',
      '.oooooooooaao.',
      '..........oabo',
      '..........obao',
      '..........oooo',
    ].map((r) => r.padEnd(14, '.')),
  },
  {
    id: 'zipfelmuetze',
    name: 'Zipfelmütze',
    slot: 'kopf',
    requirement: 'Erreiche Level 3',
    isUnlocked: (s) => s.level.level >= 3,
    progress: (s) => ratio(s.level.level, 3),
    palette: { r: '#c8324b', d: '#8e1f33', w: '#fff4e0', o: '#4a1020' },
    offset: [2, -1],
    pixels: [
      '.........ww.',
      '........owwo',
      '.......ordo.',
      '......orrdo.',
      '.....orrrdo.',
      '....orrrrdo.',
      '...orrrrrrdo',
      '.owwwwwwwwwo',
      '.owwwwwwwwwo',
      '..oooooooooo',
    ],
  },
  {
    id: 'brille',
    name: 'Bücherwurm-Brille',
    slot: 'gesicht',
    requirement: 'Schaffe 5 Geist-Quests',
    isUnlocked: (s) => s.byCategory.geist.count >= 5,
    progress: (s) => ratio(s.byCategory.geist.count, 5),
    // 'g' (glass) has no colour on purpose → Funke's eyes shine through
    palette: { o: '#3b2a1a' },
    pixels: [
      'ooooo....ooooo',
      'oggggooooggggo',
      'oggggo..oggggo',
      'oggggo..oggggo',
      'ooooo....ooooo',
    ],
  },
  {
    id: 'laterne',
    name: 'Wanderlaterne',
    slot: 'hand',
    requirement: 'Meistere deine erste epische Quest',
    isUnlocked: (s) => s.epicCompleted >= 1,
    progress: (s) => ratio(s.epicCompleted, 1),
    palette: { o: '#3a2a1a', m: '#8a6a3a', y: '#ffe27a', w: '#fff8d0' },
    pixels: ['..ooo..', '..o.o..', '.ooooo.', 'omyyymo', 'omywymo', 'omyyymo', '.ooooo.'],
  },
  {
    id: 'blumenkranz',
    name: 'Blumenkranz',
    slot: 'kopf',
    requirement: 'Schaffe 10 Natur-Quests',
    isUnlocked: (s) => s.byCategory.natur.count >= 10,
    progress: (s) => ratio(s.byCategory.natur.count, 10),
    palette: { g: '#4f9a4a', p: '#ff8fb8', y: '#ffe066', w: '#ffffff', b: '#8ec5ff' },
    offset: [0, 5],
    pixels: ['..p.....y.....', '.pyp.w.yby.p..', 'ggpgwywgygpypg', 'gggggggggggggg'],
  },
  {
    id: 'stirnband',
    name: 'Sport-Stirnband',
    slot: 'kopf',
    requirement: 'Schaffe 10 Körper-Quests',
    isUnlocked: (s) => s.byCategory.koerper.count >= 10,
    progress: (s) => ratio(s.byCategory.koerper.count, 10),
    palette: { b: '#3b7dd8', w: '#ffffff', o: '#1b3a6a' },
    offset: [0, 6],
    pixels: ['oooooooooooooooo', 'bbbbbbwwbbbbbbbb', 'oooooooooooooooo', '...............oo', '...............o.o'],
  },
  {
    id: 'pinsel',
    name: 'Zauberpinsel',
    slot: 'hand',
    requirement: 'Schaffe 10 Kreativitäts-Quests',
    isUnlocked: (s) => s.byCategory.kreativitaet.count >= 10,
    progress: (s) => ratio(s.byCategory.kreativitaet.count, 10),
    palette: { b: '#a0522d', s: '#c0c0c0', p: '#ff5fa2', y: '#ffd23f' },
    pixels: ['..py.', '.ppy.', '.pp..', '.ss..', '.b...', 'b....', 'b....'],
  },
  {
    id: 'herzbrosche',
    name: 'Herzbrosche',
    slot: 'hals',
    requirement: 'Schaffe 10 Soziales-Quests',
    isUnlocked: (s) => s.byCategory.soziales.count >= 10,
    progress: (s) => ratio(s.byCategory.soziales.count, 10),
    palette: { r: '#ff4f7a', w: '#ffd0dc', o: '#7a1030' },
    pixels: ['.oo.oo.', 'orwroro', 'orrrrro', '.orrro.', '..oro..', '...o...'],
  },
  {
    id: 'sonnenbrille',
    name: 'Coole Sonnenbrille',
    slot: 'gesicht',
    requirement: 'Halte eine 7-Tage-Serie',
    isUnlocked: (s) => s.streak.longest >= 7,
    progress: (s) => ratio(s.streak.longest, 7),
    palette: { k: '#151018', w: '#6a5a8a' },
    pixels: ['kkkkkkkkkkkkkk', 'kwkkkkkkkwkkkk', 'kkkkkk..kkkkkk', '.kkkk....kkkk.'],
  },
  {
    id: 'umhang',
    name: 'Abenteuer-Umhang',
    slot: 'ruecken',
    requirement: 'Erledige 25 Quests',
    isUnlocked: (s) => s.totalCompleted >= 25,
    progress: (s) => ratio(s.totalCompleted, 25),
    palette: { r: '#7a2a8a', d: '#4a1658', y: '#ffd23f' },
    pixels: [
      '...yrrrrrrrrrrrry...',
      '..drrrrrrrrrrrrrrd..',
      '..drrrrrrrrrrrrrrd..',
      '.ddrrrrrrrrrrrrrrdd.',
      '.drrrrrrrrrrrrrrrrd.',
      '.drrrrrrrrrrrrrrrrd.',
      'ddrrrrrrrrrrrrrrrrdd',
      'drrrrrrrrrrrrrrrrrrd',
      'drrrrrrrrrrrrrrrrrrd',
      'drdrrdrrdrrdrrdrrdrd',
      'd.d..d..d..d..d..d.d',
    ],
  },
  {
    id: 'rucksack',
    name: 'Entdecker-Rucksack',
    slot: 'ruecken',
    requirement: 'Schaffe 10 Abenteuer-Quests',
    isUnlocked: (s) => s.byCategory.abenteuer.count >= 10,
    progress: (s) => ratio(s.byCategory.abenteuer.count, 10),
    palette: { b: '#8a5a2b', d: '#5a3a1b', y: '#e0b04a' },
    offset: [11, 0],
    pixels: ['.dddd.', 'dbbbbd', 'dyyyyd', 'dbbbbd', 'dbbbbd', 'dbbbbd', '.dddd.'],
  },
  {
    id: 'monokel',
    name: 'Gelehrten-Monokel',
    slot: 'gesicht',
    requirement: 'Schreibe 10 Tagebuch-Notizen',
    isUnlocked: (s) => s.notesWritten >= 10,
    progress: (s) => ratio(s.notesWritten, 10),
    palette: { y: '#e0b04a' },
    pixels: ['.........yyyy.', '........yggggy', '........yggggy', '........yggggy', '.........yyyy.', '............y.', '............y.'],
  },
  {
    id: 'krone',
    name: 'Funkelkrone',
    slot: 'kopf',
    requirement: 'Erreiche Level 10',
    isUnlocked: (s) => s.level.level >= 10,
    progress: (s) => ratio(s.level.level, 10),
    palette: { y: '#ffd23f', d: '#c8961a', r: '#ff4f7a', b: '#5fc8ff' },
    offset: [0, 1],
    pixels: ['y...y...y', 'yy.yyy.yy', 'yyyyyyyyy', 'yrydbdyry', 'ddddddddd'],
  },
  {
    id: 'zauberstab',
    name: 'Sternenstab',
    slot: 'hand',
    requirement: 'Erledige 100 Quests',
    isUnlocked: (s) => s.totalCompleted >= 100,
    progress: (s) => ratio(s.totalCompleted, 100),
    palette: { y: '#ffe066', w: '#ffffff', b: '#6a4a2a' },
    pixels: ['..y..', '.yyy.', 'yywyy', '.yyy.', '.y.y.', '..b..', '..b..', '..b..', '..b..'],
  },
  {
    id: 'sternenumhang',
    name: 'Sternenumhang',
    slot: 'ruecken',
    requirement: 'Halte eine 30-Tage-Serie',
    isUnlocked: (s) => s.streak.longest >= 30,
    progress: (s) => ratio(s.streak.longest, 30),
    palette: { n: '#22285a', d: '#141838', w: '#ffffff', y: '#ffe066' },
    pixels: [
      '...ynnnnnnnnnnnny...',
      '..dnnnnwnnnnnnnnnd..',
      '..dnnnnnnnnnnynnnd..',
      '.ddnynnnnnnnnnnnndd.',
      '.dnnnnnnnnwnnnnnnnd.',
      '.dnnnnnnnnnnnnnynnd.',
      'ddnnnwnnnnnnnnnnnndd',
      'dnnnnnnnnnynnnnnnnnd',
      'dnnynnnnnnnnnnnwnnnd',
      'dndnndnndnndnndnndnd',
      'd.d..d..d..d..d..d.d',
    ],
  },
];

export const accessoryById = (id: string | undefined) => ACCESSORIES.find((a) => a.id === id);

export const unlockedAccessoryIds = (s: PlayerStats) =>
  new Set(ACCESSORIES.filter((a) => a.isUnlocked(s)).map((a) => a.id));
