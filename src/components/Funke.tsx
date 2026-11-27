import { memo, useMemo } from 'react';
import type { FunkeStage, FunkeMood } from '../lib/funke';
import type { AccessorySlot } from '../types';
import { accessoryById, type Accessory } from '../data/accessories';

/**
 * Funke – a small flame creature drawn as pixel art.
 *
 * The body is generated procedurally on a 32×40 grid: a union of "teardrop"
 * shapes is rasterised into cells, outlined, and shaded with shrinking copies
 * of itself (red → orange → yellow → core). Two frames with slightly different
 * tip sway are rendered and alternated via CSS for a flickering flame.
 *
 * Face and accessories use a fixed layout relative to the body centre, so
 * accessories fit every evolution stage.
 */

const W = 32;
const H = 40;
const CX = 16;

interface StageShape {
  r: number; // body radius
  h: number; // flame height above the centre
  sideTongues: boolean;
  arms: boolean;
}

const SHAPES: Record<FunkeStage, StageShape> = {
  1: { r: 7, h: 13, sideTongues: false, arms: false },
  2: { r: 8, h: 16, sideTongues: true, arms: true },
  3: { r: 9, h: 19, sideTongues: true, arms: true },
  4: { r: 10, h: 21, sideTongues: true, arms: true },
};

type Palette = { outline: string; outer: string; mid: string; inner: string; core: string };

const PALETTES: Record<FunkeStage, Palette> = {
  1: { outline: '#5a1a1e', outer: '#e8462a', mid: '#ff8c3a', inner: '#ffc94a', core: '#fff1b8' },
  2: { outline: '#5a1a1e', outer: '#e8462a', mid: '#ff8c3a', inner: '#ffc94a', core: '#fff1b8' },
  3: { outline: '#561626', outer: '#e83a3a', mid: '#ff7a2e', inner: '#ffc23a', core: '#fff4c8' },
  4: { outline: '#4a1430', outer: '#ff4f3a', mid: '#ff9a3a', inner: '#ffe06a', core: '#bfe8ff' },
};

/** Is point (px,py) inside a teardrop with round bottom (cx,cy,r) and tip height h? */
function teardrop(px: number, py: number, cx: number, cy: number, r: number, h: number, lean: number) {
  const dy = py - cy;
  if (dy >= 0) {
    const dx = px - cx;
    return dx * dx + dy * 1.12 * (dy * 1.12) <= r * r;
  }
  const t = -dy / h;
  if (t > 1) return false;
  const shift = lean * t * t * h * 0.35;
  const hw = r * Math.pow(1 - t, 0.85);
  return Math.abs(px - cx - shift) <= hw;
}

type Grid = (string | null)[][];

function buildBody(stage: FunkeStage, frame: 0 | 1, armsUp: boolean, cy: number): Grid {
  const s = SHAPES[stage];
  const sway = frame === 0 ? 0.35 : -0.35;

  const inside = (px: number, py: number, scale: number) => {
    const r = s.r * scale;
    const h = s.h * scale;
    // inner layers sit lower, like the hot core of a real flame
    const c = cy + (1 - scale) * s.r * 0.55;
    if (teardrop(px, py, CX, c, r, h, sway)) return true;
    if (s.sideTongues) {
      const off = r * 0.55;
      if (teardrop(px, py, CX - off, c - r * 0.2, r * 0.5, h * 0.62, -0.9 + sway)) return true;
      if (teardrop(px, py, CX + off, c - r * 0.2, r * 0.5, h * 0.62, 0.9 + sway)) return true;
    }
    if (scale === 1 && s.arms) {
      // little round arms; raised when cheering
      const ay = armsUp ? cy - 4.5 : cy + 1.5;
      const ax = s.r + (armsUp ? 0.6 : 0.9);
      for (const sign of [-1, 1]) {
        const dx = px - (CX + sign * ax);
        const dy = py - ay;
        if (dx * dx + dy * dy <= 2.6) return true;
      }
    }
    return false;
  };

  const pal = PALETTES[stage];
  const grid: Grid = Array.from({ length: H }, () => Array(W).fill(null));
  const outerMask = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && inside(x + 0.5, y + 0.5, 1);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!outerMask(x, y)) continue;
      const edge = !outerMask(x - 1, y) || !outerMask(x + 1, y) || !outerMask(x, y - 1) || !outerMask(x, y + 1);
      let color = pal.outer;
      if (edge) color = pal.outline;
      else if (inside(x + 0.5, y + 0.5, 0.25)) color = pal.core;
      else if (inside(x + 0.5, y + 0.5, 0.48)) color = pal.inner;
      else if (inside(x + 0.5, y + 0.5, 0.74)) color = pal.mid;
      grid[y][x] = color;
    }
  }
  return grid;
}

/** Paints a char map onto the grid. (x,y) = top-left cell. */
function stamp(grid: Grid, map: string[], palette: Record<string, string>, x: number, y: number) {
  map.forEach((row, dy) => {
    [...row].forEach((ch, dx) => {
      const color = palette[ch];
      const gx = x + dx;
      const gy = y + dy;
      if (color && gy >= 0 && gy < H && gx >= 0 && gx < W) grid[gy][gx] = color;
    });
  });
}

/** Converts the grid to run-length encoded <rect>s (far fewer DOM nodes). */
function GridRects({ grid }: { grid: Grid }) {
  const rects: JSX.Element[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < W) {
      const c = row[x];
      if (!c) {
        x++;
        continue;
      }
      let len = 1;
      while (x + len < W && row[x + len] === c) len++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={len} height={1} fill={c} />);
      x += len;
    }
  });
  return <>{rects}</>;
}

const FACE_PAL = { k: '#2a1420', W: '#ffffff', p: '#ff7aa2', t: '#ff5f7a' };

const EYES: Record<'open' | 'happy' | 'closed', string[]> = {
  open: ['Wk', 'kk', 'kk'],
  happy: ['.kk.', 'k..k', '....'],
  closed: ['....', 'k..k', '.kk.'],
};

function drawFace(grid: Grid, mood: FunkeMood, cy: number, blink: boolean) {
  const eyeY = cy - 5;
  const eyes = mood === 'sleepy' || blink ? EYES.closed : mood === 'happy' || mood === 'proud' ? EYES.happy : EYES.open;
  const wide = eyes[0].length;
  // eye centres at CX-4 and CX+4
  stamp(grid, eyes, FACE_PAL, CX - 4 - wide / 2, eyeY);
  stamp(grid, eyes, FACE_PAL, CX + 4 - wide / 2, eyeY);
  // blush
  stamp(grid, ['pp'], FACE_PAL, CX - 7, cy - 2);
  stamp(grid, ['pp'], FACE_PAL, CX + 5, cy - 2);
  // mouth
  const mouth =
    mood === 'sleepy' ? ['.kk.'] : mood === 'happy' || mood === 'proud' ? ['kkkk', 'kttk', '.kk.'] : ['k..k', '.kk.'];
  stamp(grid, mouth, FACE_PAL, CX - 2, cy - 1);
}

/** Top-left position of an accessory map, based on its slot anchor. */
function accessoryPos(a: Accessory, stage: FunkeStage, cy: number): [number, number] {
  const w = a.pixels[0].length;
  const h = a.pixels.length;
  const r = SHAPES[stage].r;
  const [ox, oy] = a.offset ?? [0, 0];
  switch (a.slot) {
    case 'kopf':
      return [Math.round(CX - w / 2 + ox), cy - 7 - h + oy];
    case 'gesicht':
      return [Math.round(CX - w / 2 + ox), cy - 6 + oy];
    case 'hals':
      return [Math.round(CX - 7 + ox), cy + 2 + oy];
    case 'ruecken':
      return [Math.round(CX - w / 2 + ox), cy - 4 + oy];
    case 'hand':
      return [Math.round(CX + r + 1 + ox), cy - h + 1 + oy];
  }
}

export interface FunkeProps {
  stage: FunkeStage;
  mood: FunkeMood;
  /** Plays the jump-for-joy animation while true. */
  jumping?: boolean;
  equipped?: Partial<Record<AccessorySlot, string>>;
  size?: number;
  className?: string;
  onClick?: () => void;
  /** Render a single still frame (no animation) – used for icon generation. */
  still?: boolean;
}

function FunkeImpl({ stage, mood, jumping = false, equipped = {}, size = 160, className = '', onClick, still = false }: FunkeProps) {
  const r = SHAPES[stage].r;
  const cy = Math.round(H - 2 - r / 1.12);
  const cheering = jumping || mood === 'proud';
  const effMood: FunkeMood = jumping ? 'happy' : mood;

  const accessories = useMemo(
    () =>
      (Object.values(equipped) as string[])
        .map((id) => accessoryById(id))
        .filter((a): a is Accessory => !!a),
    [equipped],
  );

  // Two flicker frames (+ a blink frame) – memoised, only rebuilt on state changes.
  const frames = useMemo(() => {
    const make = (frame: 0 | 1, blink: boolean) => {
      const g = buildBody(stage, frame, cheering, cy);
      drawFace(g, effMood, cy, blink);
      for (const a of accessories) {
        if (a.slot === 'ruecken') continue; // drawn behind the body
        const [x, y] = accessoryPos(a, stage, cy);
        stamp(g, a.pixels, a.palette, x, y);
      }
      return g;
    };
    return [make(0, false), make(1, false), make(0, true)];
  }, [stage, cheering, effMood, cy, accessories]);

  const back = accessories.find((a) => a.slot === 'ruecken');
  const backGrid = useMemo(() => {
    if (!back) return null;
    const g: Grid = Array.from({ length: H }, () => Array(W).fill(null));
    const [x, y] = accessoryPos(back, stage, cy);
    stamp(g, back.pixels, back.palette, x, y);
    return g;
  }, [back, stage, cy]);

  const motion = jumping ? 'funke-jump' : mood === 'sleepy' ? 'funke-sleep' : 'funke-idle';

  return (
    <svg
      viewBox="-3 3 38 40"
      width={size}
      height={(size * 40) / 38}
      shapeRendering="crispEdges"
      className={`select-none ${className}`}
      onClick={onClick}
      role="img"
      aria-label={`Funke, Stufe ${stage}`}
    >
      <defs>
        <radialGradient id="funke-glow">
          <stop offset="0%" stopColor={stage === 4 ? '#ffe680' : '#ff9a3a'} stopOpacity={stage === 4 ? 0.55 : 0.35} />
          <stop offset="100%" stopColor="#ff9a3a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* warm glow on the ground / golden aura on stage 4 */}
      <ellipse
        className={stage === 4 ? 'funke-aura' : ''}
        cx={CX}
        cy={stage === 4 ? cy - 4 : cy + 2}
        rx={stage === 4 ? 19 : 14}
        ry={stage === 4 ? 22 : 10}
        fill="url(#funke-glow)"
        opacity={mood === 'sleepy' ? 0.4 : 1}
      />
      <ellipse cx={CX} cy={H - 1} rx={r * 0.9} ry={1.2} fill="#000" opacity="0.25" />

      <g className={motion}>
        {backGrid && <GridRects grid={backGrid} />}
        <g className={mood === 'sleepy' ? 'flicker-a-slow' : 'flicker-a'}>
          <GridRects grid={frames[0]} />
        </g>
        {!still && (
          <g className={mood === 'sleepy' ? 'flicker-b-slow' : 'flicker-b'}>
            <GridRects grid={frames[1]} />
          </g>
        )}
        {!still && mood !== 'sleepy' && (
          <g className="funke-blink">
            <GridRects grid={frames[2]} />
          </g>
        )}
      </g>

      {/* stage 3+: dancing embers */}
      {stage >= 3 && mood !== 'sleepy' && (
        <g>
          {[
            [CX - r - 3, cy - 2, 0],
            [CX + r + 2, cy - 6, 0.7],
            [CX - 3, cy - SHAPES[stage].h, 1.3],
            [CX + 5, cy - SHAPES[stage].h + 4, 2.1],
          ].map(([x, y, d], i) => (
            <rect key={i} x={x} y={y} width={1} height={1} fill={i % 2 ? '#ffe06a' : '#ff8c3a'} className="ember" style={{ animationDelay: `${d}s` }} />
          ))}
        </g>
      )}

      {/* stage 4: twinkling star */}
      {stage === 4 && mood !== 'sleepy' && (
        <g className="twinkle" fill="#fff8c0">
          <rect x={CX + 9} y={cy - 19} width={1} height={3} />
          <rect x={CX + 8} y={cy - 18} width={3} height={1} />
        </g>
      )}

      {/* sleeping: floating Zzz */}
      {mood === 'sleepy' && (
        <g fill="#cfc3ff" className="font-pixel" fontSize="5">
          <text x={CX + 8} y={cy - 10} className="zzz">z</text>
          <text x={CX + 11} y={cy - 14} className="zzz" style={{ animationDelay: '1s' }} fontSize="6">z</text>
          <text x={CX + 14} y={cy - 19} className="zzz" style={{ animationDelay: '2s' }} fontSize="7">Z</text>
        </g>
      )}
    </svg>
  );
}

export const Funke = memo(FunkeImpl);

/** Pixel preview of a single accessory (for the inventory grid). */
export function AccessoryIcon({ accessory, size = 40, locked = false }: { accessory: Accessory; size?: number; locked?: boolean }) {
  const w = Math.max(...accessory.pixels.map((r) => r.length));
  const h = accessory.pixels.length;
  const dim = Math.max(w, h) + 2;
  const rects: JSX.Element[] = [];
  accessory.pixels.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const c = accessory.palette[ch];
      if (c) rects.push(<rect key={`${x}-${y}`} x={x + (dim - w) / 2} y={y + (dim - h) / 2} width={1.02} height={1.02} fill={locked ? '#4a3d55' : c} />);
    }),
  );
  return (
    <svg viewBox={`0 0 ${dim} ${dim}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden>
      {rects}
    </svg>
  );
}
