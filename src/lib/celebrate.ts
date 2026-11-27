/**
 * Pixel confetti burst + flying "+XP" label at a screen position.
 * Pure DOM so it works on top of everything and cleans up after itself.
 */
const COLORS = ['#ffd23f', '#ff8c3a', '#ff5f7a', '#fff1b8', '#8bc47a', '#7fb8e6', '#b49af0'];

export function celebrateAt(x: number, y: number, xp: number, accent?: string) {
  if (typeof document === 'undefined') return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const count = reduce ? 0 : 34;
  const nodes: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 50 + Math.random() * 90;
    const size = 4 + Math.round(Math.random() * 2) * 2; // pixel-ish: 4, 6 or 8 px
    p.className = 'particle';
    Object.assign(p.style, {
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      background: i % 5 === 0 && accent ? accent : COLORS[i % COLORS.length],
      boxShadow: '0 0 6px rgba(255,200,80,0.6)',
    });
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    // slight upward bias + gravity feel
    p.style.setProperty('--dy', `${Math.sin(angle) * dist - 30 + Math.random() * 40}px`);
    p.style.setProperty('--rot', `${Math.random() * 360}deg`);
    p.style.setProperty('--dur', `${700 + Math.random() * 500}ms`);
    nodes.push(p);
  }

  if (xp > 0) nodes.push(xpLabel(x, y, xp));

  nodes.forEach((n) => document.body.appendChild(n));
  setTimeout(() => nodes.forEach((n) => n.remove()), 1500);
}

function xpLabel(x: number, y: number, xp: number) {
  const label = document.createElement('div');
  label.className = 'xp-float whitespace-nowrap font-pixel text-3xl font-semibold text-ember-300';
  label.textContent = `+${xp} XP`;
  Object.assign(label.style, { left: `${x}px`, top: `${y - 30}px` });
  return label;
}
