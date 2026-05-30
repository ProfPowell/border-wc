import { ensureStyles } from './_helpers.js';

// Decoration tier — first non-perimeter effect. Places themed "washi-tape"
// strips on the host (corners, edges, scatter), with patterned fills and
// optional fibrous torn edges via feDisplacementMap.
//
// Pattern recipes are embedded copies of the canonical Decorated-Layers
// tokens (single source of truth lives in vanilla-breeze/bg-wc — see
// bg-wc/docs/superpowers/plans/washi-bg.md). Keep in sync if those change.
const WASHI_CSS = `
  [data-border-wc="washi"] {
    position: absolute; inset: 0; pointer-events: none; overflow: visible;
  }
  [data-border-wc="washi"] .bwc-strip {
    position: absolute;
    background: var(--bwc-washi-bg, none);
    background-color: var(--pat-a, currentColor);
    mix-blend-mode: multiply;
    box-shadow: 0 2px 4px oklch(0 0 0 / .16);
    transform-origin: center;
  }
  [data-border-wc="washi"] .bwc-strip.bwc-settle {
    opacity: 0;
    transform: translate3d(0,0,0) rotate(var(--bwc-rot-from, 0deg));
    transition:
      opacity 320ms ease-out var(--bwc-delay, 0ms),
      transform 380ms cubic-bezier(.22,1,.36,1) var(--bwc-delay, 0ms);
  }
  [data-border-wc="washi"] .bwc-strip.bwc-settle.bwc-on {
    opacity: var(--bwc-opacity, 0.86);
    transform: translate3d(0,0,0) rotate(var(--bwc-rot, 0deg));
  }
`;

const PATTERN_RECIPES = {
  solid: 'linear-gradient(var(--pat-a), var(--pat-a))',
  stripe:
    'repeating-linear-gradient(45deg, var(--pat-a) 0 calc(var(--pat-size) * 0.5),' +
    ' var(--pat-b) calc(var(--pat-size) * 0.5) var(--pat-size))',
  dot:
    'radial-gradient(var(--pat-a) calc(var(--pat-size) * 0.18),' +
    ' transparent calc(var(--pat-size) * 0.24)) 0 0 / var(--pat-size) var(--pat-size)',
  check:
    'repeating-linear-gradient(0deg, var(--pat-a) 0 calc(var(--pat-size) * 0.4), transparent 0 var(--pat-size)),' +
    ' repeating-linear-gradient(90deg, var(--pat-a) 0 calc(var(--pat-size) * 0.4), transparent 0 var(--pat-size))',
  grid:
    'repeating-linear-gradient(0deg, var(--pat-a) 0 1px, transparent 1px var(--pat-size)),' +
    ' repeating-linear-gradient(90deg, var(--pat-a) 0 1px, transparent 1px var(--pat-size))',
};

let TORN_FILTER_INSTALLED = false;
function ensureTornFilter() {
  if (TORN_FILTER_INSTALLED) return;
  TORN_FILTER_INSTALLED = true;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.style.pointerEvents = 'none';
  svg.innerHTML = `
    <filter id="bwc-washi-fray" x="-6%" y="-20%" width="112%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.12" numOctaves="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="6"/>
    </filter>`;
  document.body.appendChild(svg);
}

// Deterministic ±n jitter — stable across resizes.
function jitter(seed, mag) {
  return Math.sin(seed * 99.7) * mag;
}

function ensurePositioned(host) {
  const cs = getComputedStyle(host);
  if (cs.position === 'static') host.style.position = 'relative';
  if (cs.display === 'inline') host.style.display = 'block';
}

function readWashi(host, params) {
  const cs = getComputedStyle(host);
  const v = (n, d) => cs.getPropertyValue(n).trim() || d;
  const color = params.color === 'currentColor' ? 'oklch(0.86 0.09 160)' : params.color;
  // readParams() defaults mode to 'center' (the global stroke-placement default)
  // when the attribute is absent. Washi has its own placement vocabulary, so
  // we check the raw attribute and fall back to 'corners'.
  const rawMode = host.getAttribute('mode');
  return {
    placement: rawMode || 'corners',
    color,
    color2: v('--washi-color-2', `color-mix(in oklch, ${color}, white 40%)`),
    pattern: v('--washi-pattern', 'stripe'),
    width: parseFloat(v('--washi-width', '30')),
    length: parseFloat(v('--washi-length', '130')),
    angle: v('--washi-angle', ''), // '' → per-strip jitter
    count: parseInt(v('--washi-count', '0'), 10) || 0,
    torn: v('--washi-torn', 'fray'),
    opacity: parseFloat(v('--washi-opacity', '0.86')),
  };
}

// placement → [{ x, y, rot, full? }] in box coords (px).
function layout(p, w, h) {
  const a = p.angle === '' ? null : parseFloat(p.angle);
  const half = p.width / 2;
  switch (p.placement) {
    case 'corner':
      return [
        { x: -14, y: -13, rot: a ?? -38 },
        { x: w - p.length + 14, y: -13, rot: a ?? 38 },
      ];
    case 'corners':
      return [
        { x: -14, y: -13, rot: a ?? -38 },
        { x: w - p.length + 14, y: -13, rot: a ?? 38 },
        { x: -14, y: h - p.width + 13, rot: a ?? -142 },
        { x: w - p.length + 14, y: h - p.width + 13, rot: a ?? 142 },
      ];
    case 'top':
      return [{ x: (w - p.length) / 2, y: -half, rot: a ?? -4 }];
    case 'bottom':
      return [{ x: (w - p.length) / 2, y: h - half, rot: a ?? 3 }];
    case 'left':
      return [{ x: -p.length / 2 + half, y: (h - p.width) / 2, rot: a ?? -86 }];
    case 'right':
      return [{ x: w - p.length / 2 - half, y: (h - p.width) / 2, rot: a ?? 94 }];
    case 'span':
      return [{ x: 0, y: -8, rot: a ?? -1, full: true }];
    case 'scatter': {
      const n = p.count || 4;
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push({
          x: jitter(i, 4) + (i / Math.max(1, n - 1)) * (w - p.length),
          y: jitter(i + 9, 3) + (i % 2 ? h * 0.55 : 8),
          rot: a ?? jitter(i + 3, 4),
        });
      }
      return out;
    }
    default:
      return [];
  }
}

function setPattern(strip, p) {
  const recipe = PATTERN_RECIPES[p.pattern] || PATTERN_RECIPES.stripe;
  strip.style.setProperty('--pat-a', p.color);
  strip.style.setProperty('--pat-b', p.color2);
  strip.style.setProperty('--pat-size', `${Math.max(8, p.width * 0.45)}px`);
  strip.style.setProperty('--bwc-washi-bg', recipe);
}

function applyTorn(strip, torn) {
  if (torn === 'straight') return;
  if (torn === 'soft') {
    const mask =
      'linear-gradient(90deg, transparent, #000 5px, #000 calc(100% - 5px), transparent)';
    strip.style.mask = mask;
    strip.style.webkitMask = mask;
    return;
  }
  ensureTornFilter();
  strip.style.filter = 'url(#bwc-washi-fray)';
}

export function createWashi(host, params) {
  ensurePositioned(host);
  ensureStyles('washi', WASHI_CSS);
  const p = readWashi(host, params);

  const root = document.createElement('div');
  root.setAttribute('data-border-wc', 'washi');
  host.appendChild(root);

  const fit = () => {
    root.innerHTML = '';
    const r = host.getBoundingClientRect();
    const strips = layout(p, r.width, r.height);
    strips.forEach((s, i) => {
      const strip = document.createElement('div');
      strip.className = 'bwc-strip';
      setPattern(strip, p);
      strip.style.width = s.full ? '100%' : `${p.length}px`;
      strip.style.height = `${p.width}px`;
      strip.style.left = s.full ? '0' : `${s.x}px`;
      strip.style.top = `${s.y}px`;
      strip.style.setProperty('--bwc-rot', `${s.rot}deg`);
      strip.style.setProperty('--bwc-rot-from', `${s.rot + (s.rot >= 0 ? -2 : 2)}deg`);
      strip.style.setProperty('--bwc-opacity', String(p.opacity));
      applyTorn(strip, p.torn);
      if (!params.reduce && params.animate !== false) {
        strip.classList.add('bwc-settle');
        strip.style.setProperty('--bwc-delay', `${i * 60}ms`);
      } else {
        strip.style.opacity = String(p.opacity);
        strip.style.transform = `rotate(${s.rot}deg)`;
      }
      root.appendChild(strip);
    });
    if (!params.reduce && params.animate !== false) {
      void root.getBoundingClientRect();
      root.querySelectorAll('.bwc-settle').forEach((el) => el.classList.add('bwc-on'));
    }
  };
  fit();

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    root.remove();
    // Shared #bwc-washi-fray <svg> is intentionally left in the DOM —
    // multiple instances share it and per-instance teardown shouldn't yank
    // it out from under another live host.
  };
}
