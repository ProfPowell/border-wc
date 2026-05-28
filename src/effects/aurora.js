import { resolveRadius } from '../params.js';
import { ensureAngleProperty, ensureStyles } from './_helpers.js';

// CSS for both the crisp gradient ring and the blurred halo. mask-composite
// punches the center transparent so only the perimeter shows. The conic
// gradient uses --bwc-angle (registered as <angle> via ensureAngleProperty)
// so @keyframes can animate it smoothly.
const AURORA_CSS = `
  [data-border-wc="aurora"], [data-border-wc="aurora-halo"] {
    position: absolute; pointer-events: none;
    background: conic-gradient(from var(--bwc-angle, 0deg), var(--bwc-stops));
  }
  [data-border-wc="aurora"] {
    inset: 0; padding: var(--bwc-thickness, 2px);
    border-radius: var(--bwc-radius, 12px);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  [data-border-wc="aurora-halo"] {
    inset: calc(-1 * var(--bwc-thickness, 2px) * 3);
    border-radius: calc(var(--bwc-radius, 12px) + var(--bwc-thickness, 2px) * 3);
    filter: blur(calc(var(--bwc-thickness, 2px) * 4));
    opacity: 0.55; z-index: -1;
  }
  @keyframes bwc-aurora-spin { to { --bwc-angle: 360deg; } }
`;

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
}

// Accepts a comma list of CSS colors or one color (expanded into a 3-stop
// fade); empty input picks a theme-friendly 4-hue oklch default.
function paletteFor(color) {
  const parts = (color || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) return [...parts, parts[0]].join(', ');
  if (parts.length === 1) {
    const c = parts[0];
    return `${c}, transparent 40%, ${c}`;
  }
  return 'oklch(0.72 0.18 30), oklch(0.72 0.18 220), oklch(0.72 0.18 140), oklch(0.72 0.18 300), oklch(0.72 0.18 30)';
}

export function createAurora(host, params) {
  ensurePositioned(host);
  ensureAngleProperty();
  ensureStyles('aurora', AURORA_CSS);

  const stops = paletteFor(params.color === 'currentColor' ? '' : params.color);
  const radius = resolveRadius(host, params);

  const halo = document.createElement('div');
  halo.setAttribute('data-border-wc', 'aurora-halo');
  const ring = document.createElement('div');
  ring.setAttribute('data-border-wc', 'aurora');
  for (const el of [halo, ring]) {
    el.style.setProperty('--bwc-thickness', `${params.thickness}px`);
    el.style.setProperty('--bwc-radius', `${radius}px`);
    el.style.setProperty('--bwc-stops', stops);
  }
  host.appendChild(halo);
  host.appendChild(ring);

  if (!params.reduce && params.animate !== false) {
    const dur = Math.max(800, params.speed * 4);
    ring.style.animation = `bwc-aurora-spin ${dur}ms linear infinite`;
    halo.style.animation = `bwc-aurora-spin ${dur}ms linear infinite`;
  }

  return () => {
    halo.remove();
    ring.remove();
  };
}
