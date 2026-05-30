import { resolveRadius } from '../params.js';
import { ensureStyles } from './_helpers.js';

const OPART_CSS = `
  @keyframes bwc-opart-shift { to { background-position: 64px 0, 0 64px; } }
  [data-border-wc="opart"] {
    position: absolute; inset: 0; pointer-events: none; box-sizing: border-box;
    background:
      repeating-linear-gradient(45deg,
        var(--bwc-opart-col, currentColor) 0 6px, transparent 6px 12px),
      repeating-linear-gradient(-45deg,
        var(--bwc-opart-col, currentColor) 0 6px, transparent 6px 12px);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
            mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
  }
`;

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
}

// Op-Art moiré ring: crossed repeating-linear-gradients masked into a
// perimeter band via mask-composite, then shifted via background-position
// for the optical-shimmer effect.
export function createOpart(host, params) {
  ensurePositioned(host);
  ensureStyles('opart', OPART_CSS);
  const ring = document.createElement('div');
  ring.setAttribute('data-border-wc', 'opart');
  const color = params.color === 'currentColor' ? 'currentColor' : params.color;
  const t = Math.max(6, params.thickness * 5 + 4);
  ring.style.padding = `${t}px`;
  ring.style.borderRadius = `${resolveRadius(host, params) + t}px`;
  ring.style.setProperty('--bwc-opart-col', color);
  if (!params.reduce && params.animate !== false) {
    ring.style.animation = `bwc-opart-shift ${Math.max(1400, params.speed * 1.6)}ms linear infinite`;
  }
  host.appendChild(ring);
  return () => ring.remove();
}
