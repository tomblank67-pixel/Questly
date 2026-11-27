/**
 * Renders Funke to static SVG icons (run via `npm run icons`).
 * Writes public/icons/icon.svg (+ maskable variant + favicon).
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { Funke } from '../src/components/Funke';

const funke = (size: number) => renderToStaticMarkup(<Funke stage={2} mood="happy" still size={size} />);

/**
 * @param scale  rendered Funke width in px. The body occupies roughly the
 *               lower half of Funke's viewBox, so we centre on that part.
 */
function icon(scale: number) {
  const x = 256 - scale / 2;
  const y = 262 - 0.72 * scale;
  const svg = funke(scale).replace('<svg', `<svg x="${x}" y="${y}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="60%" r="70%">
      <stop offset="0%" stop-color="#3d2440"/>
      <stop offset="100%" stop-color="#140c18"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  ${[[70, 90], [430, 70], [400, 180], [90, 300], [450, 400], [60, 450]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="8" fill="#ffe7b0" opacity="0.6"/>`).join('')}
  ${svg}
</svg>`;
}

writeFileSync('public/icons/icon.svg', icon(470));
writeFileSync('public/icons/icon-maskable.svg', icon(360));
writeFileSync('public/icons/favicon.svg', icon(500));
console.log('SVG icons written');
