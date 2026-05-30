import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS, ensureStyles } from './_helpers.js';

const MEMPHIS_CSS = `
  @keyframes bwc-memphis-bob {
    0%, 100% { transform: translateY(0) rotate(var(--bwc-rot, 0deg)); }
    50% { transform: translateY(-4px) rotate(calc(var(--bwc-rot, 0deg) + 8deg)); }
  }
`;

const PALETTE = [
  'oklch(0.65 0.22 25)',
  'oklch(0.78 0.16 90)',
  'oklch(0.6 0.16 250)',
  'oklch(0.55 0.18 160)',
  'oklch(0.22 0.02 50)',
];

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

// Memphis confetti: arc-length sampler scatters small mixed shapes around the
// perimeter; each bobs in place with a staggered animation-delay. Palette is
// intentional — the Memphis look is the four-colour clash.
export function createMemphis(host, params) {
  const svg = attachOverlaySvg(host, 'memphis');
  ensureStyles('memphis', MEMPHIS_CSS);
  svg.style.overflow = 'visible';
  const dur = Math.max(1200, params.speed * 2.4);

  const fit = () => {
    svg.innerHTML = '';
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const sampler = roundedRectSampler({
      width: r.width,
      height: r.height,
      radius,
      inset: -6,
    });
    const perim = 2 * (r.width + r.height);
    const N = Math.max(14, Math.round(perim / 46));
    const rand = rng(1234);
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const [x, y] = sampler(t);
      const col = PALETTE[(i + ((rand() * 5) | 0)) % PALETTE.length];
      const rot = rand() * 60 - 30;
      const kind = i % 4;
      const outer = document.createElementNS(SVG_NS, 'g');
      outer.setAttribute('transform', `translate(${x} ${y})`);
      const inner = document.createElementNS(SVG_NS, 'g');
      inner.style.setProperty('--bwc-rot', `${rot}deg`);
      inner.style.transformBox = 'fill-box';
      inner.style.transformOrigin = 'center';
      if (!params.reduce && params.animate !== false) {
        inner.style.animation = `bwc-memphis-bob ${dur}ms ease-in-out infinite`;
        inner.style.animationDelay = `-${(t * dur) | 0}ms`;
      } else {
        inner.setAttribute('transform', `rotate(${rot})`);
      }
      let shape;
      if (kind === 0) {
        shape = document.createElementNS(SVG_NS, 'circle');
        shape.setAttribute('r', '4.5');
        shape.setAttribute('fill', col);
      } else if (kind === 1) {
        shape = document.createElementNS(SVG_NS, 'rect');
        shape.setAttribute('x', '-4');
        shape.setAttribute('y', '-4');
        shape.setAttribute('width', '8');
        shape.setAttribute('height', '8');
        shape.setAttribute('fill', col);
      } else if (kind === 2) {
        shape = document.createElementNS(SVG_NS, 'path');
        shape.setAttribute('d', 'M0,-6 L5,5 L-5,5 Z');
        shape.setAttribute('fill', col);
      } else {
        shape = document.createElementNS(SVG_NS, 'path');
        shape.setAttribute('d', 'M-6,0 Q-3,-7 0,0 T6,0');
        shape.setAttribute('fill', 'none');
        shape.setAttribute('stroke', col);
        shape.setAttribute('stroke-width', '2.4');
        shape.setAttribute('stroke-linecap', 'round');
      }
      inner.appendChild(shape);
      outer.appendChild(inner);
      svg.appendChild(outer);
    }
  };
  fit();

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    ro.disconnect();
    svg.remove();
  };
}
