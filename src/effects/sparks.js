import { roundedRectPath } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, ensureStyles, SVG_NS } from './_helpers.js';

const SPARKS_CSS = `
  @keyframes bwc-sparks-orbit { to { offset-distance: 100%; } }
`;

// Three SVG circles riding offset-path around the rounded-rect perimeter,
// with staggered animation-delay creating a comet-tail. Refactored from the
// canvas particle trail — same look, fewer pixels, themeable by cascade.
export function createSparks(host, params) {
  ensureStyles('sparks', SPARKS_CSS);
  const svg = attachOverlaySvg(host, 'sparks');
  const color = params.color === 'currentColor' ? '#fff7c4' : params.color;

  const fit = () => {
    svg.innerHTML = '';
    const r = host.getBoundingClientRect();
    const d = roundedRectPath({
      width: r.width,
      height: r.height,
      radius: resolveRadius(host, params),
      inset: params.thickness / 2,
    });
    const dur = Math.max(400, params.speed);
    const TRAIL = 3;
    for (let i = 0; i < TRAIL; i++) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', '0');
      c.setAttribute('cy', '0');
      c.setAttribute('r', String(Math.max(2, params.thickness * 1.2) - i * 0.6));
      c.setAttribute('fill', color);
      c.setAttribute('opacity', String(1 - i * 0.3));
      c.style.offsetPath = `path('${d}')`;
      c.style.offsetRotate = '0deg';
      c.style.offsetDistance = '0%';
      if (!params.reduce && params.animate !== false) {
        c.style.animation = `bwc-sparks-orbit ${dur}ms linear infinite`;
        c.style.animationDelay = `-${i * (dur / 18)}ms`;
      }
      svg.appendChild(c);
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
