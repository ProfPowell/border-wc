import { roundedRectSampler } from '../perimeter.js';
import { resolveRadius } from '../params.js';
import { attachOverlaySvg, SVG_NS } from './_helpers.js';

let UID = 0;

// Builds an SVG path string of a jagged zigzag from (x1,y1) to (x2,y2) with
// perpendicular jitter applied to interior points.
function jaggedSegment(x1, y1, x2, y2, jitter) {
  const STEPS = 6;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  let d = '';
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const j = i === 0 || i === STEPS ? 0 : (Math.random() - 0.5) * jitter;
    const x = x1 + dx * t + nx * j;
    const y = y1 + dy * t + ny * j;
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return d.trim();
}

// Electric bolts anchored at evenly-spaced perimeter points, drawn through a
// feGaussianBlur+feMerge filter for a real glow. Strikes flicker a random
// subset to opacity 1 each tick; the rest fade via CSS transition. This is the
// refactor from canvas+shadowBlur — cleaner, themable, and still dramatic.
export function createLightning(host, params) {
  const svg = attachOverlaySvg(host, 'lightning');
  const id = `bwc-light-${++UID}`;

  const defs = document.createElementNS(SVG_NS, 'defs');
  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');
  const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '3');
  blur.setAttribute('result', 'blur');
  const merge = document.createElementNS(SVG_NS, 'feMerge');
  for (let i = 0; i < 2; i++) {
    const n = document.createElementNS(SVG_NS, 'feMergeNode');
    n.setAttribute('in', 'blur');
    merge.appendChild(n);
  }
  const src = document.createElementNS(SVG_NS, 'feMergeNode');
  src.setAttribute('in', 'SourceGraphic');
  merge.appendChild(src);
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('filter', `url(#${id})`);
  svg.appendChild(g);

  const color = params.color === 'currentColor' ? '#bcd6ff' : params.color;

  const fit = () => {
    g.innerHTML = '';
    const r = host.getBoundingClientRect();
    const sampler = roundedRectSampler({
      width: r.width,
      height: r.height,
      radius: resolveRadius(host, params),
      inset: params.thickness / 2,
    });
    const perim = 2 * (r.width + r.height);
    const N = Math.max(4, Math.min(10, Math.floor(perim / 140)));
    for (let i = 0; i < N; i++) {
      const t1 = i / N;
      const t2 = (i + 0.25) / N;
      const [x1, y1] = sampler(t1);
      const [x2, y2] = sampler(t2 % 1);
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', jaggedSegment(x1, y1, x2, y2, params.thickness * 5));
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', color);
      p.setAttribute('stroke-width', String(Math.max(1.5, params.thickness)));
      p.setAttribute('stroke-linecap', 'round');
      if (params.reduce || params.animate === false) {
        p.setAttribute('opacity', '0.9');
      } else {
        p.style.opacity = '0';
        p.style.transition = 'opacity 80ms linear';
      }
      g.appendChild(p);
    }
  };
  fit();

  let raf = 0;
  let lastTick = 0;
  function strike(now) {
    if (now - lastTick > Math.max(180, params.speed / 4)) {
      lastTick = now;
      const paths = g.querySelectorAll('path');
      paths.forEach((p) => (p.style.opacity = '0'));
      const k = Math.max(1, Math.floor(paths.length / 3));
      for (let i = 0; i < k; i++) {
        const idx = Math.floor(Math.random() * paths.length);
        paths[idx].style.opacity = '1';
      }
    }
    raf = requestAnimationFrame(strike);
  }
  if (!params.reduce && params.animate !== false) raf = requestAnimationFrame(strike);

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    svg.remove();
  };
}
