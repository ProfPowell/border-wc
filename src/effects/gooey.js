import { roundedRectPath } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS, ensureStyles } from './_helpers.js';

const GOOEY_CSS = `
  @keyframes bwc-goo-orbit { to { offset-distance: 100%; } }
`;

let GOO_INSTANCE = 0;

// Liquid / metaball border: feGaussianBlur + feColorMatrix alpha-boost merge
// circles orbiting along the perimeter (offset-path) into a gooey ring.
export function createGooey(host, params) {
  const svg = attachOverlaySvg(host, 'gooey');
  ensureStyles('gooey', GOOEY_CSS);
  const id = `bwc-goo-${++GOO_INSTANCE}`;
  const color = params.color === 'currentColor' ? 'oklch(0.62 0.2 300)' : params.color;

  const defs = document.createElementNS(SVG_NS, 'defs');
  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  blur.setAttribute('stdDeviation', '7');
  blur.setAttribute('result', 'b');
  const cm = document.createElementNS(SVG_NS, 'feColorMatrix');
  cm.setAttribute('in', 'b');
  cm.setAttribute('mode', 'matrix');
  cm.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9');
  filter.appendChild(blur);
  filter.appendChild(cm);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('filter', `url(#${id})`);
  svg.appendChild(g);

  const N = 7;
  const dur = Math.max(2600, params.speed * 4);

  const fit = () => {
    g.innerHTML = '';
    const r = host.getBoundingClientRect();
    const radius = resolveRadius(host, params);
    const d = roundedRectPath({ width: r.width, height: r.height, radius, inset: 8 });
    const base = document.createElementNS(SVG_NS, 'path');
    base.setAttribute('d', d);
    base.setAttribute('fill', color);
    g.appendChild(base);
    for (let i = 0; i < N; i++) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('r', String(9 + (i % 3) * 3));
      c.setAttribute('fill', color);
      c.style.offsetPath = `path('${d}')`;
      c.style.offsetDistance = `${(i / N) * 100}%`;
      if (!params.reduce && params.animate !== false) {
        c.style.animation = `bwc-goo-orbit ${dur}ms linear infinite`;
        c.style.animationDelay = `-${((i / N) * dur) | 0}ms`;
      }
      g.appendChild(c);
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
