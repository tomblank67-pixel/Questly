/**
 * Tiny pixel-art icons drawn from char maps. 'x' = currentColor, other chars via palette.
 */
const ICONS = {
  sun: ['...x....', '.x.x.x..', '..xxx...', 'xxxoxxx.', '..xxx...', '.x.x.x..', '...x....', '........'],
  scroll: ['.xxxxxx.', 'x.xxxxxx', '.x....x.', '.x.xx.x.', '.x....x.', '.x.xx.x.', 'xxxxxx.x', '.xxxxxx.'],
  book: ['xxx..xxx', 'x..xx..x', 'x.xxxx.x', 'x..xx..x', 'x.xxxx.x', 'x..xx..x', 'xxxxxxxx', '........'],
  flame: ['...x....', '...xx...', '..xxx.x.', '.xxoxxx.', '.xoooxx.', 'xxoooxxx', '.xxoxxx.', '..xxxx..'],
  dice: ['xxxxxxx.', 'x.....x.', 'x.o.o.x.', 'x.....x.', 'x.o.o.x.', 'x.....x.', 'xxxxxxx.', '........'],
  gear: ['..x.x...', '.xxxxx..', 'xxx.xxx.', '.x...x..', 'xxx.xxx.', '.xxxxx..', '..x.x...', '........'],
  plus: ['...xx...', '...xx...', '...xx...', 'xxxxxxxx', 'xxxxxxxx', '...xx...', '...xx...', '...xx...'],
  check: ['.......x', '......xx', '.....xx.', 'x...xx..', 'xx.xx...', '.xxx....', '..x.....', '........'],
  pen: ['......xx', '.....xxx', '....xxx.', '...xxx..', '..xxx...', '.xxx....', 'xx......', 'x.......'],
  close: ['xx....xx', '.xx..xx.', '..xxxx..', '...xx...', '..xxxx..', '.xx..xx.', 'xx....xx', '........'],
} as const;

export type PixelIconName = keyof typeof ICONS;

export function PixelIcon({ name, size = 20, className = '', accent = '#ffd23f' }: { name: PixelIconName; size?: number; className?: string; accent?: string }) {
  const map = ICONS[name];
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} shapeRendering="crispEdges" className={className} aria-hidden>
      {map.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={ch === 'x' ? 'currentColor' : accent} />,
        ),
      )}
    </svg>
  );
}
