import { ensureStyles } from './_helpers.js';

// Two oversized colored divs sit behind the host and morph between two
// clip-path triangles. mix-blend-mode: multiply keeps them readable over any
// background. Based on inyoung1's CodePen pattern, productized with theme
// tokens and a tunable wing-extent.
const WINGS_CSS = `
  [data-border-wc="wings"] {
    position: absolute; inset: calc(-1 * var(--bwc-wing) * 1.2);
    pointer-events: none; z-index: -1;
    mix-blend-mode: multiply;
    animation: bwc-wings-swap var(--bwc-dur, 6s) ease-in-out infinite;
  }
  [data-border-wc="wings"].b { animation-delay: calc(var(--bwc-dur, 6s) / -2); }
  @keyframes bwc-wings-swap {
    0%, 100% {
      clip-path: polygon(0 0,
        calc(100% - var(--bwc-wing)) var(--bwc-wing),
        100% 100%,
        var(--bwc-wing) calc(100% - var(--bwc-wing)));
    }
    50% {
      clip-path: polygon(var(--bwc-wing) var(--bwc-wing),
        100% 0,
        calc(100% - var(--bwc-wing)) calc(100% - var(--bwc-wing)),
        0 100%);
    }
  }
`;

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
}

export function createWings(host, params) {
  ensurePositioned(host);
  ensureStyles('wings', WINGS_CSS);

  const colors = (params.color || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const c1 = colors[0] && colors[0] !== 'currentColor' ? colors[0] : '#93e1d8';
  const c2 = colors[1] || '#aa4465';
  const wing = `${Math.max(20, params.thickness * 14)}px`;
  const dur = `${Math.max(1600, params.speed * 5)}ms`;

  const make = (variant, bg) => {
    const el = document.createElement('div');
    el.setAttribute('data-border-wc', 'wings');
    if (variant) el.classList.add(variant);
    el.style.background = bg;
    el.style.setProperty('--bwc-wing', wing);
    el.style.setProperty('--bwc-dur', dur);
    if (params.reduce || params.animate === false) el.style.animation = 'none';
    host.appendChild(el);
    return el;
  };
  const a = make('', c1);
  const b = make('b', c2);
  return () => {
    a.remove();
    b.remove();
  };
}
